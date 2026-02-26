import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/Programming', () => ({ default: () => null, __esModule: true }));

test('renders the navigation header', () => {
  render(<App />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});

test('renders the home page by default', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Travis Horton' })).toBeInTheDocument();
});

test('renders all nav links', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /about me/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /software engineer/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /pianist/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
});

test('has no React StrictMode incompatible components', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  render(<React.StrictMode><App /></React.StrictMode>);
  const unsafeWarnings = consoleSpy.mock.calls.filter(
    ([msg]) => typeof msg === 'string' && msg.includes('UNSAFE_'),
  );
  consoleSpy.mockRestore();
  expect(unsafeWarnings).toHaveLength(0);
});
