import React from 'react';
import ReactDOM from 'react-dom';
import Pianist from '..';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Pianist />, div);
});
