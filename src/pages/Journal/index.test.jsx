import React from 'react';
import { render } from '@testing-library/react';
import Journal from '.';

jest.mock('./utils/journal_data', () => [
  { date: 1735689600000, mental_health: '8', s: '1' },
  { date: 1735776000000, mental_health: '6', s: '0' },
  { date: 1735862400000, mental_health: '7' },
]);

test('renders without crashing', () => {
  render(<Journal />);
});

test('applies correct mental health class to each day', () => {
  const { container } = render(<Journal />);
  const days = container.querySelectorAll('.journal__day');
  expect(days[0]).toHaveClass('mh3'); // "8" - 5 = 3
  expect(days[1]).toHaveClass('mh1'); // "6" - 5 = 1
  expect(days[2]).toHaveClass('mh2'); // "7" - 5 = 2
});

test('adds s class when day.s is non-zero', () => {
  const { container } = render(<Journal />);
  const days = container.querySelectorAll('.journal__day');
  expect(days[0]).toHaveClass('s');
});

test('does not add s class when day.s is "0"', () => {
  const { container } = render(<Journal />);
  const days = container.querySelectorAll('.journal__day');
  expect(days[1]).not.toHaveClass('s');
});

test('does not add s class when day.s is absent', () => {
  const { container } = render(<Journal />);
  const days = container.querySelectorAll('.journal__day');
  expect(days[2]).not.toHaveClass('s');
});
