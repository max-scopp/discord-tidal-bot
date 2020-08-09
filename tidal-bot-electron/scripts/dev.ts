const { exec } = require('shelljs');
const { resolve } = require('path');

exec('npx tsc -p tsconfig.json --watch', { async: true });

exec('npx stencil build --dev --watch', {
  async: true,
  cwd: resolve(process.cwd(), '../tidal-bot-ui/')
}).stdout.on('data', (data) => {
  const initialBuildFinished = data.includes('build finished');
  const rebuildFinished = data.includes('rebuild finished');

  if (initialBuildFinished && !rebuildFinished) {
    console.log('build finished - launching electron');
    exec('npm run start:electron', { async: true });
  }
});