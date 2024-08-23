/* eslint-disable no-console */
import fs from 'node:fs'
import { computePublicDirHash } from './server/paths.js'

const hash = await computePublicDirHash()

fs.writeFileSync('server/hash.txt', hash, 'utf-8')

console.log(hash)
