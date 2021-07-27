import React, { useEffect } from 'react';

import { renderOrbitzInElement } from './orbitz/index.js';

export const Orbitz = () => {
  useEffect(() => { renderOrbitzInElement('box'); }, []);

  return (
    <div>
      <h2>orbitz</h2>
      <div className="description">
        these images actually represent objects with "mass". the "sun" in the center is a very
        heavy object, and pulls the two smaller satellites around it. the two small satellites
        also have some mass and affect each other, but only barely.
      </div>
      <div
        className="project-content project-content__oversize"
        id="box"
      >
      </div>
    </div>
  );
};
