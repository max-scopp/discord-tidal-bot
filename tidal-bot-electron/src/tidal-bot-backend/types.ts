
export namespace UI {
  export interface Channel {
    bitrate: number;
    id: string;
    userLimit: number;
    parentID: string;
    createdTimestamp: number;
    name: string;
    full: number;
    joinable: number;
    speakable: number;
  }
}

export interface Credentials {
  username: string;
  password: string;
}