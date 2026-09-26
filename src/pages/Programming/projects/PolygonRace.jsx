import React, { useEffect } from 'react';

import renderPolygonRaceInElement from './polygon-race/index.js';

export const PolygonRace = () => {
  // The demo returns a stop function; calling it when this page closes
  // ends its animation loop and keyboard listeners.
  useEffect(() => {
    const stop = renderPolygonRaceInElement('box');
    return () => {
      if (typeof stop === 'function') stop();
    };
  }, []);

  return (
    <div>
      <div
        className="project-content project-content__oversize project-content__dark-background"
        id="box"
      ></div>
    </div>
  );
};
