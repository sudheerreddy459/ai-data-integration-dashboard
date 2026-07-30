function RecentFailures({
  recentFailures,
  analysis,
  analysisError,
  analyzingRunId,
  onAnalyzeFailure,
}) {
  return (
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
                    <span className="badge badge-category">
                      {failure.error_category || "Unknown"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge badge-${(
                        failure.severity || "unknown"
                      ).toLowerCase()}`}
                    >
                      {failure.severity || "Unknown"}
                    </span>
                  </td>

                  <td>
                    {failure.error_message || "No error message"}
                  </td>

                  <td>
                    {failure.duration_seconds !== null
                      ? `${failure.duration_seconds}s`
                      : "-"}
                  </td>

                  <td>
                    <button
                      className="analyze-button"
                      onClick={() => onAnalyzeFailure(failure.id)}
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
  );
}

export default RecentFailures;