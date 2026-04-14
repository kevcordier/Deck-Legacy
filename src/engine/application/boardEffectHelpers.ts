import type { PassiveType } from '@engine/domain/enums';
import type { GameState } from '@engine/domain/types';

export function getAffectedCardsByBoardEffects(
  gameState: GameState,
  passiveType: PassiveType,
): Record<number, number[]> {
  const affectedInstanceIds: Record<number, number[]> = {};
  Object.entries(gameState.boardEffects).forEach(([sourceId, effects]) =>
    effects
      .filter(be => be.type === passiveType)
      .forEach(be => {
        if (be.cards?.ids) {
          affectedInstanceIds[Number(sourceId)] = [
            ...(affectedInstanceIds[Number(sourceId)] ?? []),
            ...be.cards.ids,
          ];
        }
      }),
  );

  return affectedInstanceIds;
}
