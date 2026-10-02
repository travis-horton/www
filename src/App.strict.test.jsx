import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

/*
 * The whole site under React.StrictMode, with nothing mocked: every page and
 * every demo module is imported for real. StrictMode mounts each component
 * twice and reports what it finds through console.error (legacy lifecycles,
 * a missing list key, a state update during render), so the test is simply
 * that React had nothing to say.
 */
afterEach(() => {
  window.history.pushState({}, '', '/');
});

test.each([
  ['/', 'Travis Horton'],
  ['/programming', 'Personal Projects'],
  ['/piano', 'Collaborative piano'],
  ['/contact', 'Resume'],
])(
  'the real app at %s renders under StrictMode without a console.error',
  (path, heading) => {
    window.history.pushState({}, '', path);
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    const calls = consoleSpy.mock.calls.map((args) =>
      args.map(String).join(' '),
    );
    consoleSpy.mockRestore();

    // The page really is on screen, so a silent console is not an empty page.
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(calls).toEqual([]);
  },
);
