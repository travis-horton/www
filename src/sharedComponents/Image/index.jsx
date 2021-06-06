import React from 'react';
import PropTypes from 'prop-types';
import './image.css';

class Image extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
    };
  }

  render() {
    const {
      alt, thumb, src, height, width,
    } = this.props;
    const { isLoaded } = this.state;

    return (
      <div style={{ height: `${height}px`, width: `${width}px` }}>
        <img
          className="image thumb"
          alt={alt}
          src={thumb}
          style={{ visibility: isLoaded ? 'hidden' : 'visible', height: `${height}px`, width: `${width}px` }}
        />
        <img
          onLoad={() => {
            this.setState({ isLoaded: true });
          }}
          className="image full"
          style={{ opacity: isLoaded ? 1 : 0, height: `${height}px`, width: `${width}px` }}
          alt={alt}
          src={src}
        />
      </div>
    );
  }
}

Image.propTypes = {
  alt: PropTypes.string,
  thumb: PropTypes.string,
  src: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
};

Image.defaultProps = {
  alt: 'image',
  thumb: 'none',
  src: 'none',
  height: 285,
  width: 285,
};

export default Image;
