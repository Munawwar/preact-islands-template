# preact-islands-template

Example repo to start a [island architecture](https://jasonformat.com/islands-architecture/) website with Preact, express and esbuild.

If you want a less complex template (without island architecture) check [preact-mpa-template](https://github.com/Munawwar/preact-mpa-template).

If you don't need server side rendering (SSR) check [preact-spa-template](https://github.com/Munawwar/preact-spa-template).

- <span aria-hidden>🐢</span> No build
- <span aria-hidden>🤵‍♂️</span> Fastify server (HTTP2)
- <span aria-hidden>🔄</span> Live reload on dev
- <span aria-hidden>🌐</span> Static files deployable to CDN

NOTE: This template only works with node.js 20 due to its reliance on node.js experimental loader `hot-esm` for busting dynamic `import()` cache.

HTTP/2 works only with certificate. So first create localhost certificate and key:
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

Islands javascript will be loaded on the client side. Other than islands javascript, no other javascript from *.page.jsx will load on the client side.


You will have to do at least a couple of things to production-ize this template:
1. You may not want to have a single preact context for the entire website. Each page having a separate context might be better.
2. Optionally upload files from `/public` directory to a file storage origin (like AWS S3) and use a CDN to intercept everything under URL path `/public/*` (on the same domain as the express server) to point to the file storage origin. Remove express.js compression and enable dynamic compression on the CDN.

## "No build" pros and cons

Pros
- Don't have to mess with a build tool

Cons
- Browser needs to support [import maps](https://caniuse.com/import-maps).
- Long lived caching cannot be done (with absolute zero build step). Browsers will revalidate ETags and your server will send 304. This means more hits to the server / CDN.
- On development, usually any file import()ed for SSR purpose is cached till the server is restarted. And restarting the server breaks browser-side livereload. To overcome this I am relying on an experimental [loader](https://nodejs.org/api/esm.html#esm_experimental_loaders) named `hot-esm`. This could break in a future version.

## Credits

Thanks to [vite-plugin-ssr](https://vite-plugin-ssr.com/) for some inspiration and example snippets, but I didn't use Vite here.