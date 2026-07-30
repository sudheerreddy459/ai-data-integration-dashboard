import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Integrations from "./pages/Integrations";
import Runs from "./pages/Runs";
import Failures from "./pages/Failures";

import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/runs" element={<Runs />} />
          <Route path="/failures" element={<Failures />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;