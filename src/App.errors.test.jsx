import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

/*
 * A page that throws while rendering must not take the whole site with it.
 * Without a boundary React unmounts the root and the visitor gets a white
 * page — no header, no footer, no way back. That is what "constructor" in
 * the /learn search did in production (26.0925).
 */
jest.mock('./pages/Home', () => ({
  __esModule: true,
  default: () => {
    throw new Error('boom');
  },
}));

jest.mock('./pages/Programming', () => ({
  default: () => null,
  __esModule: true,
}));

test('a page that throws leaves the header, the footer and a way home', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  render(<App />);
  spy.mockRestore();

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent(/went wrong/i);
  expect(screen.getByRole('link', { name: /reload/i })).toBeInTheDocument();
});
