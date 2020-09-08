import { Message } from "discord.js";
import { Track, Credentials } from "./tidal/types";

export namespace UI {
  export interface Channel {
    bitrate: number;
    id: string;
    userLimit: number;
    parentID: string;
    createdTimestamp: number;
    name: string;
    full: boolean;
    joinable: boolean;
    speakable: boolean;
  }
}

interface DiscordRequest {
  sender?: Message;
}

export interface PlaySearchRequest extends DiscordRequest {
  type: 'search',
  query: string;
}

export interface SpecificTrack extends DiscordRequest {
  type: 'track',
  track: Track;
}

export type PlayRequest = PlaySearchRequest | SpecificTrack;

export interface JoinVoiceRequest {
  id: string;
}

export interface FunctionRequest {
  function: string;
  arguments: any[];
}

export interface Moderator {
  id: string;
  name: string;
}

export interface Configuration extends Credentials {
  lastChannelID?: string;
  lastVoiceChannelID?: string;
  masterID?: string;
  moderators?: Moderator[];
}
