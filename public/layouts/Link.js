import { html } from 'htm/preact';
import { usePageContext } from '../usePageContext.js';

function Link(props) {
  const pageContext = usePageContext();
  const className = [props.className, pageContext.urlPathname === props.href && 'is-active'].filter(Boolean).join(' ');
  return html`<a ...${props} class=${className} />`;
}

export { Link };
