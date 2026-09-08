import React from 'react';
import { Routes, Route } from 'react-router-dom';

import {
  PerlinNoise,
  RayTracer,
  Orbitz,
  Asteroids,
  PolygonRace,
  SeximalTimeKeeping,
  BinaryNumerals,
} from './projects';
import ProgrammingContent from './ProgrammingContent';
// Imported from its own directory rather than through `../index` — the pages
// barrel imports Programming, so going back through it would close a cycle.
import Clock from '../Clock';

import './styles.css';

function Programming() {
  return (
    <main>
      <Routes>
        <Route path="perlin-noise" element={<PerlinNoise />} />
        <Route path="ray-tracer" element={<RayTracer />} />
        <Route path="orbitz" element={<Orbitz />} />
        <Route path="asteroids" element={<Asteroids />} />
        <Route path="polygon-race" element={<PolygonRace />} />
        <Route path="seximal-time-keeping" element={<SeximalTimeKeeping />} />
        <Route path="binary" element={<BinaryNumerals />} />
        <Route path="clock" element={<Clock />} />
        <Route index element={<ProgrammingContent />} />
      </Routes>
    </main>
  );
}

export default Programming;
