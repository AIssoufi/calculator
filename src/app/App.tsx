import Calculator from './Calculator';
import "./App.css";

/**
 * Renders the app: the calculator, centered in a page that never scrolls, under a heading that only
 * screen readers read. Must be rendered inside a react-redux `<Provider>`.
 */
const App = () => (
    <div className="app_container">
        <h1 className="visually-hidden">Calculatrice</h1>
        <Calculator />
    </div>
);

export default App;