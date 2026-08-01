function AIRecommendations({
  summary,
  recentFailures,
  failureAnalytics,
}) {
  let priority = "LOW";
  let rootCause = "No significant issues detected.";
  let impact = "Low";
  const recommendations = [];

  if (summary?.failed_runs > 0) {
    priority = "MEDIUM";
    impact = "Medium";

    recommendations.push(
      "Review failed integration runs."
    );

    recommendations.push(
      "Retry failed executions after verification."
    );
  }

  if (
    failureAnalytics &&
    failureAnalytics.length > 0
  ) {
    const topFailure = failureAnalytics[0];

    rootCause = `${topFailure.category} is the most common failure category.`;

    if (
      topFailure.category
        ?.toLowerCase()
        .includes("timeout")
    ) {
      priority = "HIGH";
      impact = "High";

      recommendations.push(
        "Check target system availability."
      );

      recommendations.push(
        "Verify network connectivity."
      );

      recommendations.push(
        "Retry failed integrations."
      );

      recommendations.push(
        "Monitor response time for the next hour."
      );
    }

    if (
      topFailure.category
        ?.toLowerCase()
        .includes("authentication")
    ) {
      priority = "HIGH";
      impact = "High";

      recommendations.push(
        "Validate API credentials."
      );

      recommendations.push(
        "Check OAuth or access tokens."
      );
    }

    if (
      topFailure.category
        ?.toLowerCase()
        .includes("validation")
    ) {
      priority = "MEDIUM";

      recommendations.push(
        "Validate incoming payload."
      );

      recommendations.push(
        "Review mapping rules."
      );
    }
  }

  if (
    recentFailures &&
    recentFailures.length > 0
  ) {
    recommendations.push(
      `Latest failed integration: ${recentFailures[0].integration_name}`
    );
  }

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h2>🤖 AI Recommendations</h2>

        <p>
          Suggested operational actions based on
          current system activity
        </p>
      </div>

      <div className="analysis-panel">
        <div className="run-details-grid">
          <div>
            <span>Priority</span>
            <strong>{priority}</strong>
          </div>

          <div>
            <span>Business Impact</span>
            <strong>{impact}</strong>
          </div>

          <div
            style={{ gridColumn: "1 / -1" }}
          >
            <span>Root Cause</span>

            <strong>{rootCause}</strong>
          </div>
        </div>

        <div className="run-error-details">
          <span>Recommended Actions</span>

          <ul className="ai-insights-list">
            {recommendations.map(
              (recommendation, index) => (
                <li key={index}>
                  {recommendation}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AIRecommendations;