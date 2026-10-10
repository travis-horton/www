import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';

import { Canonical, HOME_TITLE, Titled, titleFor, useDocumentTitle } from '.';

const canonical = () =>
  document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');

function Untitled() {
  return <Link to="/piano">to piano</Link>;
}

function SetsItsOwn() {
  useDocumentTitle('Own');
  return <Link to="/">home</Link>;
}

const site = (start) => (
  <MemoryRouter initialEntries={[start]}>
    <Canonical />
    <Routes>
      <Route path="/" element={<Untitled />} />
      <Route
        path="/piano"
        element={
          <Titled title="Piano">
            <Link to="/own">to own</Link>
          </Titled>
        }
      />
      <Route path="/own" element={<SetsItsOwn />} />
    </Routes>
  </MemoryRouter>
);

beforeEach(() => {
  document.title = 'stale';
  document.head
    .querySelectorAll('link[rel="canonical"]')
    .forEach((link) => link.remove());
});

test('a titled page reads "<page> · Travis Horton"; no title is the home title', () => {
  expect(titleFor('Piano')).toBe('Piano · Travis Horton');
  expect(titleFor()).toBe(HOME_TITLE);
});

test('the tab title follows the page, and a page with none never keeps the last one', () => {
  render(site('/piano'));
  expect(document.title).toBe('Piano · Travis Horton');
  fireEvent.click(screen.getByText('to own'));
  expect(document.title).toBe('Own · Travis Horton');
  fireEvent.click(screen.getByText('home'));
  // The home route sets no title: it gets the site's own, not "Own".
  expect(document.title).toBe(HOME_TITLE);
});

test('one canonical link, naming this page on www.travish.com, kept up to date', () => {
  render(site('/'));
  expect(canonical()).toBe('https://www.travish.com/');
  fireEvent.click(screen.getByText('to piano'));
  expect(canonical()).toBe('https://www.travish.com/piano');
  expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(
    1,
  );
});
