export default function MapLoader({ label = "Loading map…" }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50/90 dark:bg-[#0e141a]/90 backdrop-blur-xs text-slate-600 dark:text-gray-400 font-semibold text-xs" aria-live="polite">
      <div className="animate-bounce text-2xl">📍</div>
      <div className="flex items-center gap-2">
        <span className="h-4.5 w-4.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}
