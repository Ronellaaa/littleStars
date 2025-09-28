// src/pages/mentor/MentorDashboard.jsx
import { NavLink, Outlet } from "react-router-dom";
import "../../styles/mentor/mentor-dashboard.css";

export default function MentorDashboard() {
  return (
    <div className="md-wrap">
      <header className="md-topbar">
        <div className="md-brand">Mentor</div>
        <nav className="md-nav">
          <NavLink to="/mentor/reports" className="md-link">Reports</NavLink>
          <NavLink to="/mentor/scenarios" className="md-link">Scenarios</NavLink>
          <NavLink to="/mentor/content" className="md-link">Content</NavLink>
        </nav>
      </header>

      <main className="md-main">
        <Outlet />
      </main>
    </div>
  );
}
