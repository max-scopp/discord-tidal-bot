import Main from './main';
import { TidalState } from './tidal-bot-backend';

export default class TidalUI {

  private static eval(code: string, userGesture?: boolean) {
    return Main.mainWindow.webContents.executeJavaScript(code, userGesture);
  }

  static showLogin() {
    switch (Main.tidalBot.state) {
      case TidalState.NoLogin:
        TidalUI.eval(`location.assign("/login")`);
      case TidalState.Invalid:
        TidalUI.eval(`location.assign("/login?invalid")`);
    }
  }
}