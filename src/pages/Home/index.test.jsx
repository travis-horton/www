import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '.';

test('the home page is headed "Travis Horton" and its headshot has a real URL', () => {
  const { container } = render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Home />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole('heading', { level: 1, name: 'Travis Horton' }),
  ).toBeInTheDocument();

  // 'test-file-stub' is what jest hands a `url:` import. A bare import gets
  // an empty object, as it does from Parcel, and these two would read
  // "[object Object]".
  expect(screen.getByAltText('headshot')).toHaveAttribute(
    'src',
    'test-file-stub',
  );
  expect(container.querySelector('img.thumb')).toHaveAttribute(
    'src',
    'test-file-stub',
  );
});
