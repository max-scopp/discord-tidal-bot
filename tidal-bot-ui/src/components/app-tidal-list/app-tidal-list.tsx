import { Component, h, State } from '@stencil/core';


@Component({
    tag: 'app-tidal-list',
    styleUrl: 'app-tidal-list.scss'
})
export class AppTidalList {

    @State()
    isLoading = true;

    async componentWillLoad() {
    }

    render() {
        return (
            <div>
                <p>Hello AppTidalList!</p>
            </div>
        );
    }
}
