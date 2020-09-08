import { Component, h, State, Host } from '@stencil/core';
import { BackendSection, evalBackend } from '../../util';
import { UI } from '../../../../tidal-bot-electron/types/tidal-bot-backend/types';

@Component({
    tag: 'app-home',
    styleUrl: 'app-home.scss',
})
export class AppHome {

    @State()
    query: string;

    @State()
    voiceChannels: UI.Channel[] = []

    streamFirstQueryMatch = () => {
        ipcRenderer.send('tb-play', {
            type: 'search',
            query: this.query
        })
    }

    @State()
    activePlaylistId: string;

    setActivePlaylist = (event: CustomEvent) => {
        const { detail: playlistId } = event;
        this.activePlaylistId = playlistId;
    }

    async componentDidLoad() {
        this.voiceChannels = await evalBackend(BackendSection.Discord, 'getVoiceChannels');
    }

    joinChannel = async (channel: UI.Channel) => {
        evalBackend(BackendSection.Discord, 'joinVoiceChannel', channel.id)
    }

    render() {
        return (
            <Host>
                <app-now-playing ></app-now-playing>
{/* 
                <input onChange={(ev: any) => {
                    this.query = ev.target.value;
                }} />
                <msc-button onClick={this.streamFirstQueryMatch}>Pick first result and play</msc-button> */}
                <tidal-track-list playlistId={this.activePlaylistId} />
                <sidebar-discord-channels />
                <sidebar-tidal-playlists onPlaylistClick={this.setActivePlaylist} />
            </Host>
        );
    }
}
