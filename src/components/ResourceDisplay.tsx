import type { Resources, CardInstance, CardState } from '../engine/types'

// ── Resource icons (unicode + emoji fallbacks) ────────────────────────────

const RESOURCE_META: Record<string, { icon: string; cls: string; label: string }> = {
  gold: { icon: '◈', cls: 'res-gold', label: 'Or' },
  wood: { icon: '⌖', cls: 'res-wood', label: 'Bois' },
  stone: { icon: '◧', cls: 'res-stone', label: 'Pierre' },
  rock: { icon: '◧', cls: 'res-rock', label: 'Roche' },
  iron: { icon: '⬡', cls: 'res-iron', label: 'Fer' },
  sword: { icon: '⚔', cls: 'res-sword', label: 'Épée' },
  goods: { icon: '◉', cls: 'res-goods', label: 'Marchandise' },
}

export function getResMeta(key: string) {
  return RESOURCE_META[key] ?? { icon: '●', cls: 'res-default', label: key }
}

// ── ResourcePill ──────────────────────────────────────────────────────────

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

// ── ResourceList ──────────────────────────────────────────────────────────

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

// ── ResourcesChoice ───────────────────────────────────────────────────────

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

// ── Get effective productions from a card state + instance ────────────────

export function getEffectiveProductions(cs: CardState, instance: CardInstance): Resources {
  const base: Resources =
    (cs.resources ?? (cs as any).productions ?? (cs as any).production)?.[0] ?? {}
  const vigBonus = instance.vignettes.reduce<Resources>((acc, v) => {
    if (v.effect.type === 'resource') {
      return { ...acc, [v.effect.resource]: (acc[v.effect.resource] ?? 0) + v.effect.amount }
    }
    return acc
  }, {})
  const result: Resources = { ...base }
  for (const [k, v] of Object.entries(vigBonus)) {
    result[k] = (result[k] ?? 0) + v
  }
  return result
}
