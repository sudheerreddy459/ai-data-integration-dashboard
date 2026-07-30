import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">AI</span>

        <div>
          <strong>Integration AI</strong>
          <span>Monitoring Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/integrations"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Integrations
        </NavLink>

        <NavLink
          to="/runs"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Runs
        </NavLink>

        <NavLink
          to="/failures"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Failures
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;