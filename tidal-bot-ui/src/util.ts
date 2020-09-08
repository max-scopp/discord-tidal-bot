import { Track, Artist } from "../../tidal-bot-electron/types/tidal-bot-backend/tidal/types";

export enum BackendSection {
  Unknown,
  Tidal,
  Discord,
  Connector
}

// export async function backendReady() {
//   let didFinish = false;

//   return new Promise((resolve, reject) => {
//     ipcRenderer.once('tb-ready', () => {
//       didFinish = true;
//       resolve();
//     });

//     setTimeout(() => {
//       if (!didFinish) {
//         throw new Error('Unable to initialize. Backend not ready.');
//       }
//     }, 1e3);
//   })
// }


export enum SizeOptions {
  Thumbnail = 80,
  Normal = 640,
  Large = 1280
}

/**
 * @param track 
 * @param width 
 * @param height 
 */
export function getAlbumArt(track: Track, size: SizeOptions) {
  return 'https://resources.tidal.com/images/' + (track.album as any).cover.replace(/-/g, '/') + '/' + size + 'x' + size + '.jpg';
}

export function displayArtists(artists: Artist[], ) {
  return artists.map(artist => artist.name).join(', ');
}

/**
 * TODO: Implement timeout when backend simply doesn't respond.
 * @param backendSection 
 * @param functionName 
 * @param args 
 */
export async function evalBackend<R>(backendSection: BackendSection, functionName: string, ...args: any[]): Promise<R> {
  return new Promise((resolve, reject) => {

    switch (backendSection) {
      case BackendSection.Tidal: {
        ipcRenderer.send('tb-tidal-eval', {
          function: functionName,
          arguments: args
        });

        ipcRenderer.once('tb-tidal-return:' + functionName, (_event, ...results) => {
          resolve(...results);
        });
        break;
      }
      case BackendSection.Discord: {
        ipcRenderer.send('tb-discord-eval', {
          function: functionName,
          arguments: args
        });

        ipcRenderer.once('tb-discord-return:' + functionName, (_event, ...results) => {
          resolve(...results);
        });
        break;
      }
      case BackendSection.Connector: {
        ipcRenderer.send('tb-connector-eval', {
          function: functionName,
          arguments: args
        });

        ipcRenderer.once('tb-connector-return:' + functionName, (_event, ...results) => {
          resolve(...results);
        });
        break;
      }
      default: {
        reject('Unknown backend section or not implemented.');
      }
    }

  })
}