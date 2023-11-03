import path from 'node:path';
import fs from 'node:fs';
import {
  root,
  publicDirectory,
  publicDirectoryRelative,
  publicURLPath,
  ssrDirectory
} from './paths.js';

const isProduction = process.env.NODE_ENV === 'production';

function getPaths(pageName) {
  return {
    pageEntryFile: `client/pages/${pageName}/${pageName}.page.jsx`,
    islandEntryFile: `client/pages/${pageName}/${pageName}.islands.jsx`
  };
}

function getRelativePathToSSRDist(distSSRPath) {
  return path.resolve(root, distSSRPath);
}

let manifestsCache;
let metafilesCache;
async function getPage(pageName, hostname) {
  const filePaths = getPaths(pageName);

  // Map from build meta files
  let metafiles = metafilesCache;
  // Construct and cache manifest if not cached
  let manifests = manifestsCache;
  if (!manifests) {
    const [
      ssrMetafileString,
      publicMetafileString,
      islandsMetafileString
    ] = await Promise.all([
      fs.promises.readFile(
        path.resolve(ssrDirectory, 'metafile.json'),
        'utf-8'
      ),
      fs.promises.readFile(
        path.resolve(publicDirectory, 'metafile.json'),
        'utf-8'
      ),
      fs.promises.readFile(
        path.resolve(publicDirectory, 'metafile-islands.json'),
        'utf-8'
      )
    ]);
    metafiles = {
      ssr: JSON.parse(ssrMetafileString),
      public: JSON.parse(publicMetafileString),
      islands: JSON.parse(islandsMetafileString)
    };
    // Reverse map source file to output JS and CSS file
    manifests = Object.fromEntries(
      Object.entries(metafiles).map(([key, metafile]) => [
        key,
        Object
          .entries(metafile.outputs)
          .reduce((acc, [outputFileName, info]) => {
            if (info.entryPoint) {
              acc[info.entryPoint] = {
                jsFile: outputFileName,
                cssFile: info.cssBundle
              };
            }
            return acc;
          }, {})
      ])
    );
    if (isProduction) {
      manifestsCache = manifests;
      metafilesCache = metafiles;
    }
  }

  const { jsFile: islandJSFile } = manifests.islands[filePaths.islandEntryFile] || {};
  const { cssFile } = manifests.public[filePaths.pageEntryFile];
  const { jsFile: ssrJSFile } = manifests.ssr[filePaths.pageEntryFile];
  const preloadJs = (metafiles.islands.outputs[islandJSFile]?.imports || [])
    .filter(({ kind }) => kind === 'import-statement')
    .map(({ path: filePath }) => path.resolve(publicURLPath, path.relative(publicDirectoryRelative, filePath)));
  const exports = await import(getRelativePathToSSRDist(ssrJSFile));
  const liveReloadScript = isProduction
    ? undefined
    : `http://${hostname.split(':')[0]}:35731/livereload.js?snipver=1`;

  return {
    js: islandJSFile ? `${publicURLPath}/${path.relative(publicDirectoryRelative, islandJSFile)}` : '',
    preloadJs,
    css: `${publicURLPath}/${path.relative(publicDirectoryRelative, cssFile)}`,
    exports,
    liveReloadScript
  };
}

export default getPage;
