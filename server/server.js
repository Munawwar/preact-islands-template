import fs from 'node:fs';
import Fastify from 'fastify';
import staticMiddleware from '@fastify/static';
import compressMiddleware from '@fastify/compress';
import routes from './routes/routes.js';
import { publicURLPath, publicDirectory } from './paths.js';
const port = process.env.PORT || 5134;

const isProduction = process.env.NODE_ENV === 'production';

const app = Fastify({
  http2: true,
  https: {
    key: fs.readFileSync('certs/localhost.key'),
    cert: fs.readFileSync('certs/localhost.crt')
  },
  logger: true
});

// app.use(compression());
app.register(compressMiddleware);
app.register(staticMiddleware, {
  root: publicDirectory,
  prefix: publicURLPath
});

// Declare routes
await Promise.all(routes.map(async ({
  method = 'get',
  pattern,
  handler
}) => {
  app[method.toLowerCase()](
    pattern,
    async (req, reply) => {
      let routeHandler;
      try {
        // Lazy-load the routes so that node.js doesn't incur a heavy start-up
        // cost both on production and dev (speeds up nodemon reload).
        if (!routeHandler) {
          routeHandler = (await import(`./routes/${handler}`)).default;
        }
      } catch (err) {
        console.error('Could not find handler file:', handler);
        throw err;
      }
      return routeHandler(req, reply);
    }
  );
}));

app.setErrorHandler(function (error, request, reply) {
  if (error instanceof Fastify.errorCodes.FST_ERR_BAD_STATUS_CODE) {
    // Log error
    this.log.error(error);
    // Send error response
    reply.status(500).send('Unexpected error');
  } else {
    // fastify will use parent error handler to handle this
    reply.send(error);
  }
});

try {
  await app.listen({ port });
  console.log(`Server running at https://localhost:${port}`);

  if (!isProduction) {
    const livereload = await import('livereload');
    const lrserver = livereload.createServer({
      port: 35731,
      delay: 50,
      usePolling: true // reload doesn't work reliable on linux/ubuntu (ext4 filesystem even) without this
    });
    lrserver.watch(publicDirectory);
  }
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
