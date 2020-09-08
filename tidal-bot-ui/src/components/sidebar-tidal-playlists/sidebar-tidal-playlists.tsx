import { Component, h, Host, EventEmitter, Event, State } from '@stencil/core';
import { UI } from '../../../../tidal-bot-electron/types/tidal-bot-backend/types';
import { evalBackend, BackendSection } from '../../util';


@Component({
    tag: 'sidebar-tidal-playlists',
    styleUrl: 'sidebar-tidal-playlists.scss'
})
export class SidebarTidalPlaylists {

    @Event()
    playlistClick: EventEmitter;

    @State()
    playlists: any[] = []; // TODO: Add signature

    handlePlaylistClick = (_ev, playlistId) => {
        this.playlistClick.emit(playlistId)
    }

    async componentDidLoad() {
        this.playlists = await evalBackend(BackendSection.Discord, 'getPlaylists');
    }

    render() {
        return (
            <Host>
                <msc-title>Playlists</msc-title>
                <msc-list>
                    Tidal Playlists go here, someday...
                    {/* {this.playlists.map(playlist => (
                        <msc-item
                            interactive={true}
                            onClick={(ev) => this.handlePlaylistClick(ev, playlist.id)}
                        >
                            {playlist.name}
                        </msc-item>
                    ))} */}
                </msc-list>
            </Host>
        );
    }
}

//