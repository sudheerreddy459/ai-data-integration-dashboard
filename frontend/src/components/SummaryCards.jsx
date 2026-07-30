function SummaryCards({ summary }) {
  return (
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
  );
}

export default SummaryCards;