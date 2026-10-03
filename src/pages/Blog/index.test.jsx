import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Blog from '.';

test('the blog index links to each of its three posts', () => {
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Blog />
    </MemoryRouter>,
  );

  // By name, not by count: the page has a fourth link, the neon button.
  expect(
    screen.getByRole('link', { name: "JavaScript's this" }),
  ).toHaveAttribute('href', '/js-this');
  expect(
    screen.getByRole('link', { name: 'The D Flip-Flop, pt 1' }),
  ).toHaveAttribute('href', '/the-flip-flop-1');
  expect(
    screen.getByRole('link', { name: 'The First Blog Post' }),
  ).toHaveAttribute('href', '/the-first-blog');
});
