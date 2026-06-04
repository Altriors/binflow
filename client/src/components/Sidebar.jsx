import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  AlertTriangle,
  ClipboardList,
  Map,
  Truck,
  Sun,
  Moon,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Role-based links config matching Lovable screenshots with Lucide icons
  const getNavLinks = () => {
    switch (user?.role) {
      case "citizen":
        return [
          { to: "/", label: "Overview", icon: LayoutDashboard },
          { to: "/complaints/new", label: "Report Issue", icon: AlertTriangle },
          { to: "/complaints/my", label: "Track Complaints", icon: ClipboardList },
        ];
      case "admin":
        return [
          { to: "/admin", label: "Overview", icon: LayoutDashboard },
          { to: "/admin/complaints", label: "Complaints", icon: ClipboardList },
          { to: "/admin/map", label: "Map Intelligence", icon: Map },
        ];
      case "worker":
        return [
          { to: "/worker", label: "My Queue", icon: Truck },
        ];
      default:
        return [{ to: "/", label: "Overview", icon: LayoutDashboard }];
    }
  };

  const navLinks = getNavLinks();

  // Filter links if search query is entered
  const filteredLinks = navLinks.filter(link =>
    link.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 260 : 76,
          x: 0,
        }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r shadow-2xl transition-colors duration-300
          ${theme === "dark" 
            ? "bg-[#090d16] border-[#1e293b] text-[#f3f4f6]" 
            : "bg-white border-slate-200 text-slate-900"
          }
        `}
      >
        {/* Brand/Logo Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-inherit">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/20">
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
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-base font-bold tracking-tight flex items-center gap-1.5"
              >
                Bin<span className="text-emerald-500 font-extrabold">Flow</span>
              </motion.span>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-inherit cursor-pointer transition-colors
              ${theme === "dark" 
                ? "bg-[#111827] hover:bg-emerald-500/10 text-emerald-400" 
                : "bg-slate-100 hover:bg-emerald-500/10 text-emerald-600"
              }
            `}
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Sidebar Search Bar (Lovable spec) */}
        {isOpen && (
          <div className="px-4 pt-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-xl py-1.5 pl-8 pr-3 text-xs outline-none transition-colors
                  ${theme === "dark"
                    ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50"
                    : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50"
                  }
                `}
              />
            </div>
          </div>
        )}

        {/* Active role label */}
        {isOpen && (
          <div className="px-5 pt-4 text-[10px] uppercase font-bold tracking-wider text-gray-500">
            {user?.role}
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/" || link.to === "/admin" || link.to === "/worker"}
                className={({ isActive }) => `
                  flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 border
                  ${
                    isActive
                      ? theme === "dark"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-inner"
                        : "bg-emerald-50/80 text-emerald-600 border-emerald-500/15"
                      : theme === "dark"
                      ? "border-transparent hover:bg-[#111827] text-gray-400 hover:text-white"
                      : "border-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-950"
                  }
                `}
              >
                <Icon size={18} className="shrink-0" />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-nowrap"
                  >
                    {link.label}
                  </motion.span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions / Profile */}
        <div className="p-3 border-t border-inherit space-y-2">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-colors
              ${theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-[#111827]"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }
            `}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {isOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </button>

          {/* User Profile Pill at the bottom (matching Lovable screen) */}
          <div className="pt-2 border-t border-inherit">
            <div className={`flex items-center justify-between p-1.5 rounded-xl border
              ${theme === "dark"
                ? "bg-[#111827] border-[#1e293b]"
                : "bg-slate-50 border-slate-200"
              }
            `}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-black">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                {isOpen && (
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold truncate leading-none
                      ${theme === "dark" ? "text-white" : "text-slate-900"}
                    `}>{user?.name}</span>
                    <span className="text-[9px] text-gray-500 uppercase font-semibold mt-0.5">{user?.role}</span>
                  </div>
                )}
              </div>

              {isOpen && (
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-all"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
