import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function FailureAnalytics({ failureAnalytics }) {
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
    <section className="dashboard-section">
      <div className="section-header">
        <h2>Failure Analytics</h2>
        <p>Failure distribution by error category and severity</p>
      </div>

      <div className="failure-summary">
        <span>Total Failures</span>
        <strong>{failureAnalytics?.total_failures ?? 0}</strong>
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
  );
}

export default FailureAnalytics;