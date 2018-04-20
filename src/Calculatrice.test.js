import React from 'react';
import ReactDOM from 'react-dom';
import Calculatrice from './Calculatrice';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Calculatrice />, div);
  ReactDOM.unmountComponentAtNode(div);
});
