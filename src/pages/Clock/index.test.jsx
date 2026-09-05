/* eslint-env jest */
import React from 'react';
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Clock from '.';

const MODE_KEY = 'travish.clock.mode';

const renderAt = () => render(
  <MemoryRouter initialEntries={['/clock']}>
    <Routes>
      <Route path="/clock" element={<Clock />} />
    </Routes>
  </MemoryRouter>,
);

// 16:00 local is exactly seximal hour 24 (40₆, niftimal O) — a clean face.
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 8, 4, 16, 0, 0, 0));
  window.localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

test('opens in seximal, with the digits named', () => {
  renderAt();
  expect(screen.getByRole('button', { name: 'seximal' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('digits-hour')).toHaveTextContent('40');
  expect(screen.getByTestId('digits-minute')).toHaveTextContent('00');
  expect(screen.getByTestId('digits-second')).toHaveTextContent('00');
  expect(screen.getByTestId('name-hour')).toHaveTextContent('foursy');
  expect(screen.getByText('foursy unexian')).toBeInTheDocument();
});

test('niftimal rewrites the digits and keeps the names', () => {
  renderAt();
  fireEvent.click(screen.getByRole('button', { name: 'niftimal' }));

  expect(screen.getByRole('button', { name: 'niftimal' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'seximal' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByTestId('digits-hour')).toHaveTextContent('O');
  expect(screen.getByTestId('digits-minute')).toHaveTextContent('0');
  expect(screen.getByTestId('name-hour')).toHaveTextContent('foursy');
  expect(window.localStorage.getItem(MODE_KEY)).toBe('niftimal');
});

test('the chosen notation survives a reload', () => {
  window.localStorage.setItem(MODE_KEY, 'niftimal');
  renderAt();
  expect(screen.getByRole('button', { name: 'niftimal' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('digits-hour')).toHaveTextContent('O');
});

test('an unknown stored value falls back to seximal', () => {
  window.localStorage.setItem(MODE_KEY, 'octal');
  renderAt();
  expect(screen.getByRole('button', { name: 'seximal' })).toHaveAttribute('aria-pressed', 'true');
});

test('it ticks', () => {
  renderAt();
  expect(screen.getByTestId('digits-second')).toHaveTextContent('00');
  // Two real seconds is one seximal second and a bit.
  act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(screen.getByTestId('digits-second')).toHaveTextContent('01');
  expect(screen.getByText(/16:00:02 on the decimal clock/)).toBeInTheDocument();
});
