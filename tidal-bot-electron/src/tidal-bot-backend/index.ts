import debug from 'debug';
import { VoiceChannel, Message, MessageEmbed, StreamDispatcher } from 'discord.js';
import { ipcMain, IpcMainEvent } from 'electron';
import * as fs from 'fs';
import { homedir } from 'os';
import * as path from 'path';
import Main from '../main';
import DiscordStreamable from './discord';
import TidalManager from './tidal';
import { FunctionRequest, PlayRequest, UI, SpecificTrack, Configuration } from './types';
import Utils from './utils';
import { Track, Credentials } from './tidal/types';
import { searchLyrics } from './lyrics';
import { getAlbumArt, SizeOptions } from './tidal/utils';
import QueueManager from './queue';

const logger = debug('tb:lobby');

// TODO: possibly replace with a more "trusted" url, this may change
const geniusIcon = "https://images.genius.com/1d88f9c0c8623d60cf6d85ad3b38a6de.999x999x1.png";

export enum BotState {
  Initializing,
  NoLogin,
  Invalid,
  Valid
}

export enum PlayState {
  Playing = "playing",
  Paused = "paused",
  Ended = "ended"
}

export default class TidalBot {
  manager: TidalManager;
  discord: DiscordStreamable = new DiscordStreamable(this);

  _state: BotState;

  queueManager: QueueManager = new QueueManager(this.discord);

  get state() {
    return this._state;
  }

  set state(newState: BotState) {
    this._state = newState;
  }

  constructor() {
    this.initApi();

    ipcMain.on('tb-play', this.handlePlayRequest.bind(this));
    ipcMain.on('tb-tidal-eval', this.handleGenericTidalRequest.bind(this));
    ipcMain.on('tb-discord-eval', this.handleGenericDiscordRequest.bind(this));
    ipcMain.on('tb-connector-eval', this.handleRequest.bind(this));
  }

  destroy() {
    this.manager.destroy()
    this.discord.destroy()
  }

  /**
   * ! IMPORTANT:
   * ! - Always return literals, no classes.
   * ! - Don't add unsafe arguments, like user-input
   * ! - Don't call functions by strings
   * ! - Always map things, don't be a fucking lazy fuck
   * @param event 
   * @param request 
   */
  async handleRequest(event: IpcMainEvent, request: FunctionRequest) {
    let result;
    switch (request.function) {
      case 'next':
        this.queueManager.next();
        break;
      case 'setPlayState':
        this.setPlayState(request.arguments[0]);
        break;
      case 'getPlayState':
        this.getPlayState();
        break;
      default: {
        logger('Unable to handle generic request. Function not known. ', request.function)
      }
    }

    event.sender.send('tb-discord-return:' + request.function, result);
  }

  setPlayState(newPlayState: PlayState) {
    switch (newPlayState) {
      case PlayState.Paused: {
        return this.queueManager.pause();
      }
      case PlayState.Playing: {
        return this.queueManager.resume();
      }
      case PlayState.Ended: {
        return this.queueManager.endCurrent();
      }
    }
  }

  /**
   * If `playing` is set, something is playing, or is currently paused.
   * If `playing` is NOT set, there is nothing to play and therefor has been set as "ended".
   * 
   * There is no definition of "nothing ever played".
   */
  getPlayState() {
    return this.queueManager.getPlayState();
  }


  /**
   * ! IMPORTANT:
   * ! - Always return literals, no classes.
   * ! - Don't add unsafe arguments, like user-input
   * ! - Don't call functions by strings
   * ! - Always map things, don't be a fucking lazy fuck
   * @param event 
   * @param request 
   */
  async handleGenericDiscordRequest(event: IpcMainEvent, request: FunctionRequest) {
    let result;
    switch (request.function) {
      case 'getGuilds':
        result = this.discord
        break;
      case 'getVoiceChannels':
        result = (await this.discord.getVoiceChannels())
          .map((channel): UI.Channel => ({
            bitrate: channel.bitrate,
            id: channel.id,
            userLimit: channel.userLimit,
            parentID: channel.parentID,
            createdTimestamp: channel.createdTimestamp,
            name: channel.name,
            full: channel.full,
            joinable: channel.joinable,
            speakable: channel.speakable,
          }))
        break;
      case 'joinVoiceChannel':
        this.handleVoiceJoinRequest(String(request.arguments[0]));
        break;
      default: {
        logger('Unable to handle generic request. Function not known. ', request.function)
      }
    }

    event.sender.send('tb-discord-return:' + request.function, result);
  }

