import getPage from "../../getPage.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export default async (req, res) => {
  const {
    js,
    preloadJs,
    css,
    exports: { pageToHtml },
    preactRenderToStringExports: {
      renderToString
    },
    liveReloadScript
  } = await getPage('home', req.hostname);

  const pageContext = { counter: 10 };
  const pageHtml = pageToHtml(pageContext, renderToString);
  const html = /* html */`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="${css}">
        <script>window.pageContext=${JSON.stringify(pageContext)};</script>
        ${preloadJs.map((js) => /* html */`<link rel="modulepreload" href="${js}">`).join('\n')}
        <script type="module" src="${js}"></script>
        ${liveReloadScript ? /* html */`<script src="${liveReloadScript}"></script>` : ''}
      </head>
      <body>
        <!--
          Giant Island - for demo purpose. You can add static HTML and
          split into proper islands and contexts as needed 
        -->
        ${pageHtml}
      </body>
    </html>
  `;

  res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
};
