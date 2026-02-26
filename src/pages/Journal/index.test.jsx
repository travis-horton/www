import React from 'react';
import { render } from '@testing-library/react';
import Journal from '.';

test('renders without crashing', () => {
  render(<Journal />);
});
