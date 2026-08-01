import { useEffect, useState } from "react";

import SummaryCards from "../components/SummaryCards";
import RunTrends from "../components/RunTrends";
import FailureAnalytics from "../components/FailureAnalytics";
import IntegrationAnalytics from "../components/IntegrationAnalytics";
import RecentFailures from "../components/RecentFailures";
import AIInsights from "../components/AIInsights";

const API_BASE_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [runTrends, setRunTrends] = useState([]);
  const [integrationAnalytics, setIntegrationAnalytics] = useState([]);
  const [recentFailures, setRecentFailures] = useState([]);
  const [failureAnalytics, setFailureAnalytics] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [analyzingRunId, setAnalyzingRunId] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          summaryResponse,
          trendsResponse,
          analyticsResponse,
          failuresResponse,
          failureAnalyticsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/summary`),
          fetch(`${API_BASE_URL}/dashboard/run-trends?days=7`),
          fetch(`${API_BASE_URL}/dashboard/integration-analytics`),
          fetch(`${API_BASE_URL}/dashboard/recent-failures?limit=5`),
          fetch(`${API_BASE_URL}/dashboard/failure-analytics`),
        ]);

        if (
          !summaryResponse.ok ||
          !trendsResponse.ok ||
          !analyticsResponse.ok ||
          !failuresResponse.ok ||
          !failureAnalyticsResponse.ok
        ) {
          throw new Error("Failed to load dashboard data");
        }

        const [
          summaryData,
          trendsData,
          analyticsData,
          failuresData,
          failureAnalyticsData,
        ] = await Promise.all([
          summaryResponse.json(),
          trendsResponse.json(),
          analyticsResponse.json(),
          failuresResponse.json(),
          failureAnalyticsResponse.json(),
        ]);

        setSummary(summaryData);
        setRunTrends(trendsData);
        setIntegrationAnalytics(analyticsData);
        setRecentFailures(failuresData);
        setFailureAnalytics(failureAnalyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  async function analyzeFailure(runId) {
    setAnalyzingRunId(runId);
    setAnalysis(null);
    setAnalysisError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai-analysis/failures/${runId}`
      );

      if (!response.ok) {
        throw new Error("Failed to analyze integration failure");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setAnalyzingRunId(null);
    }
  }

  if (loading) {
    return <div className="message">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="message error">Error: {error}</div>;
  }

  return (
    <>
      <header className="dashboard-header">
        <h1>AI Data Integration Dashboard</h1>
        <p>Enterprise integration monitoring and failure analysis</p>
      </header>

      <main>
        <SummaryCards summary={summary} />

        <AIInsights
          summary={summary}
          failureAnalytics={failureAnalytics}
          recentFailures={recentFailures}
        />
        <RunTrends runTrends={runTrends} />

        <FailureAnalytics
          failureAnalytics={failureAnalytics}
        />

        <IntegrationAnalytics
          integrationAnalytics={integrationAnalytics}
        />

        <RecentFailures
          recentFailures={recentFailures}
          analysis={analysis}
          analysisError={analysisError}
          analyzingRunId={analyzingRunId}
          onAnalyzeFailure={analyzeFailure}
        />
      </main>
    </>
  );
}

export default Dashboard;