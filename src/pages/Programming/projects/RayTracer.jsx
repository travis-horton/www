import React, { useEffect } from 'react';

import renderRayTracerInElement from './ray-tracer/ray-tracer.js';

export const RayTracer = () => {
  useEffect(() => { renderRayTracerInElement('box'); }, []);

  return (
    <div>
      <h2>ray tracer</h2>
      <div className="description">
        <p>
          Ray tracing is one way of rendering 3-dimensional scenes.
        </p>
        <p>
          From the observer (you) a "ray" is traced through each pixel of the view window and
          it&apos;s path is calculated to determine what color (depending on objects the ray
          encounters and light sources it ends at) that pixel should be.
        </p>
      </div>
      <div
        className="project-content project-content__oversize"
        id="box"
      >
      </div>
    </div>
  );
};
