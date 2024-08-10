# preact-islands-template

Example repo to start a [island architecture](https://jasonformat.com/islands-architecture/) website with Preact and Fastify.

- <span aria-hidden>🐇</span> No build
- <span aria-hidden>🤵‍♂️</span> Fastify server (HTTP2)
- <span aria-hidden>🔄</span> Live reload on dev
- <span aria-hidden>🌐</span> Static files deployable to a CDN

NOTE: This template only works with latest node.js 18 (tested on v18.18+, didn't work on v18.17), node.js 20 (v20.6+) due to its reliance on experimental loader for busting dynamic `import()` cache.

## Dev setup

For HTTP/2 to work, a self-signed certificate and key need to be created:
```sh
mkdir certs
cd certs
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

Then
```sh
npm ci

# Dev
npm run dev

# Prod
npm run start
```

VSCode note: Install [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) extension to syntax highlight HTML inside of JS template literals.

## Structure

Example server uses a config file for mapping URL pattern to server handling function. Config file is at `server/routes/routes.js`. This gives full flexibility on how routes and URLs are handled.

Entry files to a page should placed in `client/pages/{name}/{name}.page.js`. Entry files should server render the entire page's HTML, that can optionally include islands from `client/pages/{name}/{name}.islands.js`.

Islands javascript will be loaded on the client side. Other than islands javascript, no other javascript from *.page.js will load on the client side.


You will have to do at least a couple of things to production-ize this template:
1. You may not want to have a single preact context for the entire website. Each page having a separate context might be better.
2. Optionally upload files from `/public` directory to a file storage origin (like AWS S3) and use a CDN to intercept everything under URL path `/public/*` (on the same domain as the express server) to point to the file storage origin. Remove express.js compression and enable dynamic compression on the CDN.

## "No build" pros and cons

Pros
- Don't have to mess with a build tool. Simpler local development setup and CI steps.

Cons
- Browser needs to support [import maps](https://caniuse.com/import-maps).
- Long lived caching cannot be done (with absolute zero build step). Browsers will revalidate ETags and your server will send HTTP status 304 Not Modified. This means more hits to the server / CDN.
- More chances of waterfall requests when importing JS. Especially if you have lots of nested imports. HTTP/2 can only mitigate the effects of it a bit. But again this is an "islands" template. I expect less JS. If your "island" is as big as Australia then isn't that a continent?

## Credits

Thanks to [vite-plugin-ssr](https://vite-plugin-ssr.com/) for some inspiration and example snippets, but I didn't use Vite here.