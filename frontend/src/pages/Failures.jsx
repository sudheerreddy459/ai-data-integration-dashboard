import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function Failures() {
  const [failures, setFailures] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analyzingRunId, setAnalyzingRunId] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFailures() {
      try {
        const [failuresResponse, analyticsResponse] =
          await Promise.all([
            fetch(
              `${API_BASE_URL}/dashboard/recent-failures?limit=20`
            ),
            fetch(
              `${API_BASE_URL}/dashboard/failure-analytics`
            ),
          ]);

        if (!failuresResponse.ok) {
          throw new Error("Failed to load failures");
        }

        if (!analyticsResponse.ok) {
          throw new Error("Failed to load failure analytics");
        }

        const [failuresData, analyticsData] =
          await Promise.all([
            failuresResponse.json(),
            analyticsResponse.json(),
          ]);

        if (!cancelled) {
          setFailures(failuresData);
          setAnalytics(analyticsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFailures();

    return () => {
      cancelled = true;
    };
  }, []);

  async function analyzeFailure(runId) {
    setAnalyzingRunId(runId);
    setAnalysisError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai-analysis/failures/${runId}`
      );

      if (!response.ok) {
        throw new Error("Failed to analyze failure");
      }

      const data = await response.json();
      setSelectedAnalysis(data);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setAnalyzingRunId(null);
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleString();
  }

  function formatDuration(duration) {
    if (duration === null || duration === undefined) {
      return "-";
    }

    return `${duration}s`;
  }

  function getSeverityClass(severity) {
    const normalized = severity?.toLowerCase();

    if (
      normalized === "high" ||
      normalized === "critical"
    ) {
      return "badge badge-failed";
    }

    if (
      normalized === "medium" ||
      normalized === "warning"
    ) {
      return "badge badge-running";
    }

    return "badge badge-category";
  }

  const highSeverityCount = failures.filter(
    (failure) =>
      failure.severity?.toLowerCase() === "high" ||
      failure.severity?.toLowerCase() === "critical"
  ).length;

  const unknownCount = failures.filter(
    (failure) =>
      !failure.error_category || !failure.severity
  ).length;

  if (loading) {
    return (
      <div className="message">
        Loading failures...
      </div>
    );
  }

  if (error) {
    return (
      <div className="message error">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <h1>Failures</h1>

        <p>
          Investigate failed integrations and identify probable
          causes
        </p>
      </header>

      <main>
        <section className="summary-grid">
          <div className="summary-card">
            <span>Total Failures</span>
            <strong>
              {analytics?.total_failures ?? failures.length}
            </strong>
          </div>

          <div className="summary-card">
            <span>High Severity</span>
            <strong>{highSeverityCount}</strong>
          </div>

          <div className="summary-card">
            <span>Categories</span>
            <strong>
              {
                Object.keys(
                  analytics?.by_category ?? {}
                ).length
              }
            </strong>
          </div>

          <div className="summary-card">
            <span>Unclassified</span>
            <strong>{unknownCount}</strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Failure Distribution</h2>

            <p>
              Failure counts grouped by category and severity
            </p>
          </div>

          <div className="failure-distribution-grid">
            <div className="failure-distribution-card">
              <h3>By Category</h3>

              {Object.entries(
                analytics?.by_category ?? {}
              ).map(([category, count]) => (
                <div
                  className="distribution-row"
                  key={category}
                >
                  <span>{category}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>

            <div className="failure-distribution-card">
              <h3>By Severity</h3>

              {Object.entries(
                analytics?.by_severity ?? {}
              ).map(([severity, count]) => (
                <div
                  className="distribution-row"
                  key={severity}
                >
                  <span>{severity}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Failure History</h2>

            <p>
              Recent failed integration executions
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Integration</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Started</th>
                  <th>Records</th>
                  <th>Duration</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {failures.length > 0 ? (
                  failures.map((failure) => (
                    <tr key={failure.id}>
                      <td>{failure.id}</td>

                      <td>
                        <strong>
                          {failure.integration_name}
                        </strong>
                      </td>

                      <td>
                        <span className="badge badge-category">
                          {failure.error_category ||
                            "Unknown"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={getSeverityClass(
                            failure.severity
                          )}
                        >
                          {failure.severity || "Unknown"}
                        </span>
                      </td>

                      <td>
                        {formatDate(failure.started_at)}
                      </td>

                      <td>
                        {failure.records_processed ?? 0}
                      </td>

                      <td>
                        {formatDuration(
                          failure.duration_seconds
                        )}
                      </td>

                      <td>
                        <button
                          className="analyze-button"
                          type="button"
                          disabled={
                            analyzingRunId === failure.id
                          }
                          onClick={() =>
                            analyzeFailure(failure.id)
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
                    <td colSpan="8">
                      No failures found.
                    </td>
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

          {selectedAnalysis && (
            <div className="analysis-panel">
              <div className="analysis-header">
                <div>
                  <span>Failure Investigation</span>

                  <h3>
                    {selectedAnalysis.integration_name ||
                      `Run ${selectedAnalysis.run_id}`}
                  </h3>
                </div>

                <div className="failure-analysis-actions">
                  <span className="analysis-source">
                    {selectedAnalysis.analysis_source ||
                      "Analysis"}
                  </span>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() =>
                      setSelectedAnalysis(null)
                    }
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="analysis-grid">
                <div>
                  <span>Category</span>

                  <strong>
                    {selectedAnalysis.error_category ||
                      selectedAnalysis.category ||
                      "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>Severity</span>

                  <strong>
                    {selectedAnalysis.severity ||
                      "Unknown"}
                  </strong>
                </div>
              </div>

              <div className="analysis-content">
                {selectedAnalysis.error_message && (
                  <>
                    <h4>Error Message</h4>

                    <p>
                      {selectedAnalysis.error_message}
                    </p>
                  </>
                )}

                <h4>Probable Cause</h4>

                <p>
                  {selectedAnalysis.probable_cause ||
                    "No probable cause available."}
                </p>

                <h4>Recommendation</h4>

                <p>
                  {selectedAnalysis.recommendation ||
                    "No recommendation available."}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Failures;