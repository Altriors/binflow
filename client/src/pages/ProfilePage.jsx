import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Mail, LogOut, Shield, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [ward, setWard] = useState(user?.ward || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await updateProfile({ name, phone, ward });
    setSubmitting(false);
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center p-6 overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-md p-8 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300
          ${theme === "dark"
            ? "bg-[#0e141a]/85 border-[#172026] text-white shadow-black/40"
            : "bg-white/80 border-slate-200 text-slate-900 shadow-slate-200/50"
          }
        `}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/20 mb-4 font-bold text-white text-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold tracking-tight leading-tight">
            Profile Settings
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Update your profile details or sign out
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (Read only) */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={user?.email}
                disabled
                className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all opacity-60 cursor-not-allowed
                  ${theme === "dark"
                    ? "bg-[#111827] border-[#1e293b] text-gray-400"
                    : "bg-slate-100 border-slate-200 text-slate-500"
                  }
                `}
              />
            </div>
          </div>

          {/* Role (Read only) */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
              Role
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <Shield size={16} />
              </span>
              <input
                type="text"
                value={user?.role?.toUpperCase()}
                disabled
                className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all opacity-60 cursor-not-allowed
                  ${theme === "dark"
                    ? "bg-[#111827] border-[#1e293b] text-gray-400"
                    : "bg-slate-100 border-slate-200 text-slate-500"
                  }
                `}
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="profile-name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <User size={16} />
              </span>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all
                  ${theme === "dark"
                    ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                  }
                `}
              />
            </div>
          </div>

          {/* Phone & Ward Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="profile-phone">
                Phone
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                  <Phone size={14} />
                </span>
                <input
                  id="profile-phone"
                  type="text"
                  placeholder="Not set"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none transition-all
                    ${theme === "dark"
                      ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50"
                    }
                  `}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block" htmlFor="profile-ward">
                Ward / Zone
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                  <MapPin size={14} />
                </span>
                <input
                  id="profile-ward"
                  type="text"
                  placeholder="Not set"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none transition-all
                    ${theme === "dark"
                      ? "bg-[#111827] border-[#1e293b] text-white placeholder-gray-500 focus:border-emerald-500/50"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500/50"
                    }
                  `}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Changes <Save size={15} />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-200 dark:border-[#172026] mt-6 pt-5">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-sm py-2.5 border border-red-500/20 hover:border-transparent transition-all cursor-pointer"
          >
            Sign Out <LogOut size={15} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
