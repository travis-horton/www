import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '.';

test('renders without crashing', () => {
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Header /></MemoryRouter>);
});

test('marks the home link as selected on the home route', () => {
  const { getByText } = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/']}>
      <Header />
    </MemoryRouter>
  );
  expect(getByText('about me').closest('a')).toHaveClass('nav__item--selected');
});

test('marks the correct link as selected on a sub-route', () => {
  const { getByText } = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/programming']}>
      <Header />
    </MemoryRouter>
  );
  expect(getByText('software engineer').closest('a')).toHaveClass('nav__item--selected');
});

test('does not mark other links as selected', () => {
  const { getByText } = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/programming']}>
      <Header />
    </MemoryRouter>
  );
  expect(getByText('about me').closest('a')).not.toHaveClass('nav__item--selected');
  expect(getByText('pianist').closest('a')).not.toHaveClass('nav__item--selected');
});

// The icons are the whole nav below 500px (the labels are hidden), so a broken
// src leaves phones with no readable navigation. Parcel resolves an image to a
// URL only through the `url:` scheme; a bare import is `{}` (bareAssetMock),
// which React renders as src="[object Object]".
test('every nav icon src is a real URL from a url: import', () => {
  const { container } = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
    </MemoryRouter>,
  );
  const icons = container.querySelectorAll('img.nav__icon');
  expect(icons).toHaveLength(5);
  icons.forEach((icon) => {
    expect(icon.getAttribute('src')).toBe('test-file-stub');
  });
});
