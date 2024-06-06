import React, { useEffect } from 'react';

import renderPerlinNoiseInElement from './perlin-noise/src';

export const PerlinNoise = () => {
  useEffect(() => { renderPerlinNoiseInElement('box') }, []);

  return (
    <div>
      <h2>perlin noise</h2>
      <div className="description">
        <p>
          This is a little demonstration of perlin noise. Perlin noise is a pseudo-random set in
          which each index is related to the indices around it, which makes the resulting noise
          "smooth", i.e. no cliffs or big jumps from one spot to its neighbor.
        </p>
        <p>
          What you see here represents a top-down view of a randomly generated topographical map.
          Dark areas represent low elevations and light areas represent higher elevation. The
          "elevation" of the white dot floating around the map is represented by the height gauge..
        </p>
      </div>
      <div
        className="project-content"
        id="box"
      >
      </div>
    </div>
  );
};
