import { BrowserWindow, dialog } from 'electron';
import { readFileSync } from 'fs';
const isDev = process.execPath.includes('node_modules/electron/dist/electron');
const path = require('path');
const packageJSON = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const serve = require('electron-serve');
const loadURL = serve({ directory: path.join(__dirname, '..', 'www'), scheme: 'stencil-electron' });

import TidalBot, { BotState } from './tidal-bot-backend';
import TidalUI from './tidal-ui-helpers'

// https://medium.com/@davembush/typescript-and-electron-the-right-way-141c2e15e4e1
export default class Main {
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow: typeof BrowserWindow;
  static tidalBot: TidalBot;
  static TidalUI = TidalUI;
  static locked: boolean;

  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      Main.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object.
    Main.tidalBot.destroy();
    Main.mainWindow = null;
  }

  private static onNavigate(ev) {
    if (Main.tidalBot.state !== BotState.Valid) {
      ev.preventDefault();
      Main.TidalUI.showLogin()
    }
  }

  public static showToast(title: string, message: string, buttonText: string, color: string) {
    Main.mainWindow.webContents.send('tb-toast', title, message, buttonText, color);
  }

  private static onReady() {
    Main.mainWindow = new Main.BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 600,
      minHeight: 450,
      icon: path.join(__dirname, '..', 'www', 'assets', 'icon', 'icon.png'),
      webPreferences: {
        nodeIntegration: true,
      },
      autoHideMenuBar: true,
      titleBarStyle: 'hiddenInset',
    });

    try {
      Main.tidalBot = new TidalBot;
    } catch (e) {
      dialog.showErrorBox('Unable to start', String(e));
    }

    loadURL(Main.mainWindow);

    Main.mainWindow.webContents.on('will-navigate', Main.onNavigate);

    if (isDev) {
      Main.mainWindow.webContents.openDevTools({
        mode: 'detach'
      });
    }

    Main.mainWindow.on('closed', Main.onClose);
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    Main.locked = app.requestSingleInstanceLock();

    if (!Main.locked) {
      app.quit();
      process.exit(1);
    } else {
      app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (Main.mainWindow) {
          if (Main.mainWindow.isMinimized()) { Main.mainWindow.restore() }
          Main.mainWindow.focus();
          Main.showToast("Multi-instance not allowed!", "You may only run one instance of the TidalBot.", "Got it", "warning");
        }
      });
    }

    // https://github.com/SimulatedGREG/electron-vue/issues/424 ??
    const appData = app.getPath('appData');
    app.setPath('userData', path.join(appData, packageJSON.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/_{2,}/g, '_')));

    Main.BrowserWindow = browserWindow;
    Main.application = app;

    Main.application.on('window-all-closed', Main.onWindowAllClosed);
    Main.application.on('ready', Main.onReady);
  }
}