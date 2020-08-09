import { Component, h, State, Host, Watch } from '@stencil/core';
import { FavoritesResult, Track } from '../../../../tidal-bot-electron/types/tidal-bot-backend/tidal';
import { BackendSection, evalBackend } from '../../util';

@Component({
    tag: 'app-tidal-list-overview',
    styleUrl: 'app-tidal-list-overview.scss'
})
export class AppTidalListOverview {
    @State()
    favorites: FavoritesResult;

    @State()
    isLoading: boolean = true;

    @State()
    order: 'DATE' | 'NAME' | 'ARTIST' | 'ALBUM' | 'LENGTH';

    @State()
    limit: number = 100;

    @State()
    offset: number;

    @Watch('order')
    @Watch('limit')
    @Watch('offset')
    reLoad() {
        this.load();
    }

    async load() {
        this.isLoading = true;
        this.favorites = await evalBackend(BackendSection.Tidal, 'getFavorites', null, this.limit, this.offset, this.order);
        this.isLoading = false;
    }

    componentWillLoad() {
        this.load();
    }

    playTrack(track: Track) {
        ipcRenderer.send('tb-play', {
            type: 'track',
            track
        })
    }

    next = () => {
        this.offset += this.limit;

        this.load();
    }

    prev = () => {
        const newOffset = this.offset - this.limit;

        if (newOffset > 0) {
            this.offset = newOffset
        } else {
            this.offset = 0
        }

        this.load();
    }

    render() {
        if (this.isLoading) {
            return <msc-loader></msc-loader>
        }

        if (!this.favorites) {
            return <p>No favs.</p>
        }

        return (
            <Host>
                <msc-content>
                    <msc-button-group id="toolbar">
                        <msc-button onClick={() => this.order = "NAME"}>By name</msc-button>
                        <msc-button onClick={() => this.order = "DATE"}>By Date</msc-button>
                        <msc-button onClick={() => this.order = "LENGTH"}>By Length</msc-button>
                        <msc-button onClick={() => this.order = "ARTIST"}>By Artist</msc-button>
                        <msc-button onClick={() => this.order = "ALBUM"}>By Album</msc-button>
                        <msc-button onClick={this.prev}>Prev</msc-button>
                        <msc-button onClick={this.next}>Next</msc-button>
                    </msc-button-group>
                    <msc-list>
                        {this.favorites.items.map(({ item }) => (
                            <msc-item interactive onClick={() => this.playTrack(item)}>
                                {item.explicit ? <msc-badge color="var(--bg-dark)">E</msc-badge> : null}
                                {item.title} - {item.artists.map(artist => artist.name).join(', ')}
                            </msc-item>
                        ))}
                    </msc-list>
                </msc-content>
            </Host>
        );
    }
}
