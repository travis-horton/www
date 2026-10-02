import React from 'react';
import { render, screen, within } from '@testing-library/react';
import App from './App';

jest.mock('./pages/Programming', () => ({
  default: () => null,
  __esModule: true,
}));

test('renders the navigation header', () => {
  render(<App />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});

test('renders the home page by default', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: 'Travis Horton' }),
  ).toBeInTheDocument();
});

test('renders all nav links', () => {
  render(<App />);
  // Scoped to the <nav>: the About page body also links to /programming
  // ("Software engineer"), so an unscoped getByRole finds two matches.
  const nav = within(screen.getByRole('navigation'));
  expect(nav.getByRole('link', { name: /about me/i })).toBeInTheDocument();
  expect(
    nav.getByRole('link', { name: /software engineer/i }),
  ).toBeInTheDocument();
  expect(nav.getByRole('link', { name: /pianist/i })).toBeInTheDocument();
  expect(nav.getByRole('link', { name: /blog/i })).toBeInTheDocument();
  expect(nav.getByRole('link', { name: /contact/i })).toBeInTheDocument();
});

// The StrictMode check lives in App.strict.test.jsx, where nothing is mocked.