  /**
   * ! IMPORTANT:
   * ! - Always return literals, no classes.
   * ! - Don't add unsafe arguments, like user-input
   * ! - Don't call functions by strings
   * ! - Always map things, don't be a fucking lazy fuck
   * @param event 
   * @param request 
   */
  async handleGenericTidalRequest(event: IpcMainEvent, request: FunctionRequest) {
    let result;
    switch (request.function) {
      case 'getPlaylists':
        result = await this.manager.getPlaylists();
        break;
      case 'getFavorites':
        result = await this.manager.getFavorites(...request.arguments);
        break;
    }

    event.sender.send('tb-tidal-return:' + request.function, result);
  }

  async handleVoiceJoinRequest(id: string) {
    const channel = await this.discord.client.channels.fetch(id);
    this.setConfig('lastVoiceChannelID', channel.id);
    return (channel as VoiceChannel).join();
  }

  /**
   * Returns false if the request failed, true on success.
   * MAY return null when the request was unable to be handled (malformed).
   * @param event 
   * @param request 
   */
  async handlePlayRequest(event: IpcMainEvent | null, request: PlayRequest) {
    let track = null;
    switch (request.type) {
      case "search": {
        const foundTrack = await this.findFirstTrack(request.query)

        if (!foundTrack) {
          return false;
        } else {
          track = foundTrack
        }

        break;
      }
      case "track": {
        track = (request as SpecificTrack).track;
        break;
      }
      default: return null;
    }

    const fromDiscordMessage = request.sender;

    if (!fromDiscordMessage) {
      return this.streamTrack(track, event, request);
    } else {
      const didQueue = this.queueManager.pushExternal(
        track,
        this.getStreamURLFromTidalFactory(track),
        request.sender.author
      );

      if (didQueue) {
        if (request.sender) {
          request.sender.react('🆗');
          this.showPlayEmbed(track, request.sender, [
            "I've queued your request and will notify you when it's playing.",
            "You can cancel this request by telling me to `.stop`."
          ]);
        }
      }
    }

    return true;
  }

  async findFirstTrack(query: string) {
    const firstMatch = await this.manager.search(
      ['tracks', 'albums', 'artists'],
      query,
      1
    );

    console.dir({
      query,
      firstMatch
    });

    const [_firstTrack] = firstMatch.tracks.items;
    const firstTrack = _firstTrack as Track;

    return firstTrack || false;
  }

  /**
   * Returns a new function whose can be called to
   * retrieve the *url* to stream a track from tidal.
   * @param track 
   */
  getStreamURLFromTidalFactory(track: Track): () => Promise<string> {
    return () => this.manager.getStreamURL(track)
      .then(result => result.url);
  }

  async streamTrack(track: Track, event?: IpcMainEvent, request?: PlayRequest) {
    event; // TODO:event do something with that
    if (!track.streamReady || !track.allowStreaming) {
      request.sender.reply('Sorry, this title cannot be streamed.');

      if (track.premiumStreamingOnly) {
        request.sender.reply('The requested title is only for premium members, the master-dj is not.');
      }
      return false;
    }

    let streaming = await this.manager.getStreamURL(track);

    // userId of author, otherwise undefined
    const userId = request && request.sender && request.sender.author.id;

    this.queueManager.play(streaming.url, track, userId);

    return true;
  }

  async showPlayEmbed(track: Track, sender: Message, messagePreflight?: string | string[]) {
    //this.showLyrics(track, sender);

    const embed = new MessageEmbed();

    const description = [
      track.artists.map(
        artist => artist.type === "MAIN"
          ? `**${artist.name}**`
          : artist.name
      ),
      [
        `${track.explicit ? '(explicit)' : ''}`
      ].join(' ')
    ]

    const fields = [
      {
        name: 'Copyright',
        value: track.copyright,
        inline: true
      },
      {
        name: 'Length',
        value: `${track.duration} seconds`,
        inline: true
      },
      {
        name: 'Popularity',
        value: track.popularity,
        inline: true
      },
      {
        name: 'Audio Quality',
        value: [
          `Modes: ${track.audioModes}`,
          `Qualities: ${track.audioQuality}`,
        ],
        inline: true
      },
    ]

    const albumCover = getAlbumArt(track.album.cover, SizeOptions.Normal);

    embed
      .setColor('#9dff00')
      .setTitle(track.title)
      .setDescription(description)
      .setAuthor(
        "DiscordTidalBot",
        null,
        "https://github.com/max-scopp/discord-tidal-bot"
      )
      .setURL(track.url)
      .setThumbnail(albumCover)
      .addFields(
        ...fields
      )
      .setTimestamp()
      .setFooter("Song provided by TIDAL");
    
    if(messagePreflight){
      sender.reply(messagePreflight);
    }

    sender.channel.send(embed);
  }

