import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function RunTrends({ runTrends }) {
  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h2>Run Trends</h2>
        <p>Integration execution activity for the last 7 days</p>
      </div>

      <div className="chart-container">
        {runTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={runTrends}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="successful_runs"
                name="Successful"
                stroke="#16a34a"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="failed_runs"
                name="Failed"
                stroke="#dc2626"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="running_runs"
                name="Running"
                stroke="#2563eb"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">
            No run trend data available.
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Runs</th>
              <th>Successful</th>
              <th>Failed</th>
              <th>Running</th>
            </tr>
          </thead>

          <tbody>
            {runTrends.length > 0 ? (
              runTrends.map((trend) => (
                <tr key={trend.date}>
                  <td>{trend.date}</td>
                  <td>{trend.total_runs}</td>
                  <td>{trend.successful_runs}</td>
                  <td>{trend.failed_runs}</td>
                  <td>{trend.running_runs}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No run data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RunTrends;