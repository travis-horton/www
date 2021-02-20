import React from 'react';
import PropTypes from 'prop-types';
import './image.css';

const Image = ({ alt, thumb, src }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <>
      <img
        className="image thumb"
        alt={alt}
        src={thumb}
        style={{ visibility: isLoaded ? 'hidden' : 'visible' }}
      />
      <img
        onLoad={() => {
          setIsLoaded(true);
        }}
        className="image full"
        style={{ opacity: isLoaded ? 1 : 0 }}
        alt={alt}
        src={src}
      />
    </>
  );
};

Image.propTypes = {
  alt: PropTypes.string.isRequired,
  thumb: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

export default Image;
