import { PassiveType } from '../enums';
import type { CardDef, GameState, Resources, Sticker } from '../types';
import type { ResourceEquivalence } from './ResourceEquivalence';
import type { ResourceKey } from './ResourceKey';

function getEquivalenceResources(passive: { resources?: Partial<Resources> }): ResourceKey[] {
  if (!passive.resources) return [];
  return Object.entries(passive.resources)
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([resource]) => resource as ResourceKey);
}

export function getSourceResourceEquivalence(
  _sourceInstanceId: number,
  gameState: GameState,
  _defs: Record<number, CardDef>,
  _stickerDefs: Record<number, Sticker>,
): ResourceEquivalence | undefined {
  const groups = Object.entries(gameState.boardEffects).flatMap(([, passives]) =>
    passives
      .filter(passive => passive.type === PassiveType.RESOURCE_EQUIVALENCE)
      .map(getEquivalenceResources)
      .filter(resources => resources.length >= 2),
  );

  if (groups.length === 0) return undefined;

  return { groups };
}
