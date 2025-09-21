import { TaskManager } from "./components/TaskManager";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <TaskManager />
    </ErrorBoundary>
  );
}

export default App;
