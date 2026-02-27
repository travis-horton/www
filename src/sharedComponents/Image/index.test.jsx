import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Image from '.';

test('renders without crashing', () => {
  render(<Image alt="test" thumb="thumb.png" src="full.png" height={100} width={100} />);
});

test('thumb is visible and full image is transparent before load', () => {
  const { getAllByAltText } = render(
    <Image alt="photo" thumb="thumb.png" src="full.png" />
  );
  const [thumb, full] = getAllByAltText('photo');
  expect(thumb).toHaveStyle({ visibility: 'visible' });
  expect(full).toHaveStyle({ opacity: '0' });
});

test('shows full image and hides thumb after load event', () => {
  const { getAllByAltText } = render(
    <Image alt="photo" thumb="thumb.png" src="full.png" />
  );
  const [thumb, full] = getAllByAltText('photo');
  fireEvent.load(full);
  expect(full).toHaveStyle({ opacity: '1' });
  expect(thumb).toHaveStyle({ visibility: 'hidden' });
});

test('applies height and width as px dimensions', () => {
  const { container } = render(<Image alt="test" height={200} width={300} />);
  expect(container.firstChild).toHaveStyle({ height: '200px', width: '300px' });
});
