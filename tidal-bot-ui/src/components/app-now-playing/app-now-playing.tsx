import { Component, h, State, Host, Element } from '@stencil/core';
import { Track } from '../../../../tidal-bot-electron/types/tidal-bot-backend/tidal/types';
import { getAlbumArt, SizeOptions, evalBackend, BackendSection } from '../../util';
import { displayAndMarkMainArtists } from '../../utils-jsx';
import WaveSurfer from 'wavesurfer.js';
import { toastController } from '@ionic/core';


@Component({
    tag: 'app-now-playing',
    styleUrl: 'app-now-playing.scss',
    scoped: true
})
export class AppNowPlaying {

    @Element() host: HTMLElement;

    @State()
    currentTrack: Track = null;

    wavesurfer: any;
    waveCanvas: HTMLElement;
    albumCover: HTMLElement;
    playState: "playing" | "paused" | "ended";

    next = (event: MouseEvent) => {
        evalBackend(BackendSection.Connector, 'next');
    }

    componentDidLoad() {
        this.wavesurfer = WaveSurfer.create({
            container: this.waveCanvas,
            interact: false,
            waveColor: 'gray',
            progressColor: 'white',
            height: 150,
            responsive: true,
            cursorWidth: 0,
            hideScrollbar: true,
        });

        this.wavesurfer.zoom(700)

        ipcRenderer.on('tb-streaming', (_ev, currentTrack: Track, streamURL: string) => {
            this.currentTrack = currentTrack;

            if (streamURL) {
                const startStreamTime = Date.now();
                this.wavesurfer.load(streamURL);
                this.wavesurfer.play();
                const fixOffset = () => {
                    const offsetSpectrum = (Date.now() - startStreamTime) / 1000
                    console.log('off', offsetSpectrum)
                    this.wavesurfer.play(offsetSpectrum);
                    this.wavesurfer.un(fixOffset);
                };
                this.wavesurfer.on('ready', fixOffset)
            }
        });

        ipcRenderer.on('tb-playstate', (_ev, playState: AppNowPlaying['playState']) => {
            this.playState = playState;
            
            switch (this.playState) {
                case "playing": {
                    this.wavesurfer.play()
                    break;
                }
                case "paused": {
                    this.wavesurfer.pause()
                    break;
                }
                case "ended": {
                    this.wavesurfer.destroy()
                    break;
                }
            }
        });
    }

    togglePlayState = async () => {
        if (this.playState !== 'ended') {
            const playState = this.playState === "playing" ? 'paused' : 'playing';
            evalBackend(BackendSection.Connector, 'setPlayState', playState);
        } else {
            (await toastController.create({
                header: 'Invalid play state',
                message: "The current track is in state 'ended'."
            })).present()
        }
    }

    render() {
        const track = this.currentTrack;
        const albumArt = track ? getAlbumArt(track, SizeOptions.Normal) : null;

        return (
            <Host>
                {track ? <img class="album-background" src={albumArt} /> : null}
                <div ref={ref => this.waveCanvas = ref} class="waveform-canvas">
                </div>
                <div class="controls-with-cover">
                    <button class="track-control track-last" onClick={() => alert("Feature does not exist, yet")}>
                        &lt;
                    </button>
                    <div class={{
                        "track-playstate-container": true,
                        "track-playing": this.playState === "playing",
                        "track-paused": this.playState === "paused"
                    }}>
                        <div class="track-album-image" ref={ref => this.albumCover = ref} onClick={this.togglePlayState} >
                            {track ? <img src={albumArt} /> : null}
                        </div>
                    </div>
                    <button class="track-control track-next" onClick={this.next}>
                        &gt;
                    </button>
                </div>
                <div class="track-title">
                    {track ? track.title : <span class="muted">No Track playing</span>}
                    <small>{track ? displayAndMarkMainArtists(track.artists) : '\u00A0'}</small>
                </div>
            </Host>
        );
    }
}
