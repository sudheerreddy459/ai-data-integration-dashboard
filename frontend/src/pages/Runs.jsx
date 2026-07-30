import { useEffect, useState } from "react";

import RunDetails from "../components/RunDetails";

const API_BASE_URL = "http://127.0.0.1:8000";

function Runs() {
  const [runs, setRuns] = useState([]);
  const [integrations, setIntegrations] = useState([]);

  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedRun, setSelectedRun] = useState(null);
  const [loadingRunId, setLoadingRunId] = useState(null);
  const [detailsError, setDetailsError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [runsResponse, integrationsResponse] =
          await Promise.all([
            fetch(
              `${API_BASE_URL}/integration-runs/?limit=100&offset=0`
            ),
            fetch(`${API_BASE_URL}/integrations/`),
          ]);

        if (!runsResponse.ok) {
          throw new Error("Failed to load integration runs");
        }

        if (!integrationsResponse.ok) {
          throw new Error("Failed to load integrations");
        }

        const [runsData, integrationsData] =
          await Promise.all([
            runsResponse.json(),
            integrationsResponse.json(),
          ]);

        if (!cancelled) {
          setRuns(runsData);
          setIntegrations(integrationsData);
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

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

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

  function getIntegrationName(integrationId) {
    const integration = integrations.find(
      (item) => item.id === integrationId
    );

    return integration
      ? integration.name
      : `Integration ${integrationId}`;
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
    const normalizedStatus = status
      ? status.toLowerCase()
      : "unknown";

    if (
      normalizedStatus === "success" ||
      normalizedStatus === "successful" ||
      normalizedStatus === "completed"
    ) {
      return "badge badge-success";
    }

    if (normalizedStatus === "failed") {
      return "badge badge-failed";
    }

    if (normalizedStatus === "running") {
      return "badge badge-running";
    }

    return "badge badge-category";
  }

  const filteredRuns =
    statusFilter === "All"
      ? runs
      : runs.filter(
          (run) =>
            run.status?.toLowerCase() ===
            statusFilter.toLowerCase()
        );

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
        Loading integration runs...
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
        <h1>Integration Runs</h1>

        <p>
          Monitor integration execution history and status
        </p>
      </header>

      <main>
        <section className="summary-grid">
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
          <div className="section-header runs-section-header">
            <div>
              <h2>Run History</h2>

              <p>
                Recent integration executions across all
                configured integrations
              </p>
            </div>

            <div className="run-filter">
              <label htmlFor="statusFilter">
                Status
              </label>

              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">
                  All
                </option>

                <option value="Success">
                  Success
                </option>

                <option value="Successful">
                  Successful
                </option>

                <option value="Failed">
                  Failed
                </option>

                <option value="Running">
                  Running
                </option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Integration</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Completed</th>
                  <th>Records</th>
                  <th>Duration</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRuns.length > 0 ? (
                  filteredRuns.map((run) => (
                    <tr key={run.id}>
                      <td>{run.id}</td>

                      <td>
                        <strong>
                          {getIntegrationName(
                            run.integration_id
                          )}
                        </strong>
                      </td>

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
                    <td colSpan="8">
                      No integration runs found for this
                      status.
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
            integrationName={
              selectedRun
                ? getIntegrationName(
                    selectedRun.integration_id
                  )
                : ""
            }
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

export default Runs;