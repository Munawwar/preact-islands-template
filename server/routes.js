// Lazy-load the routes so that node.js doesn't incur a heavy start-up
// cost both on production and dev (speeds up nodemon reload).
export default [
  {
    method: 'GET',
    pattern: '/', // Fastify route pattern. check Fastify documentation
    handler: () => import('./routes/home/get-home.js'),
  },
  {
    method: 'GET',
    pattern: '/about',
    handler: () => import('./routes/about/get-about.js'),
  },
]
