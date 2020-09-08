import { Track } from './types';

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
export function getAlbumArt(coverId: string, size: SizeOptions) {
  return 'https://resources.tidal.com/images/' + coverId.replace(/-/g, '/') + '/' + size + 'x' + size + '.jpg';
}