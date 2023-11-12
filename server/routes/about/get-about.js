import { renderToString } from "preact-render-to-string";
import getPage from "../../getPage.js";

/**
 * @param {import('fastify').FastifyRequest} req
 * @param {import('fastify').FastifyReply} reply
 */
export default async (req, reply) => {
  const {
    js,
    preloadJs,
    css,
    exports: { pageToHtml },
    liveReloadScript
  } = await getPage('about', req.hostname);

  const pageContext = { urlPathname: req.path };
  const pageHtml = pageToHtml(renderToString, pageContext);
  const html = /* html */`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="${css}">
        ${preloadJs.map((js) => /* html */`<link rel="modulepreload" href="${js}">`).join('\n')}
        <script>window.pageContext=${JSON.stringify(pageContext)};</script>
        ${js ? /* html */`<script type="module" src="${js}"></script>` : ''}
        ${liveReloadScript ? /* html */`<script src="${liveReloadScript}"></script>` : ''}
      </head>
      <body>
        ${pageHtml}
      </body>
    </html>
  `;

  reply.headers({ 'Content-Type': 'text/html' });
  reply.send(html);
};
