import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { resolve } from 'path';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.scss',
  globalScript: 'src/global/app.ts',
  preamble: "(c) 2020 Maximilian Scopp - ",
  taskQueue: 'congestionAsync',
  devServer: {
    openBrowser: false
  },
  outputTargets: [
    {
      type: 'www',
      polyfills: false,
      serviceWorker: null,
      dir: resolve(__dirname, '../tidal-bot-electron/www/')
    }
  ],
  plugins: [
    sass({
      //includePaths: [resolve(__dirname, 'node_modules/@jmms/core/sass/engine.scss')]
    })
  ]
};
