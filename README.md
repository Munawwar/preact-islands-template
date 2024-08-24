# preact-islands-template

Example repo to start a [island architecture](https://jasonformat.com/islands-architecture/) website with Preact, express and esbuild.

If you want a less complex template (without island architecture) check [preact-mpa-template](https://github.com/Munawwar/preact-mpa-template).

If you don't need server side rendering (SSR) check [preact-spa-template](https://github.com/Munawwar/preact-spa-template).

- <span aria-hidden>🐢</span> JS, CSS, image files are content hashed ("fingerprinted") on prod for long lived caching
- <span aria-hidden>🤵‍♂️</span> Express JS server
- <span aria-hidden>🔄</span> Live reload
- <span aria-hidden>✂️</span> Shared code chunks / Code splitting (read esbuild docs for caveats)
- <span aria-hidden>🚀</span> Preload shared chunks
- <span aria-hidden>🌐</span> Static files deployable to S3 behind a CDN

```sh
# Note you need node.js v18.18+ or v20.6+ for server hot-reload to work
# Dev
npm run dev

# Prod
npm run build
npm run start
```

VSCode note: Install [es6-string-html](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) extension to syntax highlight HTML inside of JS template literals.

## Structure

Example server uses a config file for mapping URL pattern to server handling function. Config file is at `server/routes.js`. This gives full flexibility on how routes and URLs are handled.

Entry files to a page should placed in `client/pages/{name}/{name}.page.jsx`. Entry files should server render the entire page's HTML, that can optionally include islands from `client/pages/{name}/{name}.islands.jsx`.

Islands javascript will be loaded on the client side. Other than islands javascript, no other javascript from *.page.jsx will load on the client side.


You will have to do at least a couple of things to production-ize this template:
1. You may not want to have a single preact context for the entire website. Each page having a separate context might be better.
2. Add [HTTP/2](https://www.npmjs.com/package/http2-express-bridge) support.
3. Optionally upload files from `dist/public` directory to a file storage origin (like AWS S3) and use a CDN to intercept everything under URL path `/public/*` (on the same domain as the express server) to point to the file storage origin. Remove express.js compression and enable dynamic compression on the CDN.
4. You might want a CSS solution like CSS modules or utility CSS (look into esbuild plugins for these)

## Credits

Thanks to [vite-plugin-ssr](https://vite-plugin-ssr.com/) for some inspiration and example snippets, but I didn't use Vite here.