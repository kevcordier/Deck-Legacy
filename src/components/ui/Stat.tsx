import './Stat.css'

interface StatProps {
  label: string
  value: number | string
  color?: string
}

export function Stat({ label, value, color }: StatProps) {
  return (
    <div className="stat">
      <div className="stat-value" style={color ? { color } : undefined}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
