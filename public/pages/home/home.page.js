import { html } from 'htm/preact'
import { Island1 } from './home.islands.js'
import { HomeLayout } from '../../layouts/HomeLayout.js'

function Page({ pageContext }) {
  return html`
    <${HomeLayout} pageContext=${pageContext}>
      <h1>Welcome</h1>
      This page is:
      <div id="island1">
        <${Island1} pageContext=${pageContext} />
      </div>
    </${HomeLayout}>
  `
}

// Server render helper
// Not importing 'preact-render-to-string'.renderToString directly,
// because it will end up unnecessarily in the client side bundle
function pageToHtml(renderToString, pageContext) {
  return renderToString(html`<${Page} pageContext=${pageContext} />`)
}

export { pageToHtml }
