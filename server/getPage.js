import path from 'node:path';
import fs from 'node:fs';
import {
  publicDirectory,
  publicURLPath
} from './paths.js';

const isProduction = process.env.NODE_ENV === 'production';

async function getPage(pageName, hostname) {
  const islandJSFile = path.resolve(publicDirectory, `pages/${pageName}/${pageName}.islands.js`);
  const pageEntryFile = path.resolve(publicDirectory, `pages/${pageName}/${pageName}.page.js`);
  const cssFile = `${publicURLPath}/pages/${pageName}/${pageName}.page.css`;

  const doesIslandsFileExists = await fs.promises.access(islandJSFile, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);

  const importMaps = `
    <script type="importmap">
      {
        "imports": {
          "preact": "https://unpkg.com/preact@10.19.1/dist/preact.module.js",
          "preact/hooks": "https://unpkg.com/preact@10.19.1/hooks/dist/hooks.module.js",
          "htm/preact": "https://unpkg.com/htm@3.1.1/preact/standalone.module.js"
        }
      }
    </script>
  `;
  const preloadJs = doesIslandsFileExists
    ? [
        'https://unpkg.com/preact@10.19.1/dist/preact.module.js',
        'https://unpkg.com/preact@10.19.1/hooks/dist/hooks.module.js',
        'https://unpkg.com/htm@3.1.1/preact/standalone.module.js'
      ]
    : [];
  const exports = await import(pageEntryFile);
  const liveReloadScript = isProduction
    ? undefined
    : `http://${hostname.split(':')[0]}:35731/livereload.js?snipver=1`;

  return {
    js: doesIslandsFileExists ? `${publicURLPath}/${path.relative(publicDirectory, islandJSFile)}` : '',
    preloadJs,
    css: cssFile,
    exports,
    liveReloadScript,
    importMaps
  };
}

export default getPage;
