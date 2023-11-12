import { html } from 'htm/preact';
import { HomeLayout } from '../../layouts/HomeLayout.js';

function Page({ pageContext }) {
  return (html`
    <${HomeLayout} pageContext=${pageContext}>
      <h1>About</h1>
      <p>
       <code class="code">SSR demo</code>
      </p>
    </${HomeLayout}>
  `);
}

// Server render helper
// Not importing 'preact-render-to-string'.renderToString directly,
// because it will end up unnecessarily in the client side bundle
function pageToHtml(renderToString, pageContext) {
  return renderToString(html`<${Page} pageContext=${pageContext} />`);
}

export { pageToHtml };
