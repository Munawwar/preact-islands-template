import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, `../`);
const publicDirectoryRelative = 'public/';
const publicDirectory = `${root}/${publicDirectoryRelative}`;
const publicURLPath = '/public';

export {
  __dirname,
  root,
  publicURLPath,
  publicDirectory,
  publicDirectoryRelative
};
