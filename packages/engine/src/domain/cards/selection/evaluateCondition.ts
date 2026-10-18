import type { CardDef, Condition, GameState, Sticker } from '../../types';
import { cardSelector } from './cardSelector';
import { getTotalResourceProduction } from './getTotalResourceProduction';

function isWithinBounds(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

export function evaluateCondition(
  condition: Condition,
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
  stickers: Record<number, Sticker>,
): boolean {
  switch (condition.type) {
    case 'cardCount': {
      const count = cardSelector(condition.cards, instanceId, gameState, defs, stickers).length;
      return isWithinBounds(count, condition.min, condition.max);
    }
    case 'production': {
      const total = getTotalResourceProduction(
        instanceId,
        condition.resourceType,
        gameState,
        defs,
        stickers,
      );
      return isWithinBounds(total, condition.min, condition.max);
    }
    case 'resource': {
      const total = gameState.resources[condition.resourceType] ?? 0;
      return isWithinBounds(total, condition.min, condition.max);
    }
    case 'and':
      return condition.conditions.every(c =>
        evaluateCondition(c, gameState, instanceId, defs, stickers),
      );
    case 'or':
      return condition.conditions.some(c =>
        evaluateCondition(c, gameState, instanceId, defs, stickers),
      );
    case 'not':
      return !evaluateCondition(condition.condition, gameState, instanceId, defs, stickers);
    case 'accumulation':
      return isWithinBounds(
        gameState.instances[instanceId]?.cumulated ?? 0,
        condition.min,
        condition.max,
      );
    case 'justPlayed':
      return gameState.lastDrawnCards.includes(instanceId);
    case 'expansionActive':
      return (
        gameState.activeExpansion === condition.name &&
        !Object.hasOwn(gameState.campaignScores, condition.name)
      );
  }
}
