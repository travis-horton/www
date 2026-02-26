import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '.';

test('renders without crashing', () => {
  render(<MemoryRouter><Header /></MemoryRouter>);
});
