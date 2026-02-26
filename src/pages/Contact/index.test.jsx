import React from 'react';
import { render } from '@testing-library/react';
import Contact from '.';

test('renders without crashing', () => {
  render(<Contact />);
});
