import { Credentials, FavoritesResult, QualityMode, QueryTypeString, SearchResult, Session, StreamingResult, TidalInitialization, Track } from './types';
import fetch from 'node-fetch';
import { getAlbumArt, SizeOptions} from './utils';

const baseURL = 'https://api.tidalhifi.com/v1';

function formUrlEncoded(_object: { [key: string]: any }) {
  return Object.keys(_object).reduce((p, c) => p + `&${c}=${encodeURIComponent(_object[c])}`, '')
}

/**
 * Rewrite of https://github.com/lucaslg26/TidalAPI
 * It was kind of shitty and I needed additional API's.
 */
export default class TidalManager {
  session: Session;
  credentials: Credentials;

  quality: QualityMode;

  constructor(init: TidalInitialization) {
    if (!init) {
      throw new Error('Unable to init TidalManager, no init object given!');
    }

    const { quality, username, password } = init;

    if (!(quality || username || password)) {
      throw new Error('Unable to init TidalManager, one (or more) of the required values are missing: ');
    }

    this.credentials = {
      username, password
    };
    this.quality = quality;

    this.tryLogin();
  }

  destroy() {
    this.session = null;
  }

  get userId() {
    return this.session.userId;
  }

  async tryLogin() {
    const response = await fetch(baseURL + '/login/username', {
      method: 'POST',
      headers: {
        'X-Tidal-Token': "wc8j_yBJd20zOmx0",
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formUrlEncoded(this.credentials),
    });

    this.session = await response.json();
    console.log(this.session);
  }

  async _request(url: string, params: { [key: string]: any } = null, method?: string, additionalHeaders?: { [key: string]: any }, setParamsAsFormData?: boolean) {
    if (!this.session) {
      throw new Error('Not logged in.');
    }

    const useMethod = method || 'GET';
    const isGET = useMethod.match(/GET/i);

    const additionalParams = isGET ? '?' + formUrlEncoded(params) : '';
    const requestUrl = baseURL + url + additionalParams;

    const response = await fetch(requestUrl, {
      method: useMethod,
      headers: {
        'Origin': 'http://listen.tidal.com',
        'X-Tidal-SessionId': this.session.sessionId,
        ...additionalHeaders
      },
      body: !isGET
        ? setParamsAsFormData
          ? formUrlEncoded(params)
          : JSON.stringify(params)
        : undefined
    });

    return response.json();
  }

  /**
   * 
   * @param type if null, all criterias are included.
   * @param query 
   * @param limit 
   */
  async search(type: QueryTypeString[] | null, query: string, limit: number = 100, offset: number = 0): Promise<SearchResult> {
    return this._request('/search', {
      type: type.join(),
      query,
      limit,
      offset,
      countryCode: this.session.countryCode
    });
  }

  getCoverURL(trackOrCoverId: Track | string, size: SizeOptions = SizeOptions.Normal) {
    let coverId;
    if (typeof trackOrCoverId === 'string') {
      coverId = trackOrCoverId;
    } else {
      coverId = trackOrCoverId.album.cover;
    }
    
    return getAlbumArt(coverId, size);
}

  async getFavorites(userId?: string, limit?: number, offset?: number, order?: 'DATE' | 'NAME' | 'ARTIST' | 'ALBUM' | 'LENGTH', orderDirection?: 'DESC' | 'ASC'): Promise<FavoritesResult> {
    return this._request(`/users/${userId || this.userId}/favorites/tracks`, {
      limit,
      offset,
      order,
      orderDirection,
      countryCode: this.session.countryCode
    });
  }

  async getPlaylists(userId?: number, limit: number = 100, offset: number = 0) {
    const playlistURL = '/users/' + encodeURIComponent(userId || this.userId) + "/playlists";

    return this._request(playlistURL, {
      limit, offset
    });
  }

  async getTrackInfo(trackId: string) {
    return this._request('/tracks/' + (trackId));
  }

  async getMixIDFromTrack(trackId: string) {
    return this._request(`/tracks/${trackId}/mix`, {
      countryCode: this.session.countryCode
    });
  }

  async getMix(mixId: string) {
    return this._request(`/mixes/${mixId}/items`, {
      countryCode: this.session.countryCode
    });
  }

  /**
   * 
   * @param idOrTrack 
   * @param quality If not provided, the quality mode of which the class has been constructed is used. This is used to overwrite that behaviour in case network conditions changes.
   */
  async getStreamURL(idOrTrack: string | Track, quality?: QualityMode): Promise<StreamingResult> {
    const trackId = typeof idOrTrack === 'string'
      ? idOrTrack
      : idOrTrack.id;

    return this._request(`/tracks/${trackId}/streamUrl`, {
      soundQuality: quality || this.quality
    })
  }

  getVideoStreamURL(idOrTrack: string | Track): Promise<StreamingResult> {
    const trackId = typeof idOrTrack === 'string'
      ? idOrTrack
      : idOrTrack.id;

    return this._request(`/videos/${trackId}/streamUrl`)
  }
}