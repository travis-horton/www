import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Programming from '.';

jest.mock('./projects', () => ({
  PerlinNoise: () => null,
  RayTracer: () => null,
  Orbitz: () => null,
  Asteroids: () => null,
  PolygonRace: () => null,
  SeximalTimeKeeping: () => null,
  BinaryNumerals: () => null,
}));

test('renders without crashing', () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/']}>
      <Programming />
    </MemoryRouter>,
  );
});