  async showLyrics(track: Track, sender: Message) {
    const query = `${track.artists.filter(artist => artist.type === "MAIN").map(artist => artist.name)} ${track.title}`
      .replace(/(version|originally|performed|instrumental|\)|\(|various\sartists?)/gi, '')
      .replace(/\s+/gi, ' ')
    console.log('query', query)
    const lyrics = await searchLyrics(query);

    if (lyrics) {
      sender.react('🎙');

      let totalThrottled = 0;
      const throttle = 800;
      let didCancel: false | number = false;

      lyrics.lyrics.forEach(message => {
        if (totalThrottled < (1e3 * 10)) {
          setTimeout(() => {
            const [firstLine, ...lines] = message.split('\n');
            const richVerse = new MessageEmbed()

            // if the first line is like:
            // [Intro...something]
            // INTRO...something
            // "(" and ")" are not matches because they may signify actual lyrical content.
            if (firstLine.match(/(^[\[]|^[A-Z]{2,})/)) {
              richVerse.setTitle(firstLine.replace(/(^[\[]|[\]]$)/g, ''))
              richVerse.setDescription(lines.join('\n'))
            } else {
              richVerse.setDescription(message);
            }

            richVerse.setFooter("GENIUS", geniusIcon);

            sender.channel.send(richVerse)
          }, totalThrottled)
        } else if (!didCancel) {
          didCancel = totalThrottled;
        }

        totalThrottled += throttle;
      });

      const richLyrics = new MessageEmbed()
        .setColor('#ff0080')
        .setTitle('[LYRICS] ' + lyrics.header)
        .setURL(lyrics.url)
        .addField("Dev Detail", `To avoid queue-congestion, each verse is throttled by ${throttle}ms, this time totalling a delay of ${totalThrottled / 1e3}s.`)
        .setThumbnail(geniusIcon)
        .setFooter("Lyrics by GENIUS", geniusIcon)

      if (didCancel) {
        richLyrics.addField('**!IMPORTANT!**', `The lyrics are NOT complete. The server would be overloaded. Hard stop was after ${didCancel / 1e3}s, therefor creating ${didCancel / throttle} messages.`)
      }

      if (lyrics.delay) {
        richLyrics.addField("API Notice", `The document for the lyrics was malformed. An delay of ${lyrics.delay / 1e3}s was created.`);
      }

      sender.channel.send(richLyrics);
    } else {
      sender.react('🔇');
      sender.reply(`There are no lyrics!`);
    }
  }

  validateState() {
    if (this.state !== BotState.Valid) {
      throw new Error('Not logged in');
    }
  }

  /**
   * Stores credentials, then initialize TidalApp with given credentials.
   * @param creds 
   */
  setCredentials(creds: Credentials) {
    this._config = {
      ...this.config,
      ...creds
    }
    this.persistConfig();
    this.initApi();
  }

  setConfig(key: string, value: string) {
    this.config[key] = value;
    this.persistConfig();
  }

  /**
   * Save's the given credentials in an file - so we can read them next time
   * we start the application.
   * @param creds 
   */
  persistConfig() {
    const credsString = JSON.stringify(this._config);

    fs.writeFile(this.configPath, credsString, Utils.noop);
  }

  loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      throw new Error('Configuration does not exist.');
    } else {
      this._config = JSON.parse(fs.readFileSync(this.configPath).toString());
    }
  }

  private _config: Configuration;

  get config() {
    if (!this._config) {
      this.loadConfig();
    }

    return this._config;
  }



  /**
   * Returns the stored credentials. Otherwise, null.
   */
  getCredentials(): Credentials {
    const { username, password } = this.config;

    if (!username || !password) {
      throw new Error('Credentials do not exist.');
    }

    return {
      username,
      password
    };
  }

  /**
   * Returns the path where to write the credentials to.
   */
  get configPath() {
    return path.resolve(homedir(), './.tidal-bot');
  }

  /**
   * Initialized the TidalAPI.
   * Deconstructs the previous instance, if applicable.
   */
  initApi() {
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }

    const credentials = this.getCredentials();

    this.manager = new TidalManager({
      ...credentials,
      quality: 'HIGH' // TODO: Make configuratable
    });

    console.log('TidalManager init')
    console.log(this.manager);

    this.state = BotState.Valid;
  }
}