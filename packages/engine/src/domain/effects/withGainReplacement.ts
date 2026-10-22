import { PassiveType } from '../enums';
import type { ActionEffect, GameState, Resources } from '../types';

/**
 * REPLACE_GAIN in play (Jeweler: iron → goods): a fixed gain of the first resource becomes a
 * choice between it and the same amount of the second one.
 */
export function withGainReplacement(action: ActionEffect, gameState: GameState): ActionEffect {
  const resources = action.resources;
  if (action.type !== 'ADD_RESOURCES' || !resources || resources.choice || resources.cards) {
    return action;
  }
  const { pickNumber: _p, pickMin: _min, pickMax: _max, ...gain } = resources;
  let options: Resources[] = [gain];
  for (const passive of Object.values(gameState.boardEffects).flat()) {
    if (passive.type !== PassiveType.REPLACE_GAIN || !passive.resources) continue;
    const [from, to] = Object.keys(passive.resources) as (keyof Resources)[];
    options = options.flatMap(option => {
      const amount = option[from] ?? 0;
      if (amount <= 0 || !to) return [option];
      const rest: Resources = Object.fromEntries(
        Object.entries(option).filter(([type]) => type !== from),
      );
      return [option, { ...rest, [to]: (rest[to] ?? 0) + amount }];
    });
  }
  return options.length > 1 ? { ...action, resources: { choice: options } } : action;
}
