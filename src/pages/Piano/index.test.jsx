import React from 'react';
import { render } from '@testing-library/react';
import Piano from '.';

test('renders without crashing', () => {
  render(<Piano />);
});
