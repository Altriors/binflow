export default function StatusBadge({ status, type = "status" }) {
    const label = status?.replace(/_/g, " ") || "unknown";
    const cls = type === "priority" ? `badge badge-${status}` : `badge badge-${status}`;
    return <span className={cls}>{label}</span>;
  }