import React from 'react';
import { Link } from 'react-router-dom';

// The body on its own, for the nested routers (Programming, Blog, Learn).
// Each of those already renders the page's <main>, and a <main> inside a
// <main> is invalid HTML — so they mount this, not NotFound.
export function NotFoundContent() {
  return (
    <>
      <p style={{ fontSize: '4rem' }}>🤔</p>
      <h1>404</h1>
      <p>hm, nothing here</p>
      <Link to="/">take me home</Link>
    </>
  );
}

function NotFound() {
  return (
    <main>
      <NotFoundContent />
    </main>
  );
}

export default NotFound;
