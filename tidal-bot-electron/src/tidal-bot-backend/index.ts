import { ipcMain, IpcMainEvent } from 'electron';
import * as fs from 'fs';
import { homedir } from 'os';
import * as path from 'path';
import DiscordStreamable from './discord';
import TidalManager, { Track } from './tidal';
import { Credentials, UI } from './types';
import Utils from './utils';
import { Message, VoiceChannel } from 'discord.js';
import debug from 'debug';
import Main from '../main';

const logger = debug('tb:lobby');

export enum TidalState {
  Initializing,
  NoLogin,
  Invalid,
  Valid
}

interface BaseDiscordRequested {
  sender?: Message;
}

export interface PlaySearchRequest extends BaseDiscordRequested {
  type: 'search',
  query: string;
}

export interface SpecificTrack extends BaseDiscordRequested {
  type: 'track',
  track: Track;
}

export type PlayRequest = PlaySearchRequest | SpecificTrack;

export interface JoinVoiceRequest {
  id: string;
}

interface FunctionRequest {
  function: string;
  arguments: any[];
}

export default class TidalBot {
  manager: TidalManager;
  discord: DiscordStreamable = new DiscordStreamable(this);

  _state: TidalState;

  get state() {
    return this._state;
  }

  set state(newState: TidalState) {
    this._state = newState;
  }

  constructor() {
    try {
      this.initApi();
    } catch (e) {
      this.state = TidalState.NoLogin;
    }

    ipcMain.on('tb-play', this.handlePlayRequest.bind(this));
    ipcMain.on('tb-tidal-eval', this.handleGenericTidalRequest.bind(this));
    ipcMain.on('tb-discord-eval', this.handleGenericDiscordRequest.bind(this));
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
    (channel as VoiceChannel).join();
  }

  async handlePlayRequest(event: IpcMainEvent | null, request: PlayRequest) {
    switch (request.type) {
      case "search": {
        const track = await this.findFirstTrack(request.query)
        return this.streamTrack(track)
      }
      case "track": {
        return this.streamTrack(request.track)
      }
      default: return null;
    }

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

  async streamTrack(track: Track, event?: IpcMainEvent, request?: PlayRequest) {
    if (!track.streamReady || !track.allowStreaming) {
      request.sender.reply('Sorry, this title cannot be streamed.');

      if (track.premiumStreamingOnly) {
        request.sender.reply('The requested title is only for premium members, the master-dj is not.');
      }
      return false;
    }

    let streaming = await this.manager.getStreamURL(track.id);

    this.discord.playURL(streaming.url, track.title);

    if (event) { // not sure if I really neeed that
      event.sender.send('tb-streaming', track)
    }

    Main.mainWindow.webContents.send('tb-streaming', track);

    if (request.sender) {
      request.sender.reply(`${track.title} - ${track.artists.map(artist => artist.name).join(', ')}\n${track.url}`);
      request.sender.react('✔');
    }

    return true;
  }

  validateState() {
    if (this.state !== TidalState.Valid) {
      throw new Error('Not logged in');
    }
  }

  /**
   * Stores credentials, then initialize TidalApp with given credentials.
   * @param creds 
   */
  setCredentials(creds: Credentials) {
    this.persistCredentials(creds);
    this.initApi();
  }

  /**
   * Save's the given credentials in an file - so we can read them next time
   * we start the application.
   * @param creds 
   */
  persistCredentials(creds: Credentials) {
    const credsString = JSON.stringify(creds);

    fs.writeFile(this.credentialsPath, credsString, Utils.noop);
  }

  /**
   * Returns the stored credentials. Otherwise, null.
   */
  getCredentials(): Credentials {
    if (!fs.existsSync(this.credentialsPath)) {
      throw new Error('Credentials do not exist');
    } else {
      return JSON.parse(fs.readFileSync(this.credentialsPath).toString());
    }
  }

  /**
   * Returns the path where to write the credentials to.
   */
  get credentialsPath() {
    return path.resolve(homedir(), './.tidal-bot-creds');
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

    this.state = TidalState.Valid;
  }
}

// api.search({ type: 'artists', query: 'Dream Theater', limit: 1 }, function (err, data, headers) {
//   console.log(data.artists);
// })

// api.search({ type: 'albums', query: 'Dream Theater', limit: 1 }, function (err, data, headers) {
//   console.log(data.albums);
// })

// api.search({ type: 'tracks', query: 'Dream Theater', limit: 1 }, function (err, data, headers) {
//   console.log(data.tracks);
// })

// api.search({ type: 'tracks,albums,artists', query: 'Dream Theater', limit: 1 }, function (err, data, headers) {
//   console.log(data.tracks);
//   console.log(data.albums);
//   console.log(data.artists);
// // })

// api.getTrackInfo({ id: 22560696 }, function (err, data, headers) {
//   console.log(data)
// })

// api.getStreamURL({ id: 22560696 }, function (err, data, headers) {
//   console.log(data)
// })

// api.getVideoStreamURL({ id: 25470315 }, function (err, data, headers) {
//   console.log(data)
// })

// console.log(api.getArtURL('24f52ab0-e7d6-414d-a650-20a4c686aa57', 1280)) //coverid

// api.getArtistVideos({ id: 14670, limit: 2 }, function (err, data, headers) {
//   console.log(data)
// })

// api.genMetaflacTags({ id: 22560696, coverPath: './albumart.jpg', songPath: './song.flac' }, function (err, data, headers) {
//   console.log(data)
// });