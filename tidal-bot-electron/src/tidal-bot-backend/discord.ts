import BadWords from 'bad-words';
import debug from 'debug';
import Discord, { Message, VoiceChannel, VoiceConnection, Activity, RichPresenceAssets, TextChannel } from 'discord.js';
import TidalBot from '.';
import _config from './config.json';
import DiscordResponses from './discord-responses';
import fetch from 'node-fetch';
import { Track } from './tidal/types';
import Main from '../main';
import { readFileSync } from 'fs';
import { Readable } from 'stream'
import path from 'path';

const logger = debug('tb:discord');

interface Config {
  token: string;
  prefix: string;
  lastChannel?: string;
  defaultChannel?: string;
}

// config
const config: Config = _config; // duh.

export default class DiscordStreamable {
  private static readonly startupSounds = [
    "https://discordapp.com/assets/ad322ffe0a88436296158a80d5d11baa.mp3",
    "https://discordapp.com/assets/b9411af07f154a6fef543e7e442e4da9.mp3",
    "../../startup/ready.wav",
    "../../startup/i-will-be-there.wav",
    "../../startup/what-do-you-want.wav",
    "../../startup/what-can-i-do.wav",
  ];

  async imThereBuddy() {
    const sound = DiscordStreamable.startupSounds[Math.floor(Math.random() * DiscordStreamable.startupSounds.length)];    ;

    if(!sound.startsWith('.')){
      this.playURL(sound);
    } else {
      const soundBuffer = readFileSync(path.resolve(__dirname, sound));
      const readableInstanceStream = new Readable({
        read() {
          this.push(soundBuffer);
          this.push(null);
        }
      });
      this.playURL(readableInstanceStream);
    }
  }

  private readonly profanity = new BadWords();
  public readonly client = new Discord.Client();
  public readonly respondWith = new DiscordResponses(this);

  get user() {
    return this.client.user;
  }

  async setStatus(labelOrTrack: string | Track, status: Discord.PresenceStatusData) {
    let activityText;

    if (typeof labelOrTrack === 'object') {
      activityText = `${labelOrTrack.title} - ${labelOrTrack.artists.map(artist => artist.name).join(', ')}`;
    } else {
      activityText = labelOrTrack;
    }

    this.user.setPresence({
      status,
      activity: {
        name: activityText,
        type: 'WATCHING'
      }
    });

    if (typeof labelOrTrack !== 'string') {
      const imageURL = this.bot.manager.getCoverURL(labelOrTrack);

      const image = await fetch(imageURL);
      const imageBuff = Buffer.from(await image.arrayBuffer());

      logger('Change avatar to cover ' + imageURL)
      try {
        await this.user.setAvatar(imageBuff);
      } catch (e) {
        const [firstLine, ...rest] = (e as Error).message.split('\n')
        Main.mainWindow.webContents.send(
          'tb-toast',
          firstLine,
          rest.join('\n')
        )
      }
    }
  }

  destroy() {
    this.voiceConnections.forEach(connection => {
      connection.disconnect();
    });
    this.user.setStatus('invisible');
    this.setStatus("Offline.", 'invisible');
  }


  constructor(private readonly bot: TidalBot) {

    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
      this.setStatus('Ready ' + (new Date()).toLocaleString(), 'idle');
      this.imThereBuddy()
    });

    this.client.on('message', this.handleMessage.bind(this));

    const logger = debug('tb:client:debug')
    this.client.on('debug', logger);

    this.client.login(config.token);
  }

  async getVoiceChannels(): Promise<VoiceChannel[]> {
    const voiceChannels = [];

    this.client.guilds.cache.forEach(guild => {
      guild.channels.cache.forEach((channel: VoiceChannel) => {
        if (channel.type === 'voice') {
          voiceChannels.push(channel)
        }
      })
    });

    return voiceChannels;
  }

  async handleMessage(message: Message) {
    const forMe = message.mentions.has(this.user);
    const { cleanContent, author, member, createdTimestamp } = message;

    // TODO: replace with userId and content of message instead. It's safer. I'm lazy tho
    const content = cleanContent.replace('@' + this.user.username, '').trim();

    if (!forMe) {
      return;
    }

    const isURL = () => {
      try {
        new URL(content);
      } catch (e) {
        return false;
      }

      return true;
    };

    this.saveChannel(message.channel);

    switch (true) {
      case !!content.match(/\.\w/i): {
        const [fullMatch, subCommand] = content.match(/\.(\w+)/i)
        switch (subCommand.toLowerCase()) {
          case 'pause': return this.bot.queueManager.pause();
          case 'resume': return this.bot.queueManager.resume();
          case 'queue': return this.respondWith.queueOverview(
            this.bot.queueManager.getQueue(),
            message
          );
          default: return this.respondWith.notImplemented(message);
        }
      }
      case !!content.match(/ping/i):
        return this.respondWith.pong(message);
      case !!content.match(/(join(?!.*me)|come.*alive|cum|move.*ass)/i):
        return this.respondWith.joinSendersVoiceChannel(message);
      case isURL(): {
        message.reply([
          "URL support will be added shortly.",
          "It's not easy to know which URL is needed to be downloaded and which is a directly playable source.",
          "",
          "Try the song title instead."
        ].join('\n'));
        return;
      }
      default: {
        const result = await this.bot.handlePlayRequest(null, {
          type: 'search',
          query: content,
          sender: message
        });

        if (!result) {
          if (this.profanity.isProfane(content)) {
            return this.respondWith.somethingProfane(message);
          } else {
            this.respondWith.noSongFound(message)
          }
        }
      }
    }
  }
  saveChannel(channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel) {
    this.bot.setConfig('lastChannelID', channel.id);
  }

  get voiceConnections() {
    return this.client.voice.connections;
  }

  /**
   * Give me a break.
   */
  async getFirstVoiceConnectionOtherwiseFirstVoiceChannelJoinedConnection(): Promise<VoiceConnection> {
    let voiceConnection = this.voiceConnections.first()

    if (!voiceConnection) {
      const [firstChannel] = await this.getVoiceChannels();

      if (firstChannel) {
        return firstChannel.join();
      }
    }

    return voiceConnection;
  }

  async playURL(url: Readable | string, track?: Track, userId?: string) {
    const connection = await this.getFirstVoiceConnectionOtherwiseFirstVoiceChannelJoinedConnection();
    const dispatcher = connection.play(url);

    if (userId) {
      const userWhoRequested = await this.client.users.fetch(userId);
      userWhoRequested.send("I'm now playing the song you requested. Have fun!");
    }

    this.sendNowPlayingIfPossible(track);

    dispatcher.on('start', () => {
      this.setStatus(track, 'online');
    });

    dispatcher.on('finish', () => {
      this.setStatus('Nothing to play. Ready.', 'idle');
    });

    const logger = debug('tb:stream');

    dispatcher.on('debug', logger);
    return dispatcher;
  }

  async sendNowPlayingIfPossible(track: Track) {
    if (!track) {
      return;
    }
  
    if (this.bot.config.lastChannelID) {
      const channel = await this.client.channels.fetch(this.bot.config.lastChannelID);
      if (channel instanceof TextChannel) {
        this.respondWith.nowPlaying(track, channel);
      }
    }
  }
}