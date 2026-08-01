function AIInsights({
  summary,
  failureAnalytics,
  recentFailures,
}) {
  const insights = [];

  if (summary?.running_runs > 0) {
    insights.push(
      `${summary.running_runs} integration run(s) are currently running.`
    );
  }

  if (summary?.failed_runs > 0) {
    insights.push(
      `${summary.failed_runs} failed run(s) require attention.`
    );
  }

  if (
    failureAnalytics &&
    failureAnalytics.length > 0
  ) {
    const topFailure = failureAnalytics[0];

    insights.push(
      `"${topFailure.category}" is currently the most common failure category.`
    );
  }

  if (
    recentFailures &&
    recentFailures.length > 0
  ) {
    const latest = recentFailures[0];

    insights.push(
      `Latest failure occurred in "${latest.integration_name}".`
    );

    if (latest.severity) {
      insights.push(
        `Latest failure severity is "${latest.severity}".`
      );
    }
  }

  if (insights.length === 0) {
    insights.push(
      "No critical operational insights at this time."
    );
  }

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h2>🤖 AI Operations Insights</h2>

        <p>
          Automated summary generated from current
          dashboard data
        </p>
      </div>

      <div className="analysis-panel">
        <ul className="ai-insights-list">
          {insights.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AIInsights;