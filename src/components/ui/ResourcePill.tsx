import { getResMeta } from './resourceMeta'
import './ResourcePill.css'

interface ResourcePillProps {
  resource: string
  amount: number
  size?: 'sm' | 'md'
}

export function ResourcePill({ resource, amount, size = 'md' }: ResourcePillProps) {
  const meta = getResMeta(resource)
  return (
    <span
      className={`res ${meta.cls}${size === 'sm' ? ' res--sm' : ''}`}
      title={meta.label}
    >
      {meta.icon} {amount}
    </span>
  )
}
