import { Component, h, Host, State } from '@stencil/core';

@Component({
    tag: 'app-play-bars',
    styleUrl: 'app-play-bars.scss',
    shadow: true,
})
export class AppPlayBars {

    @State()
    playing: boolean;

    componentWillLoad() {
        ipcRenderer.on('tb-streaming', (_ev, currentTrack) => {
            this.playing = !!currentTrack;
        });
    }

    render() {
        return (
            <Host class={{ 'is-playing': this.playing }}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </Host>
        );
    }
}
