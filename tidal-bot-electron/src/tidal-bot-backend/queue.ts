import { StreamDispatcher, User } from "discord.js";
import Main from "../main";
import { PlayState } from ".";
import { Track, StreamingResult } from "./tidal/types";
import DiscordStreamable from "./discord";
import debug from 'debug';

interface ExternalQueueItem extends QueueItem {
  user: string;
}

interface QueueItem {
  url: string | ResolvableURL;
  track: Track;
}

export interface QueueOverview {
  nowPlaying: Track;
  master: QueueItem[];
  external: ExternalQueueItem[];
}

/**
 * A function that will return the URL
 * to stream a track when called.
 */
type ResolvableURL = () => Promise<string>;

const logger = debug('tb:queue');

/**
 * This class handles all requests to stream something.
 * - [ ] Add non-mastering requests
 * - [ ] master queue takes priority
 * - [ ] infinity queue
 */
export default class QueueManager {
  private externalQueue: ExternalQueueItem[] = [];
  private masterQueue: QueueItem[] = [];

  _playing: StreamDispatcher;

  currentTrack: Track;

  constructor(private readonly discord: DiscordStreamable) {

  }


  private setPlaying(dispatcher: StreamDispatcher, track?: Track) {
    if (!dispatcher && track) {
      throw new Error('Cannot set `playing`, an StreamDispatcher is required if you provide an track.');
    }

    this._playing = dispatcher;
    this.currentTrack = track;

    this.sendStateToUI();
  }

  private get playing() {
    return this._playing;
  }

  getPlayState() {
    if (this.playing) {
      if (this.playing.paused) {
        return PlayState.Paused;
      }

      return PlayState.Playing;
    }

    return PlayState.Ended;
  }

  /**
   * 1) Tells the frontend that a song has started playing.
   * 2) When the song has finished playing, queue the next one, if possible.
   * @param dispatcher 
   * @param streaming 
   * @param track 
   */
  async setupListeners(dispatcher: StreamDispatcher, streamURL: string, track: Track) {
    dispatcher.on('start', () => {
      Main.mainWindow.webContents.send('tb-streaming', track, streamURL);
    });

    dispatcher.on('finish', () => {
      this.setPlaying(null);
      this.next();
    });
  }

  /**
   * Plays the given url.
   * @param url 
   * @param track 
   * @param userId 
   */
  async play(url: string, track: Track, userId?: string) {
    const dispatcher = await this.discord.playURL(url, track, userId);

    this.setupListeners(dispatcher, url, track);
    this.setPlaying(dispatcher, track);
  }

  private async sendStateToUI() {
    const playState = this.getPlayState();

    logger('sending new playstate to ui', playState)
    Main.mainWindow.webContents.send('tb-playstate', playState);
  }

  /**
   * Quits the current song, if possible.
   */
  endCurrent() {
    if (this.playing) {
      this.playing.destroy();
      this.setPlaying(null);
    } else {
      logger('There is nothing to stop playing.')
    }
  }

  /**
   * Pauses the current song.
   */
  pause() {
    if (!this.playing) {
      throw new Error('There is nothing playing, that can be paused.');
    }

    this.playing.pause();
    this.sendStateToUI();
  }

  /**
   * Resumes the current song.
   */
  resume() {
    if (!this.playing) {
      this.next();
      return;
    }

    this.playing.resume();
    this.sendStateToUI();
  }

  /**
   * Stops the current song (if one is playing), then continues with the next, if possible.
   * Strategy for the _next_ song:
   * 1) Is something queued from the master? (The client)
   * 2) Is something requested by an discord user?
   */
  async next() {
    let next: QueueItem | ExternalQueueItem = null;

    if (this.masterQueue.length) {
      next = this.masterQueue.shift();
    } else if (this.externalQueue.length) {
      next = this.externalQueue.shift();
    }

    if (!next) {
      logger('There is nothing left to play!');
      return;
    }
    
    logger('Skipping...');
    this.endCurrent();
    const url = typeof next.url === 'string' ? next.url : await next.url();

    this.play(url, next.track, next['user']);
  }

  getQueue(): QueueOverview {
    return {
      nowPlaying: this.currentTrack,
      master: [...this.masterQueue],
      external: [...this.externalQueue]
    };
  }

  async push(track: Track, url: string | ResolvableURL) {
    this.resumeIfEmpty();
    
    this.masterQueue.push({
      track,
      url
    });

    return true;
  }


  /**
   * Checks if the list is empty, if true:
   * wait a tick (to let the parent function add a song),
   * Check if there has been a song added, then resume playing.
   */
  resumeIfEmpty() {
    const isEmpty = () =>!this.masterQueue.length && !this.externalQueue.length

    if (isEmpty()) {
      setTimeout(() => {
        if (!isEmpty()) {
          this.resume();
        }
      });
    }
  }

  async pushExternal(track: Track, url: string | ResolvableURL, user: User) {
    this.resumeIfEmpty();
    
    this.externalQueue.push({
      user: user.id,
      track,
      url
    });

    return true;
  }
}