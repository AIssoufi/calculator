import Calculator from '../Calculator';
import './App.css';

/**
 * Renders the app: the calculator, centered in a page that never scrolls. Must be rendered inside a
 * react-redux `<Provider>`.
 */
const App = () => (
  <div className="app_container">
    <Calculator />
  </div>
);

export default App;
