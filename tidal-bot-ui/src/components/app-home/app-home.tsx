import { Component, h, State } from '@stencil/core';
import { BackendSection, evalBackend } from '../../util';
import { UI } from '../../../../tidal-bot-electron/types/tidal-bot-backend/types';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  shadow: true
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

  async componentDidLoad() {
    this.voiceChannels = await evalBackend(BackendSection.Discord, 'getVoiceChannels');
  }

  joinChannel = async (channel: UI.Channel) => {
    evalBackend(BackendSection.Discord, 'joinVoiceChannel', channel.id)
  }

  render() {
    return (
      <div class='app-home'>
        <input onChange={(ev: any) => {
          this.query = ev.target.value;
        }} />
        <msc-button onClick={this.streamFirstQueryMatch}>Pick first result and play</msc-button>
        <msc-title>Channels</msc-title>
        <msc-list>
          {this.voiceChannels.map(vChannel => (
            <msc-item interactive={true} onClick={() => this.joinChannel(vChannel)}>{vChannel.name}</msc-item>
          ))}
        </msc-list>
      </div>
    );
  }
}
