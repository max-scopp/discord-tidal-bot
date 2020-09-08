import { h, JSX } from '@stencil/core';
import { Artist } from "../../tidal-bot-electron/types/tidal-bot-backend/tidal/types";

export function displayAndMarkMainArtists(artists: Artist[]): JSX.Element[] {
  return artists.map((artist, index, all) => {
    const isLast = index >= all.length - 1;
    let element = <span>{artist.name}</span>;

    if (artist.type === "MAIN") {
      element = <b>{artist.name}</b>
    }

    return [
      element,
      !isLast ? ', ' : ''
    ]
  });
}