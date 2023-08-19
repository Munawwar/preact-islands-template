import path from 'node:path';
import fs from 'node:fs';
import {
  root,
  publicDirectory,
  publicDirectoryRelative,
  publicURLPath,
  ssrDirectoryRelative
} from './paths.js';

const isProduction = process.env.NODE_ENV === 'production';

function getPaths(pageName) {
  return {
    source: {
      jsFile: `client/pages/${pageName}/${pageName}.islands.jsx`,
      cssFile: `client/pages/${pageName}/${pageName}.page.css`
    },
    ssr: {
      jsFile: `${ssrDirectoryRelative}/pages/${pageName}/${pageName}.page.js`
    }
  };
}

function getRelativePathToSSRDist(distSSRPath) {
  return path.resolve(root, distSSRPath);
}

let publicManifestCache;
let islandManifestCache;
let metafileCache;
async function getPage(pageName, hostname) {
  const filePaths = getPaths(pageName);

  // Map from manifest and metafile
  // Cache manifests and metafile if not cached
  let publicManifest = publicManifestCache;
  let islandManifest = islandManifestCache;
  let metafile = metafileCache;
  if (!publicManifest) {
    const [
      publicManifestString,
      islandManifestString,
      metafileString
    ] = await Promise.all([
      fs.promises.readFile(
        path.resolve(publicDirectory, 'manifest.json'),
        'utf-8'
      ),
      fs.promises.readFile(
        path.resolve(publicDirectory, 'manifest-islands.json'),
        'utf-8'
      ),
      fs.promises.readFile(
        path.resolve(publicDirectory, 'metafile.json'),
        'utf-8'
      )
    ]);
    publicManifest = JSON.parse(publicManifestString);
    islandManifest = JSON.parse(islandManifestString);
    metafile = JSON.parse(metafileString);
    if (isProduction) {
      publicManifestCache = publicManifest;
      islandManifestCache = islandManifest;
      metafileCache = metafile;
    }
  }

  const jsFile = islandManifest[filePaths.source.jsFile];
  const cssFile = publicManifest[filePaths.source.cssFile];
  const preloadJs = (metafile.outputs[jsFile]?.imports || [])
    .filter(({ kind }) => kind === 'import-statement')
    .map(({ path: filePath }) => path.resolve(publicURLPath, path.relative(publicDirectoryRelative, filePath)));
  const exports = await import(getRelativePathToSSRDist(filePaths.ssr.jsFile));
  const liveReloadScript = isProduction
    ? undefined
    : `http://${hostname.split(':')[0]}:35731/livereload.js?snipver=1`;

  return {
    js: jsFile ? `${publicURLPath}/${path.relative(publicDirectoryRelative, jsFile)}` : '',
    preloadJs,
    css: `${publicURLPath}/${path.relative(publicDirectoryRelative, cssFile)}`,
    exports,
    liveReloadScript
  };
}

export default getPage;
