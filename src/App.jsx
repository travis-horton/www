import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// The small pages ride in the main bundle. Each from its own folder, not
// through a pages barrel: a barrel that re-exported the three below would pull
// them back into the main bundle.
import Home from './pages/Home';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import {
  Header,
  Footer,
  DevBadge,
  ErrorBoundary,
  Canonical,
  Titled,
} from './sharedComponents';

// CODE SPLITTING (26.1009). These three are loaded only when someone opens
// them: /learn (both courses' word lists), /programming (the clock and the
// demos) and /piano (the performances list) were about 130 KB that every
// visitor downloaded, though most never open them. The router's navigations
// run as transitions (v7_startTransition), so on a click the current page
// stays up while the next one loads; the empty fallback only shows on a first
// visit straight to one of these addresses, for the moment its file takes.
const Programming = lazy(() => import('./pages/Programming'));
const Piano = lazy(() => import('./pages/Piano'));
const Learn = lazy(() => import('./pages/Learn'));

function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Header />
      <Canonical />
      {/* A page that throws takes only itself down, not the header and footer.
          That includes a page whose file failed to load (Suspense is inside
          the boundary, so a failed load shows the boundary's message). */}
      <ErrorBoundary>
        {/* Tab titles: set here for single pages; the three sections
            (programming, blog, learn) title their own pages. Home keeps the
            site's own title. */}
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/programming/*" element={<Programming />} />
            <Route
              path="/piano"
              element={
                <Titled title="Piano">
                  <Piano />
                </Titled>
              }
            />
            <Route path="/blog/*" element={<Blog />} />
            <Route
              path="/contact"
              element={
                <Titled title="Contact">
                  <Contact />
                </Titled>
              }
            />
            <Route path="/learn/*" element={<Learn />} />
            {/* The clock moved under /programming (Travis, 26.0905). Kept as a
            redirect because the old path has been handed out. */}
            <Route
              path="/clock"
              element={<Navigate to="/programming/clock" replace />}
            />
            <Route
              path="*"
              element={
                <Titled title="Not found">
                  <NotFound />
                </Titled>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Footer />
      {/* Only ever visible on kiddspazz.com — the sandbox deploy. */}
      <DevBadge />
    </BrowserRouter>
  );
}

export default App;
