import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

jest.mock('./pages/Programming', () => ({ default: () => null, __esModule: true }));

test('renders without crashing', () => {
  render(<App />);
});
