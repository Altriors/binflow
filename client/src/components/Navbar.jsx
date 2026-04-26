import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11v6M14 11v6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="navbar-wordmark">Bin<span>Flow</span></span>
        </Link>

        <div className="navbar-links">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Sign in
              </NavLink>
              <NavLink to="/register" className="nav-link-new">
                Get started
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Dashboard
              </NavLink>

              {user?.role === "citizen" && (
                <>
                  <NavLink to="/complaints/new" className="nav-link-new">
                    + Report Issue
                  </NavLink>
                  <NavLink to="/complaints/my" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                    My Complaints
                  </NavLink>
                </>
              )}

              {user?.role === "admin" && (
                <>
                  <NavLink to="/admin/complaints" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                    All Complaints
                  </NavLink>
                  <NavLink to="/admin/map" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                    Map View
                  </NavLink>
                </>
              )}

              <div className="navbar-divider" />

              <div className="navbar-user-pill">
                <span className="navbar-avatar">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
                <span>{user?.name?.split(" ")[0]}</span>
              </div>

              <button className="btn btn-ghost btn-sm" onClick={logout}>
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}