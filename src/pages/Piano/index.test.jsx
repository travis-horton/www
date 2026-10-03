import React from 'react';
import { render, screen } from '@testing-library/react';
import Piano from '.';

test('the piano page has its collaborative-piano and performances sections', () => {
  render(<Piano />);

  expect(
    screen.getByRole('heading', { name: 'Collaborative piano' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Performances' }),
  ).toBeInTheDocument();
});
