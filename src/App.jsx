import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {
  Home, Piano, Programming, Blog, Contact, Journal, NotFound,
} from './pages';
import { Header, Footer } from './sharedComponents';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/programming/*" element={<Programming />} />
        <Route path="/piano" element={<Piano />} />
        <Route path="/blog/*" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
