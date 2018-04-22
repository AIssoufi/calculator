import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import './index.css';
import reduceurCalculatrice from './reducers';
import Calculatrice from './Calculatrice';
import registerServiceWorker from './registerServiceWorker';

const store = createStore(reduceurCalculatrice);

ReactDOM.render(
  <Provider store={store}>
    <Calculatrice />
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
