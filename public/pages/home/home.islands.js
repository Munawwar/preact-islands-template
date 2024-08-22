import { html } from 'htm/preact'
import { hydrate } from 'preact'
import { Counter } from './Counter.js'

function Island1({ pageContext }) {
  return html`
    <ul>
      <li>Rendered to HTML.</li>
      <li>Interactive. <${Counter} initialState=${pageContext.counter} /></li>
    </ul>
  `
}

// Make part of the HTML interactive
if (typeof window !== 'undefined') {
  const el = document.getElementById('island1')
  hydrate(html`<${Island1} pageContext=${window.pageContext} />`, el)
}

export { Island1 }
