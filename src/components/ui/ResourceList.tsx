import type { Resources } from '../../engine/types'
import { ResourcePill } from './ResourcePill'
import './ResourceList.css'

interface ResourceListProps {
  resources: Resources
  size?: 'sm' | 'md'
  className?: string
}

export function ResourceList({ resources, size, className }: ResourceListProps) {
  const entries = Object.entries(resources).filter(([, v]) => v > 0)
  if (entries.length === 0) return null
  return (
    <div className={`res-list${className ? ` ${className}` : ''}`}>
      {entries.map(([k, v]) => (
        <ResourcePill key={k} resource={k} amount={v} size={size} />
      ))}
    </div>
  )
}
