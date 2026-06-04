export default function StatusBadge({ status, type = "status" }) {
  const label = status?.replace(/_/g, " ") || "unknown";

  // Map status values to Tailwind classes
  const getColorClasses = (val) => {
    switch (val) {
      case "resolved":
      case "closed":
      case "low":
        return {
          dark: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          light: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
      case "in_progress":
      case "medium":
        return {
          dark: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          light: "bg-amber-50 text-amber-700 border-amber-200"
        };
      case "assigned":
      case "info":
        return {
          dark: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          light: "bg-blue-50 text-blue-700 border-blue-200"
        };
      case "reported":
      case "pending":
        return {
          dark: "bg-slate-500/10 text-slate-400 border-slate-500/20",
          light: "bg-slate-100 text-slate-600 border-slate-200"
        };
      case "critical":
      case "high":
        return {
          dark: "bg-red-500/10 text-red-400 border-red-500/20",
          light: "bg-red-50 text-red-700 border-red-200"
        };
      default:
        return {
          dark: "bg-slate-500/10 text-slate-400 border-slate-500/20",
          light: "bg-slate-100 text-slate-600 border-slate-200"
        };
    }
  };

  const themeClasses = getColorClasses(status?.toLowerCase());

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border select-none transition-colors
      dark:${themeClasses.dark} ${themeClasses.light}
    `}>
      {/* Blinking dot indicator */}
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
      {label}
    </span>
  );
}