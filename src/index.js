import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import './index.css';

import reduceurCalculatrice from './redux/reducers/reducer';
import Calculatrice from './Calculatrice';
import registerServiceWorker from './registerServiceWorker';

/* eslint-disable no-underscore-dangle */
const store = createStore(
  reduceurCalculatrice, /* preloadedState, */
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
/* eslint-enable */

ReactDOM.render(
  <Provider store={store}>
    <Calculatrice />
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
