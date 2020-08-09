import TidalAPI from 'tidalapi';
import { Credentials } from './types';

export interface TidalInitialization extends Credentials {
  quality: 'HIGH'; // TODO: Configuratable pls kthxbye
}

export interface OffsetList<T> {
  items: T[];
  limit: number;
  offset: number;
  totalNumberOfItems: number;
}

type AudioMode = "STEREO" | "MONO";
type QualityMode = "LOSSLESS" | "HIGH" | "NORMAL" | "LOW";

export interface Album {

}

export interface Artist {
  id: number;
  name: string;
  type: "MAIN" | string;
}

export interface Track {
  album: Album;
  allowStreaming: boolean;
  artists: Artist[];
  audioModes: AudioMode[];
  audioQuality: QualityMode[];
  copyright: string; // g dat copy rye?
  duration: number;
  editable: false; // are you a tidal editororial human? No. If so: HMU
  explicit: boolean;
  id: number;
  peak: number;
  popularity: number;
  premiumStreamingOnly: boolean;
  replayGain: number;
  streamReady: boolean;
  streamStartDate: Date;
  title: string;
  trackNumber: number;
  url: string; // finally! all I need.
  version: null | unknown;
  volumeNumber: number;
}

/**
 * TODO: It's 2am and I don't care about those types anymore. Will do later.
 */
export interface SearchResult {
  tracks: OffsetList<Track>;
  albums: any;
  artists: any;
}

export interface StreamingResult {
  codec: 'AAC' | string;
  encryptionKey: string;
  playTimeLeftInMinutes: number;
  soundQuality: QualityMode
  trackId: number
  url: string;
}

export interface Favorite {
  created: Date;
  item: Track;
}

export interface FavoritesResult {
  items: Favorite[];
  limit: number;
  offset: number;
  totalNumberOfItems: number;
}

type QueryTypeString = "tracks" | "albums" | "artists" | string;

/**
 * Just a wrapper because the other thing isn't typed and actually kinda sucks.
 */
export default class TidalManager {
  api: TidalAPI;

  constructor(init: TidalInitialization) {
    this.api = new TidalAPI(init);
    this.api.loginAsync();
  }

  destroy() {
    // no need yet
  }

  get userId() {
    return this.api.getMyID();
  }

  async search(type: QueryTypeString[], query: string, limit?: number): Promise<SearchResult> {
    return new Promise((resolve, reject) => {
      this.api.search({
        type: type.join(),
        query,
        limit
      }, (err, data: SearchResult) => {
        if (err) return reject(err)
        resolve(data);
      });
    });
  }

  async getFavorites(userId?: string, limit?: number, offset?: number, order?: 'DATE' | 'NAME' | 'ARTIST' | 'ALBUM' | 'LENGTH', direction?: 'DESC' | 'ASC'): Promise<FavoritesResult> {
    return new Promise((resolve, reject) => {
      this.api._baseRequest.call(this.api, `/users/${userId || this.userId}/favorites/tracks`, {
        limit,
        offset,
        order,
        direction,
      }, 'user', (err, data) => {
        if (err) return reject(err);

        resolve(data);
      });
    });
  }

  async getPlaylists(userId: number = this.userId) {
    return new Promise((resolve, reject) => {

      this.api.getPlaylists({ id: userId }, (err, data) => {
        if (err) return reject(err);
        resolve(data)
      })

    })
  }

  getTrackInfo() {
    throw new Error('Method not implemented. Do it now.');
  }

  async getStreamURL(id: number): Promise<StreamingResult> {
    return new Promise((resolve, reject) => {
      this.api.getStreamURL({ id }, (err, data) => {
        if (err) return reject(err)

        resolve(data);
      })
    })
  }

  getVideoStreamURL(id: number): Promise<StreamingResult> {
    return new Promise((resolve, reject) => {
      this.api.getVideoStreamURL({ id }, (err, data) => {
        if (err) return reject(err)

        resolve(data);
      })
    })
  }

  getArtURL() {
    throw new Error('Method not implemented. Do it now.');
  }

  getArtistVideos() {
    throw new Error('Method not implemented. Do it now.');
  }

  genMetaflacTags() {
    throw new Error('Method not implemented. Do it now.');
  }
}