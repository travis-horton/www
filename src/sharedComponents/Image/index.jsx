import React, { useState } from 'react';

import './styles.css';

function Image({
  alt = 'image',
  thumb = '',
  src = '',
  className,
  height = 285,
  width = 285,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const size = { height: `${height}px`, width: `${width}px` };
  // React 19 drops src="" (a browser can read it as "fetch this page again")
  // and warns about it. A missing picture gets no src at all, said outright.
  const orNone = (url) => url || undefined;

  return (
    <div className={className} style={size}>
      {/* A placeholder for the same picture: the full image below carries
          the alt text, so a screen reader hears it once. Only when there IS
          a thumbnail: an <img> with no src draws as a broken picture (the
          blog's AND gate showed one, 26.1002 audit). */}
      {thumb && (
        <img
          className="image thumb"
          alt=""
          aria-hidden="true"
          src={thumb}
          style={{ visibility: isLoaded ? 'hidden' : 'visible', ...size }}
        />
      )}
      <img
        onLoad={() => setIsLoaded(true)}
        className="image full"
        style={{ opacity: isLoaded ? 1 : 0, ...size }}
        alt={alt}
        src={orNone(src)}
      />
    </div>
  );
}

export default Image;
