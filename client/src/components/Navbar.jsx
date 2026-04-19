import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🗑</span>
          BinFlow
        </Link>

        <div className="navbar-links">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Dashboard
              </NavLink>
              <NavLink to="/complaints/new" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                + New Complaint
              </NavLink>
              <NavLink to="/complaints/my" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                My Complaints
              </NavLink>
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