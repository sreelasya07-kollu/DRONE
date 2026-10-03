export default function StatusBadge({ status }) {

  const value = String(status || "UNKNOWN").toUpperCase();

  return (
    <span
      className={`status-badge ${value
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      <span className="badge-dot"></span>
      {value}
    </span>
  );
}