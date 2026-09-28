import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/*
 * One page throwing while it renders must not take the site with it.
 *
 * With no boundary, React unmounts the whole root on a render error: the
 * header, the footer and every link go with the broken page, and the visitor
 * is left on a blank white screen. That happened on 26.0925 — typing
 * "constructor" into the /learn search threw inside a useMemo.
 *
 * Error boundaries still have to be class components; there is no hook for
 * componentDidCatch. The wrapper below keys the boundary by path, so moving to
 * another page clears the error instead of leaving the fallback stuck on screen.
 */
class Boundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Still visible in the console for whoever is debugging it.
    console.error(error);
  }

  render() {
    const { failed } = this.state;
    const { children, path } = this.props;
    if (!failed) return children;
    return (
      <main>
        <div role="alert">
          <h1>Something went wrong on this page.</h1>
          <p>
            The rest of the site is fine. <a href={path}>Reload this page</a>,
            or <Link to="/">go home</Link>.
          </p>
        </div>
      </main>
    );
  }
}

function ErrorBoundary({ children }) {
  const { pathname } = useLocation();
  return (
    <Boundary key={pathname} path={pathname}>
      {children}
    </Boundary>
  );
}

export default ErrorBoundary;
