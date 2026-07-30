function IntegrationAnalytics({ integrationAnalytics }) {
  return (
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

                  <td>
                    <span className="badge badge-success">
                      {integration.successful_runs}
                    </span>
                  </td>

                  <td>
                    <span className="badge badge-failed">
                      {integration.failed_runs}
                    </span>
                  </td>

                  <td>
                    <span className="badge badge-running">
                      {integration.running_runs}
                    </span>
                  </td>

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
  );
}

export default IntegrationAnalytics;