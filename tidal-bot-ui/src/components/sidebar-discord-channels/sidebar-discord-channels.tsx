import { Component, h, Host, State } from '@stencil/core';
import { BackendSection, evalBackend } from '../../util';
import { UI } from '../../../../tidal-bot-electron/types/tidal-bot-backend/types';

@Component({
    tag: 'sidebar-discord-channels',
    styleUrl: 'sidebar-discord-channels.scss'
})
export class SidebarDiscordChannels {
    @State()
    voiceChannels: UI.Channel[] = []

    async componentDidLoad() {
      this.voiceChannels = await evalBackend(BackendSection.Discord, 'getVoiceChannels');
    }
  
    joinChannel = async (channel: UI.Channel) => {
      evalBackend(BackendSection.Discord, 'joinVoiceChannel', channel.id)
    }

    render() {
        return (
            <Host>        
                <msc-title>Channels</msc-title>
                <msc-list>
                {this.voiceChannels.map(vChannel => (
                    <msc-item interactive={true} onClick={() => this.joinChannel(vChannel)}>{vChannel.name}</msc-item>
                ))}
                </msc-list>
            </Host>
        );
    }
}
