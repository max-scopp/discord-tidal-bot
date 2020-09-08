import fetch from 'node-fetch';
import cheerio from 'cheerio';
import Main from '../main';

const API_KEY = "1jx_7S9Afhj9tbnsaTvbhNrOEfLSUFyM68dXXe1z0zhKn_h0F4Z6PiRKXMX0qq3G";

interface Lyrics {
  header: string;
  lyrics: string[];
  url: string;
  cover: string;

  /**
   * The time used to get the lyrics, only set if it needs to retry
   */
  delay: null | number;
}

async function scrapeLyrics (path: string, pickup?: number): Promise<Lyrics | null> {
  const response = await fetch(path)
  const html = await response.text();

  let $ = cheerio.load(html);

  const $lyricsDOM = $('.lyrics');
  
  $lyricsDOM.find('a').replaceWith(function () {
    const element = this;

    return `[${$(element).text()}](http://genius.com${$(element).attr('href')})`;
  } as any);

  const lyricsMarkdown = $lyricsDOM.text().trim();

  if (!lyricsMarkdown) {
    Main.mainWindow.webContents.send('tb-toast', "Unable to scape lyrics from known path", "Re-trying...");
    return scrapeLyrics(path, Date.now());
  }

  const messages = [];      
  let tempPayload = [];

  lyricsMarkdown.split('\n').forEach(lyricsLine => {
    if (lyricsLine) {
      tempPayload.push(lyricsLine)
    }

    if (!lyricsLine) {
      messages.push(tempPayload.join('\n'))
      tempPayload = [];
    }
  });

  const lyrics = {
    header: $('.header_with_cover_art-primary_info-title').text().trim(),
    lyrics: messages.filter(message => !!message),
    url: path,
    cover: $('.cover_art-image').attr('src'),
    delay: pickup ? Date.now() - pickup : null
  };

  if (!lyrics.lyrics.length) {
    return Promise.resolve(null);
  }

  return Promise.resolve(lyrics);
};

export async function searchLyrics (query: string) {
  const url = `https://api.genius.com/search?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  
  const body = await response.json();

  
  if (!body.response || !body.response.hits) {
    return null;
  }
  
  
  const [firstHit] = body.response.hits;
  
  if (!firstHit) {
    return null;
  }

  return scrapeLyrics(firstHit.result.url)
};