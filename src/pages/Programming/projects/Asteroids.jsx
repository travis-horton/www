import React, { useEffect } from 'react';

import { renderAsteroidsInElement } from './asteroids/index.js';

export const Asteroids = () => {
  useEffect(() => { renderAsteroidsInElement('box'); }, []);

  return (
    <div>
      <div className="description">
        arrow keys to move, space bar shoots
      </div>
      <div
        className="project-content project-content__center"
        id="box"
      >
      </div>
    </div>
  );
};
