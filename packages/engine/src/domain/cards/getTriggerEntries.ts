import type { Trigger } from '../enums';
import { environment } from '../environment/environment';
import type { CardDef, GameState, Sticker, TriggerEntry } from '../types';
import { getInstancesTriggerEffects } from './getInstancesTriggerEffects';

/** The `trigger` effects of the given cards, keyed for the trigger pile. */
export function getTriggerEntries(
  instanceIds: number[],
  trigger: Trigger,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Record<string, TriggerEntry> {
  const instances = instanceIds.map(id => gameState.instances[id]).filter(Boolean);
  const entries: Record<string, TriggerEntry> = {};
  for (const entry of getInstancesTriggerEffects(
    instances,
    defs,
    stickerDefs,
    trigger,
    gameState,
  )) {
    entries[environment.newId()] = entry;
  }
  return entries;
}
