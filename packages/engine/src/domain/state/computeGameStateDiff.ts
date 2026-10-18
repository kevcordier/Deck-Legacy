import type { GameState } from '../types';

export function computeGameStateDiff(before: GameState, after: GameState): Partial<GameState> {
  return Object.fromEntries(
    (Object.keys(after) as (keyof GameState)[])
      .filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
      .map(key => {
        if (key === 'instances') {
          return [
            key,
            Object.fromEntries(
              Object.entries(after.instances).filter(
                ([id, inst]) =>
                  JSON.stringify(before.instances[Number(id)]) !== JSON.stringify(inst),
              ),
            ),
          ];
        }
        return [key, after[key]];
      }),
  );
}
