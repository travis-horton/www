import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import {
  Home,
  Piano,
  Programming,
  Blog,
  Contact,
  Learn,
  NotFound,
} from './pages';
import { Header, Footer, DevBadge, ErrorBoundary } from './sharedComponents';

function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Header />
      {/* A page that throws takes only itself down, not the header and footer. */}
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programming/*" element={<Programming />} />
          <Route path="/piano" element={<Piano />} />
          <Route path="/blog/*" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/learn/*" element={<Learn />} />
          {/* The clock moved under /programming (Travis, 26.0905). Kept as a
            redirect because the old path has been handed out. */}
          <Route
            path="/clock"
            element={<Navigate to="/programming/clock" replace />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
      <Footer />
      {/* Only ever visible on kiddspazz.com — the sandbox deploy. */}
      <DevBadge />
    </BrowserRouter>
  );
}

export default App;
