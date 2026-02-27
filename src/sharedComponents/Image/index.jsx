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

  return (
    <div className={className} style={size}>
      <img
        className="image thumb"
        alt={alt}
        src={thumb}
        style={{ visibility: isLoaded ? 'hidden' : 'visible', ...size }}
      />
      <img
        onLoad={() => setIsLoaded(true)}
        className="image full"
        style={{ opacity: isLoaded ? 1 : 0, ...size }}
        alt={alt}
        src={src}
      />
    </div>
  );
}


export default Image;
