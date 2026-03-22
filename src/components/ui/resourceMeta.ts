export type ResMeta = { icon: string; cls: string; label: string }

const RESOURCE_META: Record<string, ResMeta> = {
  gold: { icon: '◈', cls: 'res-gold', label: 'Or' },
  wood: { icon: '⌖', cls: 'res-wood', label: 'Bois' },
  stone: { icon: '◧', cls: 'res-stone', label: 'Pierre' },
  rock: { icon: '◧', cls: 'res-rock', label: 'Roche' },
  iron: { icon: '⬡', cls: 'res-iron', label: 'Fer' },
  sword: { icon: '⚔', cls: 'res-sword', label: 'Épée' },
  goods: { icon: '◉', cls: 'res-goods', label: 'Marchandise' },
}

export function getResMeta(key: string): ResMeta {
  return RESOURCE_META[key] ?? { icon: '●', cls: 'res-default', label: key }
}
