/* eslint-disable no-control-regex, no-console */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs, { promises as fsPromise } from 'node:fs'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const nodeModulesDir = path.resolve(__dirname, 'node_modules')
const importMapCacheDir = path.resolve(__dirname, 'importmap_cache')
const debugDir = path.resolve(importMapCacheDir, 'debug_info')
const debugMode = process.env.IMPORT_MAP_LOADER_LOG === 'debug'

let createDirs = false

// load importmap.json
const importMap = JSON.parse(fs.readFileSync('./importmap.json', { encoding: 'utf-8' }))
if (!importMap.imports) {
  throw new Error(
    'importmap.json does not have imports as sub property. e.g { "imports": { "foo": "bar" } }',
  )
}

const unsafeFileNamePatterns =
  /[/?<>\\:*|"]|[\x00-\x1f\x80-\x9f]|^\.+$|^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$|[. ]+$/gi
/**
 * @type {{[specifier: string]: Promise<{ path: string }>|{ path: string }}}
 */
const cache = {}

function ensureRootDirExists() {
  if (createDirs) return
  fs.mkdirSync(debugDir, { recursive: true })
  createDirs = true
}
function writeDebugFile(specifier, cacheFile) {
  const specifierSlug = specifier.replace(unsafeFileNamePatterns, '-')
  const specifierPath = path.resolve(debugDir, `${specifierSlug}.js`)
  if (!fs.existsSync(specifierPath)) {
    ensureRootDirExists()
    const content = `module.exports = { specifier: '${specifier}', file: '${cacheFile}', module: await import('../${cacheFile}') }\n`
    return fsPromise.writeFile(specifierPath, content, 'utf8')
  }
  return undefined
}

/**
 * @param {string} specifier
 * @param {object} context
 * @param {string} context.parentURL
 * @param {string[]} context.conditions
 * @param {function} nextResolve
 * @returns {object} response
 * @returns {string} response.url
 */
export async function resolve(specifier, context, nextResolve) {
  let isImport = false
  for (let i = 0; i < context.conditions.length; i++) {
    if (context.conditions[i] === 'import' || context.conditions[i] === 'node') {
      isImport = true
    }
  }
  if (!isImport) {
    return nextResolve(specifier, context, nextResolve)
  }

  const { parentURL } = context
  // Defer to Node.js for all other specifiers.
  if (!specifier.includes('.') && importMap.imports[specifier]) {
    // check if node_modules does not have the specifier
    const nodeModulesPath = path.resolve(nodeModulesDir, specifier)
    try {
      if (fs.existsSync(nodeModulesPath)) {
        if (debugMode) {
          console.debug('import map loader: Load', specifier, 'from node_modules')
        }
        return nextResolve(specifier, context, nextResolve)
      }
      const sourceRepo = importMap.imports[specifier]
      // TODO: if sourceRepo doesn't exist for specfier then we should throw an error?
      // Or if IMPORT_MAP_LOADER_AUTO_ADD is set then we should add a link to unpkg?
      const hash = crypto.createHash('sha256').update(sourceRepo).digest('base64url').slice(0, 21)
      const cacheFile = `${hash}.js`
      const cachePath = path.resolve(importMapCacheDir, cacheFile)
      const parentDir = path.dirname(fileURLToPath(parentURL))
      let relativePath = path.relative(parentDir, cachePath)
      if (!relativePath.startsWith('.')) {
        relativePath = `./${relativePath}`
      }
      if (!cache[specifier]) {
        // check disk cache
        if (fs.existsSync(cachePath)) {
          cache[specifier] = { path: cachePath }
          await writeDebugFile(specifier, cacheFile)
          if (debugMode) {
            console.debug('import map loader: loaded', specifier, 'from disk cache', {
              parentURL,
              cacheFile,
            })
          }
          return nextResolve(relativePath, context, nextResolve)
        }
        cache[specifier] = fetch(importMap.imports[specifier])
          .catch((err) => {
            if (debugMode) {
              console.debug('import map loader: Could not download', specifier, err.cause)
            }
            throw err
          })
          .then((res) => res.text())
          .then(async (content) => {
            await writeDebugFile(specifier, cacheFile)
            await fsPromise.writeFile(cachePath, content, { encoding: 'utf-8' })
            cache[specifier] = { path: cachePath }
            return cache[specifier]
          })
      }

      if (debugMode && cache[specifier] instanceof Promise) {
        console.debug('import map loader: waiting for', specifier, 'download')
      }
      await cache[specifier]
      if (debugMode) {
        console.debug('import map loader: loaded', specifier, 'from memory cache', {
          parentURL,
          cacheFile,
        })
      }
      return nextResolve(relativePath, context, nextResolve)
    } catch (err) {
      // ignore
      console.error('import map loader: Error while loading', specifier, ':', err.stack)
    }
  }
  return nextResolve(specifier, context, nextResolve)
}
