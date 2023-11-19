'use strict';

import fs from 'fs';
import os from 'os';
import path from 'path';
import * as stream from 'stream';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

import axios from 'axios';
import unzip from 'node-unzip-2';

const finished = promisify(stream.finished);

const plugins = [
  'https://nsis.sourceforge.io/mediawiki/images/7/7f/EnVar_plugin.zip',
  'https://nsis.sourceforge.io/mediawiki/images/4/4a/AccessControl.zip'
];

async function downloadFile(url, outputLocation) {
  const writer = fs.createWriteStream(outputLocation);

  return axios.get(url, { responseType: 'stream' }).then(response => {
    response.data.pipe(writer);
    return finished(writer);
  });
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const nsisPluginsDir = path.join(dirname, 'nsis_plugins');
const nsisPluginsInstalledFile = path.join(nsisPluginsDir, 'installed.txt');

if (fs.existsSync(nsisPluginsInstalledFile)) {
  console.log('NSIS plugins installed already, skipping downloading plugins');
  process.exit(0);
}

fs.mkdirSync(nsisPluginsDir);
const tmpDir = os.tmpdir();

Promise.all(
  plugins.map(async (url) => {
    const targetFileName = url.split('/').pop();
    const targetPath = path.join(tmpDir, targetFileName);
    await downloadFile(url, targetPath);
    const readStream = fs.createReadStream(targetPath);
    const unzipped = new Promise(function(resolve, reject) {
      readStream.on('close', resolve);
      readStream.on('error', reject);
    });
    readStream.pipe(unzip.Extract({ path: nsisPluginsDir }));
    await unzipped;
    return targetFileName;
  })
).then((plugins) => {
  fs.writeFileSync(nsisPluginsInstalledFile, 'plugins installed');
  console.log('Finished downloading NSIS plugins');
  plugins.forEach(plugin => console.log(` - ${plugin}`));
  // TODO: remove files from tmp folder
});

