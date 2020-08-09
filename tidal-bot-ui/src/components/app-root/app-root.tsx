import { Component, h, Prop } from '@stencil/core';
import { RouterHistory, injectHistory } from '@stencil/router';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  scoped: true
})
export class AppRoot {
  @Prop() history: RouterHistory;

  toHome = () => this.history.push("/");

  toQueue = () => {
    this.history.push("/queue")
  };

  toLists = () => this.history.push("/lists");

  render() {
    return (
      <msc-content>
        <msc-grid centerItems={true} id="titleBar" template="28px / [actions-start] auto [actions-end title-start] 1fr [title-end window-actions-start] auto [window-actions-end]">
          <msc-button-group>
            <msc-button onActivate={this.toQueue}>Queue</msc-button>
            <msc-button onActivate={this.toLists}>Lists</msc-button>
          </msc-button-group>
          <h5 class="window-title" onClick={this.toHome}>{document.title}</h5>
          <msc-button-group class="window-actions">
            <msc-button>

            </msc-button>
          </msc-button-group>
        </msc-grid>

        <main>
          <app-now-playing ></app-now-playing>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url='/login' component='app-tidal-login' />
              <stencil-route url='/queue' exact component='app-bot-queue' />
              <stencil-route url='/lists' exact component='app-tidal-list-overview' />
              <stencil-route url='/list' exact component='app-tidal-list' />
              <stencil-route url='/' component='app-home' />
            </stencil-route-switch>
          </stencil-router>
        </main>
      </msc-content>
    );
  }
}

injectHistory(AppRoot);