import { Component, h, State } from '@stencil/core';

@Component({
    tag: 'app-tidal-login',
    styleUrl: 'app-tidal-login.scss'
})
export class AppTidalLogin {

    @State()
    username: string;

    @State()
    password: string;
    form: HTMLFormElement;

    private get credentials() {
        return {
            username: this.username,
            password: this.password,
        }
    }

    onSubmit = (ev: Event) => {
        ev.preventDefault();
        ipcRenderer.send('tb-set-credentials', this.credentials);
    }

    render() {
        return (
            <ion-content>

                <form onSubmit={(ev) => {
                    ev.preventDefault();
                    debugger
                    return false;
                }}>
                    <msc-grid gap={10}>

                        <msc-title>Tidal Login</msc-title>
                        <msc-badge color="var(--red)">
                            <b>IMPORTANT NOTICE: </b> Currently, credentials are saved as plain JSON in your home directoy.
                            <p>Hackers will have no problems finding this file and reading your credentials.</p>

                        This <b>will</b> be addressed in future an future version, but up until then, be aware of that.
                        As long as you protect your PC correctly and don't let anyone else access it apart from you, this
                        is somewhat safe. This does not apply if you share multiple accounts on the same PC. <br />
                            <i>You have been warned.</i>
                        </msc-badge>
                        <p>Please enter your personal TIDAL credentials.</p>
                        <small>It is recommended that you have an active subscription as we currently stream in the HIGH quality preset.</small>
                        <msc-form-field label="E-Mail">
                            <msc-input
                                type="text"
                                placeholder="my.mail@provider.tld"
                                onUserInput={(ev) => this.username = ev.target.value}
                            ></msc-input>
                        </msc-form-field>
                        <msc-form-field label="Password">
                            <msc-input
                                type="text"
                                placeholder="your super long password"
                                onUserInput={(ev) => this.password = ev.target.value}
                            ></msc-input>
                        </msc-form-field>
                        <msc-button theme="primary" type="submit">Login</msc-button>
                    </msc-grid>
                </form>

            </ion-content>
        );
    }
}
