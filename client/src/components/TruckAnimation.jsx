import { useEffect, useState } from "react";

export default function TruckAnimation({ onComplete, autoStart = false }) {
  const [phase, setPhase] = useState(autoStart ? "arriving" : "idle");
  // phases: idle → arriving → loading → leaving → done

  useEffect(() => {
    if (phase === "idle") return;
    const timings = {
      arriving: 1800,
      loading: 2200,
      leaving: 1800,
    };
    if (phase === "done") { onComplete?.(); return; }
    const next = { arriving: "loading", loading: "leaving", leaving: "done" };
    const t = setTimeout(() => setPhase(next[phase]), timings[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "idle") {
    return (
      <button className="btn btn-warning" onClick={() => setPhase("arriving")}
        style={{ gap: "0.5rem" }}>
        🚛 Animate Dispatch
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "2rem",
        width: "min(480px, 90vw)", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "popIn 0.35s ease",
      }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {phase === "arriving" && "🚛 Truck en route..."}
          {phase === "loading" && "♻️ Collecting waste..."}
          {phase === "leaving" && "✅ All clear! Truck leaving..."}
        </div>

        {/* Scene */}
        <div style={{
          position: "relative", height: 140,
          background: "linear-gradient(180deg, #e0f2e9 0%, #bbf7d0 60%, #86efac 100%)",
          borderRadius: 12, overflow: "hidden", marginBottom: "1.25rem",
        }}>
          {/* Road */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 36,
            background: "#374151",
          }}>
            {/* Road markings */}
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                left: `${i * 18 + (phase === "arriving" ? -10 : phase === "leaving" ? 10 : 0) * 2}%`,
                width: 40, height: 4, background: "#fbbf24", borderRadius: 2,
                transition: "left 0.1s linear",
                animation: phase !== "loading" ? "roadMove 0.4s linear infinite" : "none",
              }} />
            ))}
          </div>

          {/* Garbage bin */}
          <div style={{
            position: "absolute",
            bottom: 36,
            left: phase === "loading" ? "52%" : phase === "leaving" ? "200%" : "52%",
            transition: "left 0.6s ease, opacity 0.4s ease",
            opacity: phase === "leaving" ? 0 : 1,
            fontSize: "2.2rem",
            lineHeight: 1,
          }}>
            🗑️
          </div>

          {/* Garbage pile */}
          <div style={{
            position: "absolute", bottom: 36, left: "55%",
            fontSize: "1.2rem", lineHeight: 1,
            opacity: phase === "arriving" ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}>
            🍂🥡
          </div>

          {/* Truck */}
          <div style={{
            position: "absolute",
            bottom: 36,
            left: phase === "arriving"
              ? "5%"
              : phase === "loading"
              ? "30%"
              : "110%",
            transition: phase === "arriving"
              ? "left 1.8s cubic-bezier(0.25,0.46,0.45,0.94)"
              : phase === "leaving"
              ? "left 1.8s cubic-bezier(0.55,0,1,0.45)"
              : "left 0.6s ease",
            fontSize: "3.5rem",
            lineHeight: 1,
            filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))",
          }}>
            🚛
          </div>

          {/* Loading sparks */}
          {phase === "loading" && (
            <div style={{ position: "absolute", bottom: 80, left: "43%", fontSize: "1.2rem",
              animation: "blink 0.4s ease-in-out infinite" }}>
              ✨
            </div>
          )}

          {/* Sun */}
          <div style={{ position: "absolute", top: 10, right: 16, fontSize: "1.6rem" }}>☀️</div>

          {/* Done checkmark */}
          {phase === "leaving" && (
            <div style={{
              position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
              fontSize: "2.5rem", animation: "popIn 0.4s ease",
            }}>
              ✅
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {["arriving","loading","leaving"].map(p => (
            <div key={p} style={{
              width: p === phase ? 24 : 8, height: 8,
              borderRadius: 4,
              background: p === phase ? "var(--color-primary)" : "var(--color-border)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          {phase === "arriving" && "Field worker is heading to the complaint location..."}
          {phase === "loading" && "Worker is collecting and disposing the waste..."}
          {phase === "leaving" && "Job complete! Location is clean."}
        </p>
      </div>

      <style>{`
        @keyframes roadMove {
          from { transform: translateY(-50%) translateX(0); }
          to   { transform: translateY(-50%) translateX(-18px); }
        }
      `}</style>
    </div>
  );
}