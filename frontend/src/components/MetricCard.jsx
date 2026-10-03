export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  status
}) {
  return (
    <div className="metric-card">

      <div className="metric-top">

        <div className="metric-icon">
          <Icon size={20} />
        </div>

        {status && (
          <span className={`metric-status ${status.toLowerCase()}`}>
            {status}
          </span>
        )}

      </div>

      <div className="metric-value">
        {value}
      </div>

      <div className="metric-title">
        {title}
      </div>

      {subtitle && (
        <div className="metric-subtitle">
          {subtitle}
        </div>
      )}

    </div>
  );
}