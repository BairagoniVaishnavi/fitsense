export default function Card({ title, value, subtitle }) {
  return (
    <div className="card stat-card">
      <p className="stat-label">{title}</p>
      <h3>{value}</h3>
      {subtitle ? <span className="muted">{subtitle}</span> : null}
    </div>
  )
}
