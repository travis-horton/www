import React, { useEffect } from 'react';

import renderPolygonRaceInElement from './polygon-race/index.js';

export const PolygonRace = () => {
  useEffect(() => { renderPolygonRaceInElement('box'); }, []);

  return (
    <div>
      <div
        className="project-content project-content__oversize project-content__dark-background"
        id="box"
      >
      </div>
    </div>
  );
};
