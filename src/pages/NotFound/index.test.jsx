import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '.';

test('the 404 page says 404 and offers a link home', () => {
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <NotFound />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole('heading', { level: 1, name: '404' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'take me home' })).toHaveAttribute(
    'href',
    '/',
  );
});
