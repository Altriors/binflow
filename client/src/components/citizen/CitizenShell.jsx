import FloatingBackground from "./FloatingBackground";
import PageTransition from "./PageTransition";

/** Wraps citizen-only pages with ambient motion + page enter animation. */
export default function CitizenShell({ children, className }) {
  return (
    <div className="citizen-shell">
      <FloatingBackground />
      <PageTransition className={className || "page-wrapper citizen-page"}>
        {children}
      </PageTransition>
    </div>
  );
}
