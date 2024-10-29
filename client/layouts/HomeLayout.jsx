import logo from './preact-logo.svg'
import { PageContextProvider } from '../usePageContext'
import { Link } from './Link'
import './HomeLayout.css'

const HomeLayout = function ({ children, pageContext }) {
  return (
    <PageContextProvider pageContext={pageContext}>
      <Layout>
        <Sidebar>
          <Logo urlPathname={pageContext?.urlPathname} />
          <Link className="navitem" href="/">
            Home
          </Link>
          <Link className="navitem" href="/about">
            About
          </Link>
        </Sidebar>
        <Content>{children}</Content>
      </Layout>
    </PageContextProvider>
  )
}

const Layout = function ({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        maxWidth: 900,
        margin: 'auto',
      }}
    >
      {children}
    </div>
  )
}

const Sidebar = function ({ children }) {
  return (
    <div
      style={{
        padding: 20,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: '1.8em',
      }}
    >
      {children}
    </div>
  )
}

const Content = function ({ children }) {
  return (
    <div
      id="page-content"
      style={{
        padding: 20,
        paddingBottom: 50,
        borderLeft: '2px solid #eee',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  )
}

function Logo({ urlPathname }) {
  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      <a href="/" data-no-instant={urlPathname === '/'}>
        <img src={logo} height={64} width={64} alt="logo" />
      </a>
    </div>
  )
}

export { HomeLayout }
