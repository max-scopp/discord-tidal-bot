import { app, BrowserWindow } from 'electron';
import Main from './main';
import debug from 'debug';

debug.enable('tb:*');

Main.main(app, BrowserWindow);