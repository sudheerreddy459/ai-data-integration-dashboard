import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [summary, setSummary] = useState(null);
  const [runTrends, setRunTrends] = useState([]);
  const [integrationAnalytics, setIntegrationAnalytics] = useState([]);
  const [recentFailures, setRecentFailures] = useState([]);

  const [analysis, setAnalysis] = useState(null);
  const [analyzingRunId, setAnalyzingRunId] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          summaryResponse,
          trendsResponse,
          analyticsResponse,
          failuresResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/summary`),
          fetch(`${API_BASE_URL}/dashboard/run-trends?days=7`),
          fetch(`${API_BASE_URL}/dashboard/integration-analytics`),
          fetch(`${API_BASE_URL}/dashboard/recent-failures?limit=5`),
        ]);

        if (
          !summaryResponse.ok ||
          !trendsResponse.ok ||
          !analyticsResponse.ok ||
          !failuresResponse.ok
        ) {
          throw new Error("Failed to load dashboard data");
        }

        const [
          summaryData,
          trendsData,
          analyticsData,
          failuresData,
        ] = await Promise.all([
          summaryResponse.json(),
          trendsResponse.json(),
          analyticsResponse.json(),
          failuresResponse.json(),
        ]);

        setSummary(summaryData);
        setRunTrends(trendsData);
        setIntegrationAnalytics(analyticsData);
        setRecentFailures(failuresData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  async function analyzeFailure(runId) {
    setAnalyzingRunId(runId);
    setAnalysis(null);
    setAnalysisError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai-analysis/failures/${runId}`
      );

      if (!response.ok) {
        throw new Error("Failed to analyze integration failure");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setAnalyzingRunId(null);
    }
  }

  if (loading) {
    return <div className="message">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="message error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>AI Data Integration Dashboard</h1>
        <p>Enterprise integration monitoring and failure analysis</p>
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

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Run Trends</h2>
            <p>Integration execution activity for the last 7 days</p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Runs</th>
                  <th>Successful</th>
                  <th>Failed</th>
                  <th>Running</th>
                </tr>
              </thead>

              <tbody>
                {runTrends.length > 0 ? (
                  runTrends.map((trend) => (
                    <tr key={trend.date}>
                      <td>{trend.date}</td>
                      <td>{trend.total_runs}</td>
                      <td>{trend.successful_runs}</td>
                      <td>{trend.failed_runs}</td>
                      <td>{trend.running_runs}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No run data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Integration Analytics</h2>
            <p>Performance and failure statistics by integration</p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Integration</th>
                  <th>Total Runs</th>
                  <th>Successful</th>
                  <th>Failed</th>
                  <th>Running</th>
                  <th>Failure Rate</th>
                </tr>
              </thead>

              <tbody>
                {integrationAnalytics.length > 0 ? (
                  integrationAnalytics.map((integration) => (
                    <tr key={integration.integration_id}>
                      <td>{integration.integration_name}</td>
                      <td>{integration.total_runs}</td>
                      <td>{integration.successful_runs}</td>
                      <td>{integration.failed_runs}</td>
                      <td>{integration.running_runs}</td>
                      <td>{integration.failure_rate}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      No integration analytics available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Failures</h2>
            <p>Latest failed integration executions</p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Integration</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Error</th>
                  <th>Duration</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recentFailures.length > 0 ? (
                  recentFailures.map((failure) => (
                    <tr key={failure.id}>
                      <td>{failure.integration_name}</td>

                      <td>
                        {failure.error_category || "Unknown"}
                      </td>

                      <td>
                        {failure.severity || "Unknown"}
                      </td>

                      <td>{failure.error_message || "No error message"}</td>

                      <td>
                        {failure.duration_seconds !== null
                          ? `${failure.duration_seconds}s`
                          : "-"}
                      </td>

                      <td>
                        <button
                          className="analyze-button"
                          onClick={() => analyzeFailure(failure.id)}
                          disabled={analyzingRunId === failure.id}
                        >
                          {analyzingRunId === failure.id
                            ? "Analyzing..."
                            : "Analyze"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No recent failures.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {analysisError && (
            <div className="analysis-error">
              {analysisError}
            </div>
          )}

          {analysis && (
            <div className="analysis-panel">
              <div className="analysis-header">
                <div>
                  <span>Failure Analysis</span>
                  <h3>{analysis.integration_name}</h3>
                </div>

                <span className="analysis-source">
                  {analysis.analysis_source || "RuleBased"}
                </span>
              </div>

              <div className="analysis-grid">
                <div>
                  <span>Category</span>
                  <strong>
                    {analysis.error_category || "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>Severity</span>
                  <strong>{analysis.severity || "Unknown"}</strong>
                </div>
              </div>

              <div className="analysis-content">
                <h4>Probable Cause</h4>
                <p>{analysis.probable_cause}</p>

                <h4>Recommendation</h4>
                <p>{analysis.recommendation}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;