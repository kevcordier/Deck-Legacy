import type { Resources } from '../../engine/types'
import { getResMeta } from './resourceMeta'
import './ResourceChoice.css'

interface ResourceChoiceProps {
  options: Resources[]
  onSelect: (r: Resources) => void
}

export function ResourceChoice({ options, onSelect }: ResourceChoiceProps) {
  return (
    <div className="res-choice-list">
      {options.map((opt, i) => {
        const entries = Object.entries(opt)
        const [key, val] = entries[0] ?? ['?', 1]
        const meta = getResMeta(key)
        return (
          <button
            key={i}
            onClick={() => onSelect(opt)}
            className="btn-res-choice"
          >
            <span className="res-choice-icon">{meta.icon}</span>
            <span>
              {val} {meta.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
