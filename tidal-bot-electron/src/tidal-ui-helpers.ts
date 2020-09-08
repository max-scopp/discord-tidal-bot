import Main from './main';
import { BotState } from './tidal-bot-backend';

export default class TidalUI {

  private static eval(code: string, userGesture?: boolean) {
    return Main.mainWindow.webContents.executeJavaScript(code, userGesture);
  }

  static showLogin() {
    switch (Main.tidalBot.state) {
      case BotState.NoLogin:
        TidalUI.eval(`location.assign("/login")`);
      case BotState.Invalid:
        TidalUI.eval(`location.assign("/login?invalid")`);
    }
  }
}