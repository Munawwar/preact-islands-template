import { build } from 'esbuild'
import { globby as glob } from 'globby'
import { deleteAsync as rimraf } from 'del'
import {
  publicDirectoryRelative,
  ssrDirectory,
  ssrDirectoryRelative,
  publicURLPath,
  publicDirectory,
} from './server/paths.js'
import { promises as fs } from 'node:fs'
import { parseArgs } from 'node:util'

const {
  values: { dev: isDevMode },
} = parseArgs({
  options: {
    dev: {
      type: 'boolean',
      default: false,
    },
  },
})

const clientOutBase = 'client/'

const [ssrEntryPoints, clientEntryPoints] = await Promise.all([
  glob(`${clientOutBase}/pages/**/*.page.jsx`),
  glob(`${clientOutBase}/pages/**/*.islands.jsx`),
  // clean current dist/
  rimraf('dist/'),
])

const commonConfig = {
  publicPath: publicURLPath,
  outbase: clientOutBase,
  format: 'esm',
  bundle: true,
  sourcesContent: isDevMode,
  entryNames: '[dir]/[name]-[hash]',
  metafile: true,
  loader: {
    '.svg': 'file',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.webp': 'file',
  },
  resolveExtensions: ['.jsx', '.ts', '.tsx'],
  jsxImportSource: 'preact',
  jsx: 'automatic',
}

// Why 3 builds?
// 1. Islands JS - This is all JS the client needs. 'Full page' JS can be deleted.
// 2. Page assets - CSS, images etc are of the entire page (the static part of page + islands). Island specific css can be deleted.
// 3. SSR build - Non-minified full page JS for server side for better stack traces
// And also because preact-render-to-string includes node.js copy of preact. If you don't exclude preact from the build,
// you would cause two preact copies (one in the bundled JS and one from preact-render-to-string)
// Also note, using hashed SSR files just like client build, so that server can dynamic import() changes without restarting full server
const [tempBuildResult, ssrBuildResult] = await Promise.all([
  // Full page build
  build({
    entryPoints: ssrEntryPoints,
    outdir: publicDirectoryRelative,
    splitting: true,
    minify: true,
    sourcemap: true,
    external: ['preact'],
    ...commonConfig,
  }),
  // SSR build
  build({
    entryPoints: ssrEntryPoints,
    outdir: ssrDirectoryRelative,
    splitting: false,
    minify: false,
    sourcemap: 'external',
    external: ['preact', 'preact-render-to-string'],
    ...commonConfig,
  }),
])

await Promise.all([
  fs.writeFile(`${publicDirectory}/metafile.json`, JSON.stringify(tempBuildResult.metafile, 0, 2)),
  fs.writeFile(`${ssrDirectory}/metafile.json`, JSON.stringify(ssrBuildResult.metafile, 0, 2)),
  rimraf(`${publicDirectoryRelative}**/*.page.js(.map)?`),
  rimraf(`${publicDirectoryRelative}**/chunk-*.js(.map)?`),
])

// Island JS build
const islandBuildResult = await build({
  entryPoints: clientEntryPoints,
  outdir: publicDirectoryRelative,
  splitting: true,
  minify: true,
  sourcemap: true,
  metafile: true,
  ...commonConfig,
})

await Promise.all([
  // there maybe no islands for the page
  islandBuildResult?.metafile
    ? fs.writeFile(
        `${publicDirectory}/metafile-islands.json`,
        JSON.stringify(islandBuildResult.metafile, 0, 2),
      )
    : null,
  rimraf(`${publicDirectoryRelative}**/*.islands-*.css(.map)?`),
])
