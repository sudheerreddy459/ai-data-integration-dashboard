import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [summary, setSummary] = useState(null);
  const [runTrends, setRunTrends] = useState([]);
  const [integrationAnalytics, setIntegrationAnalytics] = useState([]);
  const [recentFailures, setRecentFailures] = useState([]);
  const [failureAnalytics, setFailureAnalytics] = useState(null);

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
          failureAnalyticsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/summary`),
          fetch(`${API_BASE_URL}/dashboard/run-trends?days=7`),
          fetch(`${API_BASE_URL}/dashboard/integration-analytics`),
          fetch(`${API_BASE_URL}/dashboard/recent-failures?limit=5`),
          fetch(`${API_BASE_URL}/dashboard/failure-analytics`),
        ]);

        if (
          !summaryResponse.ok ||
          !trendsResponse.ok ||
          !analyticsResponse.ok ||
          !failuresResponse.ok ||
          !failureAnalyticsResponse.ok
        ) {
          throw new Error("Failed to load dashboard data");
        }

        const [
          summaryData,
          trendsData,
          analyticsData,
          failuresData,
          failureAnalyticsData,
        ] = await Promise.all([
          summaryResponse.json(),
          trendsResponse.json(),
          analyticsResponse.json(),
          failuresResponse.json(),
          failureAnalyticsResponse.json(),
        ]);

        setSummary(summaryData);
        setRunTrends(trendsData);
        setIntegrationAnalytics(analyticsData);
        setRecentFailures(failuresData);
        setFailureAnalytics(failureAnalyticsData);
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

  const categoryData = failureAnalytics
    ? Object.entries(failureAnalytics.by_category).map(
        ([category, count]) => ({
          name: category,
          count,
        })
      )
    : [];

  const severityData = failureAnalytics
    ? Object.entries(failureAnalytics.by_severity).map(
        ([severity, count]) => ({
          name: severity,
          count,
        })
      )
    : [];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>AI Data Integration Dashboard</h1>
        <p>Enterprise integration monitoring and failure analysis</p>
      </header>

      <main>
        {/* Summary */}
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

        {/* Run Trends */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Run Trends</h2>
            <p>Integration execution activity for the last 7 days</p>
          </div>

          <div className="chart-container">
            {runTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={runTrends}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="successful_runs"
                    name="Successful"
                    stroke="#16a34a"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="failed_runs"
                    name="Failed"
                    stroke="#dc2626"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="running_runs"
                    name="Running"
                    stroke="#2563eb"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                No run trend data available.
              </div>
            )}
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

        {/* Failure Analytics */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Failure Analytics</h2>
            <p>
              Failure distribution by error category and severity
            </p>
          </div>

          <div className="failure-summary">
            <span>Total Failures</span>
            <strong>
              {failureAnalytics?.total_failures ?? 0}
            </strong>
          </div>

          <div className="failure-charts-grid">
            <div className="failure-chart-card">
              <h3>Failures by Category</h3>

              <div className="failure-chart">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="name" />

                      <YAxis allowDecimals={false} />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Failures"
                        fill="#dc2626"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-empty">
                    No category data available.
                  </div>
                )}
              </div>
            </div>

            <div className="failure-chart-card">
              <h3>Failures by Severity</h3>

              <div className="failure-chart">
                {severityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityData}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="name" />

                      <YAxis allowDecimals={false} />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Failures"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-empty">
                    No severity data available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Integration Analytics */}
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

        {/* Recent Failures */}
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

                      <td>
                        {failure.error_message ||
                          "No error message"}
                      </td>

                      <td>
                        {failure.duration_seconds !== null
                          ? `${failure.duration_seconds}s`
                          : "-"}
                      </td>

                      <td>
                        <button
                          className="analyze-button"
                          onClick={() =>
                            analyzeFailure(failure.id)
                          }
                          disabled={
                            analyzingRunId === failure.id
                          }
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
                  <strong>
                    {analysis.severity || "Unknown"}
                  </strong>
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