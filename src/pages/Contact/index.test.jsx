import React from 'react';
import { render, screen } from '@testing-library/react';
import Contact from '.';

test('no phone number on the page: email is the way to reach me (M-219)', () => {
  const { container } = render(<Contact />);

  expect(container).not.toHaveTextContent(/phone/i);
  // A ten-digit phone number, with or without dots, dashes or spaces.
  expect(container.textContent).not.toMatch(/\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/);
  expect(
    screen.getByRole('link', { name: 'travis@travish.com' }),
  ).toHaveAttribute('href', 'mailto:travis@travish.com');
});

test('the resume link points at the pdf, not at "[object Object]"', () => {
  render(<Contact />);

  // 'test-file-stub' is what jest hands a `url:` import; a bare import of the
  // pdf gets an empty object and the href would read "[object Object]".
  expect(screen.getByRole('link', { name: 'Resume (pdf)' })).toHaveAttribute(
    'href',
    'test-file-stub',
  );
});
