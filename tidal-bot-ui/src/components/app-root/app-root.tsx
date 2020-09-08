import { Component, h, Prop, Host } from '@stencil/core';
import { RouterHistory, injectHistory } from '@stencil/router';
import { toastController } from '@ionic/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  scoped: true
})
export class AppRoot {
  @Prop() history: RouterHistory;

  toHome = () => this.history.push("/");

  toQueue = () => {
    this.history.push("/queue")
  };

  toLists = () => this.history.push("/lists");

  async componentDidLoad() {
    ipcRenderer.on('tb-toast', async (ev, header, message, buttonText, color) => {
      const toast = await toastController.create({
        header,
        message,
        position: 'bottom',
        duration: !buttonText ? 5e3 : undefined,
        buttons: [buttonText],
        color,
        mode: 'ios'
      });
      toast.present();
    })
  }


  render() {
    return (
      <Host>
        <ion-content id="mainView">
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url='/login' component='app-tidal-login' />
              <stencil-route url='/queue' exact component='app-bot-queue' />
              <stencil-route url='/lists' exact component='app-tidal-list-overview' />
              <stencil-route url='/list' exact component='app-tidal-list' />
              <stencil-route url='/' component='app-home' />
            </stencil-route-switch>
          </stencil-router>
        </ion-content>

      </Host>
    );
  }
}

injectHistory(AppRoot);