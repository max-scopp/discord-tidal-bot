export interface Session  {
  sessionId: string;
  userId: string;
  countryCode: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export type TidalInitialization = Credentials & {
  quality: QualityMode; // TODO: Configuratable pls kthxbye
}

export interface OffsetList<T> {
  items: T[];
  limit: number;
  offset: number;
  totalNumberOfItems: number;
}

export type AudioMode = "STEREO" | "MONO";
export type QualityMode = "LOSSLESS" | "HIGH" | "NORMAL" | "LOW";

export type QueryTypeString = "tracks" | "albums" | "artists" | string;


export interface Album {
  id: number;
  cover: string;
  title: string;
  videoCover: null | string;
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