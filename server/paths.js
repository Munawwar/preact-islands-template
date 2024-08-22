import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hashElement } from 'folder-hash'

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

const publicURLPath = `/public/${await computePublicDirHash()}`

export {
  __dirname,
  root,
  publicDirectory,
  publicDirectoryRelative,
  publicURLPath,
  computePublicDirHash,
}
