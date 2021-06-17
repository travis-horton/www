import React, { useEffect } from 'react';

import perlinScript from './perlin-noise/src';

const PerlinNoise = () => {
  useEffect(() => {
    perlinScript();
  }, []);
  return (
    <div>
      <div className="container">
        <div className="content" id="box" style={{ textAlign: 'center' }}>
          <canvas style={{ width: 512, height: 512 }} id="canvas1"/>
        </div>
      </div>
    </div>
  );
};

export {
  PerlinNoise,
}
