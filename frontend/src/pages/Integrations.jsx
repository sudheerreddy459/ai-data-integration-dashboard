import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

const INITIAL_FORM = {
  name: "",
  source_system: "",
  target_system: "",
  status: "Active",
};

function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadIntegrations() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/integrations/`
        );

        if (!response.ok) {
          throw new Error("Failed to load integrations");
        }

        const data = await response.json();

        if (!cancelled) {
          setIntegrations(data);
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

    loadIntegrations();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshIntegrations() {
    const response = await fetch(
      `${API_BASE_URL}/integrations/`
    );

    if (!response.ok) {
      throw new Error("Failed to refresh integrations");
    }

    const data = await response.json();
    setIntegrations(data);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/integrations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        let message = "Failed to create integration";

        try {
          const errorData = await response.json();

          if (typeof errorData.detail === "string") {
            message = errorData.detail;
          }
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      setFormData(INITIAL_FORM);
      setShowForm(false);

      await refreshIntegrations();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleString();
  }

  function getStatusClass(status) {
    const normalizedStatus = status
      ? status.toLowerCase()
      : "unknown";

    if (
      normalizedStatus === "active" ||
      normalizedStatus === "success"
    ) {
      return "badge badge-success";
    }

    if (
      normalizedStatus === "failed" ||
      normalizedStatus === "inactive"
    ) {
      return "badge badge-failed";
    }

    if (
      normalizedStatus === "running" ||
      normalizedStatus === "testing"
    ) {
      return "badge badge-running";
    }

    return "badge badge-category";
  }

  const activeCount = integrations.filter(
    (integration) =>
      integration.status?.toLowerCase() === "active"
  ).length;

  const testingCount = integrations.filter(
    (integration) =>
      integration.status?.toLowerCase() === "testing"
  ).length;

  const inactiveCount = integrations.filter(
    (integration) =>
      integration.status?.toLowerCase() === "inactive"
  ).length;

  if (loading) {
    return (
      <div className="message">
        Loading integrations...
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
      <header className="dashboard-header page-header">
        <div>
          <h1>Integrations</h1>

          <p>
            View and manage enterprise integration configurations
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setCreateError(null);
          }}
        >
          {showForm ? "Cancel" : "+ New Integration"}
        </button>
      </header>

      <main>
        {showForm && (
          <section className="dashboard-section integration-form-section">
            <div className="section-header">
              <h2>Create Integration</h2>

              <p>
                Configure a new source-to-target integration
              </p>
            </div>

            <form
              className="integration-form"
              onSubmit={handleSubmit}
            >
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="name">
                    Integration Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Example: Salesforce to SAP"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="source_system">
                    Source System
                  </label>

                  <input
                    id="source_system"
                    name="source_system"
                    type="text"
                    value={formData.source_system}
                    onChange={handleChange}
                    placeholder="Example: Salesforce"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="target_system">
                    Target System
                  </label>

                  <input
                    id="target_system"
                    name="target_system"
                    type="text"
                    value={formData.target_system}
                    onChange={handleChange}
                    placeholder="Example: SAP"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="status">
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Testing">
                      Testing
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              {createError && (
                <div className="analysis-error">
                  {createError}
                </div>
              )}

              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create Integration"}
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  disabled={creating}
                  onClick={() => {
                    setShowForm(false);
                    setCreateError(null);
                    setFormData(INITIAL_FORM);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="summary-grid">
          <div className="summary-card">
            <span>Total Integrations</span>
            <strong>{integrations.length}</strong>
          </div>

          <div className="summary-card">
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>

          <div className="summary-card">
            <span>Testing</span>
            <strong>{testingCount}</strong>
          </div>

          <div className="summary-card">
            <span>Inactive</span>
            <strong>{inactiveCount}</strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Integration Registry</h2>

            <p>
              Configured source and target system integrations
            </p>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Integration</th>
                  <th>Source</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>

              <tbody>
                {integrations.length > 0 ? (
                  integrations.map((integration) => (
                    <tr key={integration.id}>
                      <td>{integration.id}</td>

                    <td>
                    <Link
                    className="integration-link"
                    to={`/integrations/${integration.id}`}
                    >
                    {integration.name}
                    </Link>
                    </td>

                      <td>
                        {integration.source_system}
                      </td>

                      <td>
                        {integration.target_system}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            integration.status
                          )}
                        >
                          {integration.status ||
                            "Unknown"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          integration.created_at
                        )}
                      </td>

                      <td>
                        {formatDate(
                          integration.updated_at
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      No integrations configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default Integrations;