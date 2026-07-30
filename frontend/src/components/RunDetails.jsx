function RunDetails({
  run,
  integrationName,
  onClose,
  getStatusClass,
  formatDate,
  formatDuration,
}) {
  if (!run) {
    return null;
  }

  return (
    <div className="analysis-panel run-details-panel">
      <div className="analysis-header">
        <div>
          <span>Run Details</span>
          <h3>{integrationName}</h3>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="run-details-grid">
        <div>
          <span>Run ID</span>
          <strong>{run.id}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>
            <span className={getStatusClass(run.status)}>
              {run.status || "Unknown"}
            </span>
          </strong>
        </div>

        <div>
          <span>Started</span>
          <strong>{formatDate(run.started_at)}</strong>
        </div>

        <div>
          <span>Completed</span>
          <strong>{formatDate(run.completed_at)}</strong>
        </div>

        <div>
          <span>Records Processed</span>
          <strong>{run.records_processed ?? 0}</strong>
        </div>

        <div>
          <span>Duration</span>
          <strong>
            {formatDuration(run.duration_seconds)}
          </strong>
        </div>

        <div>
          <span>Error Category</span>
          <strong>{run.error_category || "-"}</strong>
        </div>

        <div>
          <span>Severity</span>
          <strong>{run.severity || "-"}</strong>
        </div>
      </div>

      {run.error_message && (
        <div className="run-error-details">
          <span>Error Message</span>
          <p>{run.error_message}</p>
        </div>
      )}
    </div>
  );
}

export default RunDetails;