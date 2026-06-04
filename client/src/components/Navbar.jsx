import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Menu, Bell, Plus, Sun, Moon } from "lucide-react";

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Determine current page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/admin/complaints/")) return "Ticket Details";
    if (path === "/admin/complaints") return "Complaints";
    if (path === "/admin/map") return "Map Intelligence";
    if (path === "/admin") return "Network Overview";
    if (path === "/worker") return "My Queue";
    if (path.startsWith("/worker/")) return "Job Details";
    if (path === "/complaints/new") return "Report an Issue";
    if (path === "/complaints/my") return "Track Complaints";
    return "Overview";
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b px-6 transition-all duration-300 backdrop-blur-md
        ${isAuthenticated 
          ? (isSidebarOpen ? "left-64 md:left-[260px]" : "left-[76px]") 
          : "left-0 w-full"
        }
        ${theme === "dark"
          ? "bg-[#080c10]/85 border-[#172026] text-[#f3f4f6]"
          : "bg-[#f8fafc]/85 border-slate-200 text-slate-900"
        }
      `}
    >
      {/* Brand or Sidebar Toggle / Page Title */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <button
              onClick={toggleSidebar}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-inherit cursor-pointer transition-colors
                ${theme === "dark" ? "hover:bg-[#111827]" : "hover:bg-slate-100"}
              `}
            >
              <Menu size={18} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-tight select-none">{getPageTitle()}</h1>
              {user && (
                <span className="text-[10px] text-gray-500 leading-none mt-0.5 hidden sm:inline">
                  BinFlow waste intelligence
                </span>
              )}
            </div>
          </>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight">
              Bin<span className="text-emerald-500">Flow</span>
            </span>
          </Link>
        )}
      </div>

      {/* Nav Actions */}
      <div className="flex items-center gap-3">
        {!isAuthenticated ? (
          <>
            <button
              onClick={toggleTheme}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-inherit cursor-pointer transition-colors
                ${theme === "dark" ? "hover:bg-[#111827]" : "hover:bg-slate-100"}
              `}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <NavLink
              to="/login"
              className="text-sm font-semibold hover:text-emerald-500 transition-colors mr-2"
            >
              Sign in
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Get started
            </NavLink>
          </>
        ) : (
          <>
            {user?.role === "citizen" && (
              <NavLink
                to="/complaints/new"
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 shadow-md hover:bg-emerald-600 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus size={14} /> Report Issue
              </NavLink>
            )}

            {/* Notification Bell */}
            <button
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl border border-inherit cursor-pointer transition-colors
                ${theme === "dark" ? "hover:bg-[#111827]" : "hover:bg-slate-100"}
              `}
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-inherit animate-pulse" />
            </button>

            {/* Micro User Pill */}
            <div className={`flex items-center gap-2 rounded-xl border px-2.5 py-1 text-xs
              ${theme === "dark"
                ? "bg-[#111827] border-[#1e293b]"
                : "bg-slate-100 border-slate-200"
              }
            `}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-[10px]">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="font-semibold hidden sm:inline">{user?.name?.split(" ")[0]}</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}