import { PassiveType } from '../../enums';
import type { CardDef, GameState } from '../../types';
import { cardSelector } from './cardSelector';
import { getActiveState } from './getActiveState';
import { getAffectedCardsByBoardEffects } from './getAffectedCardsByBoardEffects';
import { isPermanent } from './isPermanent';

// Sticker ID for the 'stays_in_play' effect (see src/data/stickers.ts)
const STAYS_IN_PLAY_STICKER_ID = 7;

export function cardShouldStayInPlay(
  instanceId: number,
  gameState: GameState,
  cardDefs: Record<number, CardDef>,
): boolean {
  const instance = gameState.instances[instanceId];
  if (!instance) return false;
  const def = cardDefs[instance.cardId];
  if (isPermanent(getActiveState(instance, cardDefs))) return true;
  const state = def?.states.find(s => s.id === instance.stateId);
  if (state?.passives?.some(p => p.type === PassiveType.STAY_IN_PLAY)) return true;

  const stayInPlayTargets = new Set<number>(
    Object.entries(gameState.boardEffects).flatMap(([sourceId, passives]) =>
      passives
        .filter(passive => passive.type === PassiveType.STAY_IN_PLAY)
        .flatMap(passive => {
          if (!passive.cards) {
            return [Number(sourceId)];
          }
          return cardSelector(passive.cards, Number(sourceId), gameState, cardDefs, {});
        }),
    ),
  );

  if (stayInPlayTargets.has(instanceId)) return true;

  if (
    Object.values(getAffectedCardsByBoardEffects(gameState, PassiveType.STAY_IN_PLAY))
      .flat()
      .includes(instanceId)
  )
    return true;
  // If the card is blocked by a card that also has STAY_IN_PLAY, it should stay in play
  const blockerCard = Object.entries(
    getAffectedCardsByBoardEffects(gameState, PassiveType.BLOCK),
  ).find(([_, ids]) => ids.includes(instanceId))?.[0];
  if (blockerCard && stayInPlayTargets.has(Number(blockerCard))) {
    return true;
  }
  if (
    blockerCard &&
    Object.values(getAffectedCardsByBoardEffects(gameState, PassiveType.STAY_IN_PLAY))
      .flat()
      .includes(Number(blockerCard))
  ) {
    return true;
  }
  const stickers = instance.stickers[instance.stateId] ?? [];
  return stickers.includes(STAYS_IN_PLAY_STICKER_ID);
}
