import livereload from 'livereload'
import { distDirectory, root } from './paths.js'
const lrserver = livereload.createServer({
  port: 35731,
  delay: 50,
  usePolling: true, // reload doesn't work reliable on linux/ubuntu (ext4 filesystem even) without this
})
lrserver.watch([distDirectory, `${root}/server/`])
