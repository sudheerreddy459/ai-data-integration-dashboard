import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardSummary() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/dashboard/summary"
        );

        if (!response.ok) {
          throw new Error("Failed to load dashboard summary");
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardSummary();
  }, []);

  if (loading) {
    return <div className="message">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="message error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>AI Data Integration Dashboard</h1>
          <p>Enterprise integration monitoring and failure analysis</p>
        </div>
      </header>

      <main>
        <section className="summary-grid">
          <div className="summary-card">
            <span>Total Integrations</span>
            <strong>{summary.total_integrations}</strong>
          </div>

          <div className="summary-card">
            <span>Total Runs</span>
            <strong>{summary.total_runs}</strong>
          </div>

          <div className="summary-card">
            <span>Successful Runs</span>
            <strong>{summary.successful_runs}</strong>
          </div>

          <div className="summary-card">
            <span>Failed Runs</span>
            <strong>{summary.failed_runs}</strong>
          </div>

          <div className="summary-card">
            <span>Success Rate</span>
            <strong>{summary.success_rate}%</strong>
          </div>

          <div className="summary-card">
            <span>Records Processed</span>
            <strong>
              {summary.total_records_processed.toLocaleString()}
            </strong>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;