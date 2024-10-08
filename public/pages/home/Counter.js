import { html } from 'htm/preact'
import { useState } from 'preact/hooks'

function Counter({ initialState = 0 }) {
  const [count, setCount] = useState(initialState)
  return html`
    <button type="button" onClick=${() => setCount((count) => count + 1)}>Counter ${count}</button>
  `
}

export { Counter }
