import React from 'react';

import { Main } from '/src/sharedComponents/units';
import { NeonButton } from './NeonButton';

const Blog = () => (
  <Main style={{ textAlign: 'center' }}>
    <NeonButton href="#">here&apos;s where i write stuff sometimes</NeonButton>
  </Main>
);

export default Blog;
