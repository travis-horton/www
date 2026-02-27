import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '.';

test('renders without crashing', () => {
  render(<MemoryRouter><Header /></MemoryRouter>);
});

test('marks the home link as selected on the home route', () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={['/']}>
      <Header />
    </MemoryRouter>
  );
  expect(getByText('about me').closest('a')).toHaveClass('nav__item--selected');
});

test('marks the correct link as selected on a sub-route', () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={['/programming']}>
      <Header />
    </MemoryRouter>
  );
  expect(getByText('software engineer').closest('a')).toHaveClass('nav__item--selected');
});

test('does not mark other links as selected', () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={['/programming']}>
      <Header />
    </MemoryRouter>
  );
  expect(getByText('about me').closest('a')).not.toHaveClass('nav__item--selected');
  expect(getByText('pianist').closest('a')).not.toHaveClass('nav__item--selected');
});
