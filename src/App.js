import Chart from "./components/Chart";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="react-chart-heading">React Charting App</h1>
      </header>
      <main className="main-container">
        <Chart />
      </main>
    </div>
  );
}

export default App;
