import { Component, h, State, Watch, Host, Prop } from '@stencil/core';
import { Favorite, FavoritesResult, Track } from '../../../../tidal-bot-electron/types/tidal-bot-backend/tidal/types';
import { evalBackend, BackendSection, displayArtists } from '../../util';


@Component({
    tag: 'tidal-track-list',
    styleUrl: 'tidal-track-list.scss'
})
export class TidalTrackList {
    @Prop()
    playlistId: string;

    @State()
    items: Favorite[] = [];

    @State()
    order: 'DATE' | 'NAME' | 'ARTIST' | 'ALBUM' | 'LENGTH' = 'DATE';

    @State()
    direction: 'ASC' | 'DESC' = 'DESC';

    @State()
    limit: number = 50;

    @State()
    offset: number = 0;
    virtualContainer: HTMLIonVirtualScrollElement;
    infiniteScroll: HTMLIonInfiniteScrollElement;

    @Watch('order')
    @Watch('direction')
    resetAndLoad() {
        this.items = [];
        this.offset = 0;
        this.load();
    }

    @Watch('offset')
    async load() {
        const result: FavoritesResult = await evalBackend(BackendSection.Tidal, 'getFavorites', null, this.limit, this.offset, this.order, this.direction);

        // push the new items into the virtual list.
        this.items = [
            ...this.items,
            ...result.items
        ];

        // signal the loading of more data finished.
        this.infiniteScroll.complete();
    }

    componentWillLoad() {
        this.load();
    }

    async playTrack(track: Track) {
        ipcRenderer.send('tb-play', {
            type: 'track',
            track
        })
    }

    loadMore = () => {
        this.offset = this.offset + this.limit;
    }

    renderItem = (fav: Favorite) => {
        const { created, item } = fav;

        return (
            <ion-item onClick={() => this.playTrack(item)} disabled={!item.streamReady}>
                <span class="title">
                    {item.title} - {displayArtists(item.artists)}
                    {item.explicit ? <msc-badge color="var(--bg-dark)">explicit</msc-badge> : null}
                </span>
                <span class="muted">{(new Date(created)).toLocaleString()}</span>
            </ion-item>
        );
    }

    render() {
        if (!this.items) {
            return <p>No TIDAL favorites. Add some and they will be displayed here.</p>
        }

        return (
            <Host>
                <msc-button-group id="toolbar">
                    <msc-button onClick={() => this.order = "NAME"}>By name</msc-button>
                    <msc-button onClick={() => this.order = "DATE"}>By Date</msc-button>
                    <msc-button onClick={() => this.order = "LENGTH"}>By Length</msc-button>
                    <msc-button onClick={() => this.order = "ARTIST"}>By Artist</msc-button>
                    <msc-button onClick={() => this.order = "ALBUM"}>By Album</msc-button>
                    <msc-button onClick={() => {
                        this.direction = this.direction === 'ASC' ? 'DESC' : 'ASC'
                    }}>Change direction</msc-button>
                </msc-button-group>
                <ion-content>
                    <ion-virtual-scroll
                        ref={ref => this.virtualContainer = ref}
                        items={this.items}
                        renderItem={this.renderItem}
                    ></ion-virtual-scroll>
                    <ion-infinite-scroll
                        ref={ref => this.infiniteScroll = ref}
                        onIonInfinite={(ev) => this.loadMore()}
                        threshold="800px"
                    >
                        <ion-infinite-scroll-content
                            loadingSpinner="circles"
                            loadingText="Fetching more favorites">
                        </ion-infinite-scroll-content>
                    </ion-infinite-scroll>
                </ion-content>
            </Host>
        );
    }
}
