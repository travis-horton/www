import React, { useEffect } from 'react';

import renderAsteroidsInElement from './asteroids/index.js';

export const Asteroids = () => {
  // The demo returns a stop function; calling it when this page closes
  // ends its animation loop and keyboard listeners.
  useEffect(() => {
    const stop = renderAsteroidsInElement('box');
    return () => {
      if (typeof stop === 'function') stop();
    };
  }, []);

  return (
    <div>
      <div className="description">Arrow keys to move, space bar shoots</div>
      <div className="project-content project-content__center" id="box"></div>
    </div>
  );
};
