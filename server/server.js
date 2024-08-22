import fs from 'node:fs'
import Fastify from 'fastify'
import staticMiddleware from '@fastify/static'
import compressMiddleware from '@fastify/compress'
import routes from './routes.js'
import { publicURLPath, publicDirectory } from './paths.js'

const port = process.env.PORT || 5134
const isDevelopment = process.env.NODE_ENV !== 'production'

const app = Fastify({
  http2: true,
  https: {
    key: fs.readFileSync('certs/localhost.key'),
    cert: fs.readFileSync('certs/localhost.crt'),
  },
})

// TODO: If you move your files to S3/CDN then you can remove this middleware.
app.register(compressMiddleware)
app.register(staticMiddleware, {
  root: publicDirectory,
  prefix: publicURLPath,
  index: false,
  setHeaders(res) {
    res.setHeader(
      'Cache-Control',
      isDevelopment ? 'max-age=0' : 'public, max-age=604800, immutable', // 7 days cache
    )
  },
})

// Declare routes
await Promise.all(
  routes.map(async ({ method = 'get', pattern, handler: fetchHandler }) => {
    app[method.toLowerCase()](
      pattern,
      /**
       * @param {import('fastify').FastifyRequest} req
       * @param {import('fastify').FastifyReply} reply
       */
      async (req, reply) => {
        if (isDevelopment) {
          // eslint-disable-next-line no-console
          console.log('Request:', req.method, req.originalUrl)
        }
        try {
          const routeHandler = (await fetchHandler()).default
          return routeHandler(req, reply)
        } catch (err) {
          console.error('Could not resolve handler file for route:', method.toUpperCase(), pattern)
          throw err
        }
      },
    )
  }),
)

app.setErrorHandler(function (error, request, reply) {
  if (error instanceof Fastify.errorCodes.FST_ERR_BAD_STATUS_CODE) {
    // Log error
    this.log.error(error)
    // Send error response
    reply.status(500).send('Unexpected error')
  } else {
    // fastify will use parent error handler to handle this
    reply.send(error)
  }
})

try {
  await app.listen({ port })
  // eslint-disable-next-line no-console
  console.log(`Server running at https://localhost:${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
