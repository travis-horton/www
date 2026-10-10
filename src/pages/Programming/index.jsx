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
import { NotFoundContent } from '../NotFound';
import { Titled } from '/src/sharedComponents/DocumentHead';

import './styles.css';

// Each page's tab title (sharedComponents/DocumentHead says why it is set
// here, on the leaf, and not once for the whole section).
const titled = (title, page) => <Titled title={title}>{page}</Titled>;

function Programming() {
  return (
    <main>
      <Routes>
        <Route
          path="perlin-noise"
          element={titled('Perlin noise', <PerlinNoise />)}
        />
        <Route
          path="ray-tracer"
          element={titled('Ray tracer', <RayTracer />)}
        />
        <Route path="orbitz" element={titled('Orbitz', <Orbitz />)} />
        <Route path="asteroids" element={titled('Asteroids', <Asteroids />)} />
        <Route
          path="polygon-race"
          element={titled('Polygon race', <PolygonRace />)}
        />
        <Route
          path="seximal-time-keeping"
          element={titled('Seximal time-keeping', <SeximalTimeKeeping />)}
        />
        <Route
          path="binary"
          element={titled('Binary numerals', <BinaryNumerals />)}
        />
        <Route path="clock" element={titled('Seximal clock', <Clock />)} />
        <Route index element={titled('Programming', <ProgrammingContent />)} />
        {/* Anything else under /programming/ is a 404 — without this the
            outer "/programming/*" swallows it and the page renders empty. */}
        <Route path="*" element={titled('Not found', <NotFoundContent />)} />
      </Routes>
    </main>
  );
}

export default Programming;
