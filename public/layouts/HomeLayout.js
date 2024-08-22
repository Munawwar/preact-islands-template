import { html } from 'htm/preact'
import { PageContextProvider } from '../usePageContext.js'
import { Link } from './Link.js'
import { publicURLPath } from '../../server/paths.js'

const Layout = function ({ children }) {
  return html`
    <div
      style=${{
        display: 'flex',
        maxWidth: 900,
        margin: 'auto',
      }}
    >
      ${children}
    </div>
  `
}

const Sidebar = function ({ children }) {
  return html`
    <div
      style=${{
        padding: 20,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: '1.8em',
      }}
    >
      ${children}
    </div>
  `
}

const Content = function ({ children }) {
  return html`
    <div
      id="page-content"
      style=${{
        padding: 20,
        paddingBottom: 50,
        borderLeft: '2px solid #eee',
        minHeight: '100vh',
      }}
    >
      ${children}
    </div>
  `
}

function Logo() {
  return html`
    <div
      style=${{
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      <a href="/">
        <img src="${publicURLPath}/layouts/preact-logo.svg" height=${64} width=${64} alt="logo" />
      </a>
    </div>
  `
}

const HomeLayout = function ({ children, pageContext }) {
  return html`
    <${PageContextProvider} pageContext=${pageContext}>
      <${Layout}>
        <${Sidebar}>
          <${Logo} />
          <${Link} class="HomeLayout-navitem" href="/">
            Home
          </${Link}>
          <${Link} class="HomeLayout-navitem" href="/about">
            About
          </${Link}>
        </${Sidebar}>
        <${Content}>${children}</${Content}>
      </${Layout}>
    </${PageContextProvider}>
  `
}

export { HomeLayout }
