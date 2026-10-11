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

test('the programming index lists the personal projects', () => {
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      initialEntries={['/']}
    >
      <Programming />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole('heading', { level: 2, name: 'Personal Projects' }),
  ).toBeInTheDocument();
});

test('Goals names the current goal, not the old Postgres/Rust list (M-219)', () => {
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      initialEntries={['/']}
    >
      <Programming />
    </MemoryRouter>,
  );
  const goals = screen
    .getByRole('heading', { level: 2, name: 'Goals' })
    .closest('section');
  expect(goals).toHaveTextContent(
    /^Goals\s*Build travish\.com's backend in Zig$/,
  );
  expect(goals).not.toHaveTextContent(/Postgres|Rust|Nand2tetris/);
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

test('the projects list links to the chat as a plain link, outside the app (26.1010)', () => {
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      initialEntries={['/']}
    >
      <Programming />
    </MemoryRouter>,
  );
  expect(screen.getByRole('link', { name: 'Chat' })).toHaveAttribute(
    'href',
    '/chat/',
  );
});
