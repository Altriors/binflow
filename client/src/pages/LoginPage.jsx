import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);
    if (!result.ok) return;
    navigate(location.state?.from?.pathname || "/", { replace: true });
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center p-6 overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 15, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[100px]"
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full max-w-md p-8 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300
          ${theme === "dark"
            ? "bg-[#0e141a]/85 border-[#172026] text-white shadow-black/40"
            : "bg-white/80 border-slate-200 text-slate-900 shadow-slate-200/50"
          }
        `}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/20 mb-4 animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Welcome back
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Sign in to your BinFlow account
          </p>
        </div>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <Mail size={16} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
                className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all
                  ${theme === "dark"
                    ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                  }
                `}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <Lock size={16} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                required
                autoComplete="current-password"
                className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all
                  ${theme === "dark"
                    ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                  }
                `}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In <LogIn size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-gray-500">
          New to BinFlow?{" "}
          <Link to="/register" className="text-emerald-500 hover:underline font-bold transition-all">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}