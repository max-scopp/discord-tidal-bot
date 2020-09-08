import { Track } from "./tidal/types";

namespace Utils {
  export function noop() { }

  export function displayTitle(track: Track, options: Partial<{
    includeURL: boolean
  }> = {}) {
    return [
      track.explicit ? '(explicit) ' : '',
      track.title,
      ' - ',
      track.artists.map(artist => artist.name).join(', '),
      options.includeURL ? `\n${track.url}` : ''
    ].join('');
  }

  export function literalObjects(_in) {
    if (typeof _in === 'object') {
      return { ..._in };
    }

    return _in
  }

  export function toLiteral(_in) {
    // assures that the return type is always an pure object, not an class instance.
    if (_in instanceof Array) {
      return _in.map(item => literalObjects(item))
    }

    return literalObjects(_in);
  }
}

export default Utils;