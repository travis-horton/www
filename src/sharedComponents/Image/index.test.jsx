import React from 'react';
import { render } from '@testing-library/react';
import Image from '.';

test('renders without crashing', () => {
  render(<Image alt="test" thumb="thumb.png" src="full.png" height={100} width={100} />);
});
