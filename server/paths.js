import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hashElement } from 'folder-hash'
import fs, { promises as fsPromises } from 'node:fs'

const isProduction = process.env.NODE_ENV === 'production'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, `../`)
const publicDirectoryRelative = 'public/'
const publicDirectory = `${root}/${publicDirectoryRelative}`

async function computePublicDirHash() {
  const { hash } = await hashElement(publicDirectory, {
    algo: 'sha256',
    folders: { exclude: ['.*'] },
    files: { exclude: ['.*', 'Thumbs.db'] },
  })
  return hash.slice(0, 8).replace(/\+/g, '-')
}

let publicURLPath

if (isProduction && fs.existsSync('./hash.txt')) {
  publicURLPath = `/public/${await fsPromises.readFile('./hash.txt', { encoding: 'utf-8' })}`
} else {
  publicURLPath = `/public/${await computePublicDirHash()}`
}

export {
  __dirname,
  root,
  publicDirectory,
  publicDirectoryRelative,
  publicURLPath,
  computePublicDirHash,
}
