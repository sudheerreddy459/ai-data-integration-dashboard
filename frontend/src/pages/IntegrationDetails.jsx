import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import RunDetails from "../components/RunDetails";

const API_BASE_URL = "http://127.0.0.1:8000";

function IntegrationDetails() {
  const { integrationId } = useParams();

  const [integration, setIntegration] = useState(null);
  const [runs, setRuns] = useState([]);

  const [selectedRun, setSelectedRun] = useState(null);
  const [loadingRunId, setLoadingRunId] = useState(null);
  const [detailsError, setDetailsError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadIntegrationDetails() {
      try {
        const [integrationResponse, runsResponse] =
          await Promise.all([
            fetch(
              `${API_BASE_URL}/integrations/${integrationId}`
            ),
            fetch(
              `${API_BASE_URL}/integration-runs/integration/${integrationId}?limit=100&offset=0`
            ),
          ]);

        if (!integrationResponse.ok) {
          if (integrationResponse.status === 404) {
            throw new Error("Integration not found");
          }

          throw new Error(
            "Failed to load integration details"
          );
        }

        if (!runsResponse.ok) {
          throw new Error(
            "Failed to load integration runs"
          );
        }

        const [integrationData, runsData] =
          await Promise.all([
            integrationResponse.json(),
            runsResponse.json(),
          ]);

        if (!cancelled) {
          setIntegration(integrationData);
          setRuns(runsData);
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

    loadIntegrationDetails();

    return () => {
      cancelled = true;
    };
  }, [integrationId]);

  async function viewRunDetails(runId) {
    setLoadingRunId(runId);
    setDetailsError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/integration-runs/${runId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load run details");
      }

      const data = await response.json();

      setSelectedRun(data);
    } catch (err) {
      setDetailsError(err.message);
    } finally {
      setLoadingRunId(null);
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

  function getStatusClass(status) {
    const normalizedStatus =
      status?.toLowerCase() ?? "unknown";

    if (
      normalizedStatus === "active" ||
      normalizedStatus === "success" ||
      normalizedStatus === "successful" ||
      normalizedStatus === "completed"
    ) {
      return "badge badge-success";
    }

    if (
      normalizedStatus === "failed" ||
      normalizedStatus === "inactive"
    ) {
      return "badge badge-failed";
    }

    if (
      normalizedStatus === "running" ||
      normalizedStatus === "testing"
    ) {
      return "badge badge-running";
    }

    return "badge badge-category";
  }

  const successfulCount = runs.filter((run) =>
    ["success", "successful", "completed"].includes(
      run.status?.toLowerCase()
    )
  ).length;

  const failedCount = runs.filter(
    (run) => run.status?.toLowerCase() === "failed"
  ).length;

  const runningCount = runs.filter(
    (run) => run.status?.toLowerCase() === "running"
  ).length;

  if (loading) {
    return (
      <div className="message">
        Loading integration details...
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

  if (!integration) {
    return (
      <div className="message error">
        Integration not found.
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header integration-details-header">
        <div>
          <Link
            className="back-link"
            to="/integrations"
          >
            ← Back to Integrations
          </Link>

          <h1>{integration.name}</h1>

          <p>
            Integration configuration and execution history
          </p>
        </div>

        <span
          className={getStatusClass(
            integration.status
          )}
        >
          {integration.status || "Unknown"}
        </span>
      </header>

      <main>
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Integration Overview</h2>

            <p>
              Source and target system configuration
            </p>
          </div>

          <div className="integration-overview-grid">
            <div>
              <span>Integration ID</span>
              <strong>{integration.id}</strong>
            </div>

            <div>
              <span>Source System</span>

              <strong>
                {integration.source_system}
              </strong>
            </div>

            <div>
              <span>Target System</span>

              <strong>
                {integration.target_system}
              </strong>
            </div>

            <div>
              <span>Status</span>

              <strong>
                {integration.status || "Unknown"}
              </strong>
            </div>

            <div>
              <span>Created</span>

              <strong>
                {formatDate(integration.created_at)}
              </strong>
            </div>

            <div>
              <span>Last Updated</span>

              <strong>
                {formatDate(integration.updated_at)}
              </strong>
            </div>
          </div>
        </section>

        <section className="summary-grid integration-run-summary">
          <div className="summary-card">
            <span>Total Runs</span>
            <strong>{runs.length}</strong>
          </div>

          <div className="summary-card">
            <span>Successful</span>
            <strong>{successfulCount}</strong>
          </div>

          <div className="summary-card">
            <span>Failed</span>
            <strong>{failedCount}</strong>
          </div>

          <div className="summary-card">
            <span>Running</span>
            <strong>{runningCount}</strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Execution History</h2>

            <p>
              Integration runs for {integration.name}
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Completed</th>
                  <th>Records</th>
                  <th>Duration</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {runs.length > 0 ? (
                  runs.map((run) => (
                    <tr key={run.id}>
                      <td>{run.id}</td>

                      <td>
                        <span
                          className={getStatusClass(
                            run.status
                          )}
                        >
                          {run.status || "Unknown"}
                        </span>
                      </td>

                      <td>
                        {formatDate(run.started_at)}
                      </td>

                      <td>
                        {formatDate(run.completed_at)}
                      </td>

                      <td>
                        {run.records_processed ?? 0}
                      </td>

                      <td>
                        {formatDuration(
                          run.duration_seconds
                        )}
                      </td>

                      <td>
                        {run.error_category || "-"}
                      </td>

                      <td>
                        {run.severity || "-"}
                      </td>

                      <td>
                        <button
                          className="analyze-button"
                          type="button"
                          disabled={
                            loadingRunId === run.id
                          }
                          onClick={() =>
                            viewRunDetails(run.id)
                          }
                        >
                          {loadingRunId === run.id
                            ? "Loading..."
                            : "View"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">
                      No execution history available for
                      this integration.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {detailsError && (
            <div className="analysis-error">
              {detailsError}
            </div>
          )}

          <RunDetails
            run={selectedRun}
            integrationName={integration.name}
            onClose={() => setSelectedRun(null)}
            getStatusClass={getStatusClass}
            formatDate={formatDate}
            formatDuration={formatDuration}
          />
        </section>
      </main>
    </>
  );
}

export default IntegrationDetails;