import { build } from 'esbuild';
import { globby as glob } from 'globby';
import { deleteAsync as rimraf } from 'del';
import manifestPlugin from 'esbuild-plugin-manifest';
import {
  publicDirectoryRelative,
  ssrDirectoryRelative,
  publicURLPath,
  publicDirectory
} from './server/paths.js';
import { promises } from 'node:fs';

const clientOutBase = 'client/';

const [ssrEntryPoints, clientEntryPoints] = await Promise.all([
  glob(`${clientOutBase}/pages/**/*.page.jsx`),
  glob(`${clientOutBase}/pages/**/*.islands.jsx`),
  // clean current dist/
  rimraf('dist/')
]);

const commonConfig = {
  publicPath: publicURLPath,
  outbase: clientOutBase,
  format: 'esm',
  bundle: true,
  sourcemap: true,
  loader: {
    '.svg': 'file',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.webp': 'file'
  },
  resolveExtensions: ['.jsx', '.ts', '.tsx'],
  jsxImportSource: 'preact',
  jsx: 'automatic'
};

// Why 3 builds?
// 1. Client side JS - This is the JS for the islands only
// 2. Rest of client side assets - CSS, images etc are of the entire page (the static part of page + islands).
// 3. SSR build - Non-minified full page JS for server side for better stack traces
// And also because preact-render-to-string includes node.js copy of preact. If you don't exclude preact from the build,
// you would cause two preact copies (one in the bundled JS and one from preact-render-to-string)
await Promise.all([
  // Full page build
  build({
    entryPoints: ssrEntryPoints,
    outdir: publicDirectoryRelative,
    splitting: true,
    minify: true,
    plugins: [manifestPlugin()],
    external: ['preact'],
    ...commonConfig
  }),
  // SSR build
  build({
    entryPoints: ssrEntryPoints,
    outdir: ssrDirectoryRelative,
    splitting: false,
    minify: false,
    external: ['preact', 'preact-render-to-string'],
    ...commonConfig
  })
]);

await Promise.all([
  rimraf(`${publicDirectoryRelative}**/*.page.js(.map)?`),
  rimraf(`${publicDirectoryRelative}**/chunk-*.js(.map)?`)
]);

// Island JS build
const result = await build({
  entryPoints: clientEntryPoints,
  outdir: publicDirectoryRelative,
  splitting: true,
  minify: true,
  plugins: [manifestPlugin({ filename: 'manifest-islands.json' })],
  metafile: true,
  ...commonConfig
});

await Promise.all([
  result && result.metafile
    ? promises.writeFile(`${publicDirectory}/metafile.json`, JSON.stringify(result.metafile, 0, 2))
    : null,
  rimraf(`${publicDirectoryRelative}**/*.islands-*.css(.map)?`)
]);
