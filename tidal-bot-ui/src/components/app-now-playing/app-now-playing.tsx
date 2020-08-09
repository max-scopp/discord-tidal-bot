import { Component, h, State, Host } from '@stencil/core';
import { Track } from '../../../../tidal-bot-electron/types/tidal-bot-backend/tidal';

@Component({
    tag: 'app-now-playing',
    styleUrl: 'app-now-playing.scss',
    shadow: true
})
export class AppNowPlaying {

    @State()
    currentTrack: Track = null;

    componentDidLoad() {
        ipcRenderer.on('tb-streaming', (ev, currentTrack) => {
            this.currentTrack = currentTrack;
            console.log(currentTrack);
        });
    }

    render() {
        const track = this.currentTrack;

        if (!track) {
            return <Host>
                No track playing.
            </Host>
        }

        return (
            <Host>
                <msc-title>{track.title}</msc-title>
                <p>{track.artists.map((artist, position, all) => {
                    if (artist.type === 'MAIN') {
                        return <u>{artist.name}</u>
                    }

                    return artist.name + (
                        position <= all.length
                            ? ', '
                            : ''
                    );
                })}</p>
            </Host>
        );
    }
}
