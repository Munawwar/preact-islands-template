// Example context provider

import { html } from 'htm/preact'
import { createContext } from 'preact'
import { useContext } from 'preact/hooks'

const Context = createContext(undefined)

function PageContextProvider({ pageContext, children }) {
  return html`<${Context.Provider} value=${pageContext}>${children}</${Context.Provider}>`
}

function usePageContext() {
  const pageContext = useContext(Context)
  return pageContext
}

export { PageContextProvider, usePageContext }
