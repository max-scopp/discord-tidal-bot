import BadWords from 'bad-words';
import debug from 'debug';
import Discord, { Message, VoiceChannel, VoiceConnection } from 'discord.js';
import TidalBot from '.';
import _config from './config.json';
import DiscordResponses from './discord-responses';

interface Config {
  token: string;
  prefix: string;
  lastChannel?: string;
  defaultChannel?: string;
}

// config
const config: Config = _config; // duh.

export default class DiscordStreamable {

  private readonly profanity = new BadWords();
  public readonly client = new Discord.Client();
  private readonly respondWith = new DiscordResponses(this);

  get user() {
    return this.client.user;
  }

  /**
   * 
   * @param activityText 
   * @param status 
   * @param type Use LISTENING when streaming a song. Use STREAMING when streaming a video.
   */
  setStatus(activityText: string, status: Discord.PresenceStatusData, type: 'WATCHING' | 'LISTENING' | 'STREAMING' = 'WATCHING') {
    this.user.setPresence({
      activity: {
        name: activityText,
        type
      }, status
    })
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
      this.setStatus('Serving Senpai since ' + (new Date()).toLocaleString(), 'idle');
    });

    this.client.on('message', this.handleMessage.bind(this));

    const logger = debug('tg:client:debug')
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

    switch (true) {
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

        if (result === false) {
          if (this.profanity.isProfane(content)) {
            return this.respondWith.somethingProfane(message);
          } else {
            this.respondWith.noSongFound(message)
          }
        }
      }
    }
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

  async playURL(url: string, title?: string) {
    const connection = await this.getFirstVoiceConnectionOtherwiseFirstVoiceChannelJoinedConnection();
    const dispatcher = connection.play(url);

    dispatcher.on('start', () => {
      this.setStatus(title, 'online', 'LISTENING');
    });

    dispatcher.on('finish', () => {
      this.setStatus('Nothing to play. Ready.', 'idle');
    });

    const logger = debug('tb:stream:dispatcher');
    dispatcher.on('debug', logger);
    dispatcher.on('error', console.error);
  }
}