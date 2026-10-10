import React from 'react';
import { act, render, screen } from '@testing-library/react';
import App from './App';

/*
 * The whole site under React.StrictMode, with nothing mocked: every page and
 * every demo module is imported for real. StrictMode mounts each component
 * twice and reports what it finds through console.error (legacy lifecycles,
 * a missing list key, a state update during render), so the test is simply
 * that React had nothing to say.
 *
 * Since 26.1009 /programming, /piano and /learn are loaded only when opened
 * (React.lazy in App.jsx), so each render is awaited inside act() until the
 * page's file has arrived, and the heading is found with findByRole.
 *
 * /learn, /clock (a redirect to /programming/clock, the page with the
 * animation-frame hook), an unknown address and a blog post were added
 * 26.1009 (the #125 second review: only 4 of the routes were covered).
 */
afterEach(() => {
  window.history.pushState({}, '', '/');
});

test.each([
  ['/', 'Travis Horton'],
  ['/programming', 'Personal Projects'],
  ['/piano', 'Collaborative piano'],
  ['/contact', 'Resume'],
  ['/learn', 'Learn'],
  ['/clock', 'Clock'],
  ['/no-such-page', '404'],
  ['/blog/js-this', /^Javascript's/],
])(
  'the real app at %s renders under StrictMode without a console.error',
  async (path, heading) => {
    window.history.pushState({}, '', path);
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    await act(async () => {
      render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    });

    // The page really is on screen, so a silent console is not an empty page.
    expect(
      await screen.findByRole('heading', { name: heading }),
    ).toBeInTheDocument();
    const calls = consoleSpy.mock.calls.map((args) =>
      args.map(String).join(' '),
    );
    consoleSpy.mockRestore();
    expect(calls).toEqual([]);
  },
);
