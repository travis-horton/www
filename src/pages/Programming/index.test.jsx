import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Programming from '.';

test('an unknown project path renders the 404 inside the one <main>', () => {
  const { container } = render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      initialEntries={['/programming/different-made-up-route']}
    >
      <Routes>
        <Route path="/programming/*" element={<Programming />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText('hm, nothing here')).toBeInTheDocument();
  expect(container.querySelectorAll('main')).toHaveLength(1);
});

test('renders without crashing', () => {
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      initialEntries={['/']}
    >
      <Programming />
    </MemoryRouter>,
  );
});

test('the seximal time-keeping project renders its hexagon clock', () => {
  const { container } = render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      initialEntries={['/programming/seximal-time-keeping']}
    >
      <Routes>
        <Route path="/programming/*" element={<Programming />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(container.querySelector('main svg polygon')).not.toBeNull();
});
