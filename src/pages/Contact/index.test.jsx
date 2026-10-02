import React from 'react';
import { render, screen } from '@testing-library/react';
import Contact from '.';

test('the resume link points at the pdf, not at "[object Object]"', () => {
  render(<Contact />);

  // 'test-file-stub' is what jest hands a `url:` import; a bare import of the
  // pdf gets an empty object and the href would read "[object Object]".
  expect(screen.getByRole('link', { name: 'Resume (pdf)' })).toHaveAttribute(
    'href',
    'test-file-stub',
  );
});
