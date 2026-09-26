import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Image from '.';

test('renders without crashing', () => {
  render(
    <Image
      alt="test"
      thumb="thumb.png"
      src="full.png"
      height={100}
      width={100}
    />,
  );
});

test('thumb is visible and full image is transparent before load', () => {
  const { container } = render(
    <Image alt="photo" thumb="thumb.png" src="full.png" />,
  );
  const thumb = container.querySelector('img.thumb');
  const full = container.querySelector('img.full');
  expect(thumb).toHaveStyle({ visibility: 'visible' });
  expect(full).toHaveStyle({ opacity: '0' });
});

test('shows full image and hides thumb after load event', () => {
  const { container } = render(
    <Image alt="photo" thumb="thumb.png" src="full.png" />,
  );
  const thumb = container.querySelector('img.thumb');
  const full = container.querySelector('img.full');
  fireEvent.load(full);
  expect(full).toHaveStyle({ opacity: '1' });
  expect(thumb).toHaveStyle({ visibility: 'hidden' });
});

// The blurred thumbnail is a placeholder for the same picture, so a screen
// reader should hear the alt text once, from the full image, not twice.
test('only the full image carries the alt text', () => {
  const { getAllByAltText, container } = render(
    <Image alt="photo" thumb="thumb.png" src="full.png" />,
  );
  expect(getAllByAltText('photo')).toHaveLength(1);
  expect(getAllByAltText('photo')[0]).toHaveClass('full');
  const thumb = container.querySelector('img.thumb');
  expect(thumb).toHaveAttribute('alt', '');
  expect(thumb).toHaveAttribute('aria-hidden', 'true');
});

test('applies height and width as px dimensions', () => {
  const { container } = render(<Image alt="test" height={200} width={300} />);
  expect(container.firstChild).toHaveStyle({ height: '200px', width: '300px' });
});
