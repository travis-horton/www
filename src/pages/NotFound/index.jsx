import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main>
      <p style={{ fontSize: '4rem' }}>🤔</p>
      <h1>404</h1>
      <p>hm, nothing here</p>
      <Link to="/">take me home</Link>
    </main>
  );
}

export default NotFound;
