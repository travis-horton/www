import React, { useEffect } from 'react';

import perlinScript from './perlin-noise/src';

const PerlinNoise = () => {
  useEffect(() => {
    perlinScript();
  }, []);
  return (
    <div
      className="content"
      id="box"
      style={{ textAlign: 'center', margin: '20px' }}
    >
      <canvas style={{ width: 512, height: 512 }} id="canvas1"/>
    </div>
  );
};

export {
  PerlinNoise,
}
