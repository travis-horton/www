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
        <Route index element={<ProgrammingContent />} />
      </Routes>
    </main>
  );
}

export default Programming;
