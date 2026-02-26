import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Blog from '.';

test('renders without crashing', () => {
  render(<MemoryRouter><Blog /></MemoryRouter>);
});
