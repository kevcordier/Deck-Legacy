import { getEffectiveGlory, getEffectiveProductions } from '@engine/application/cardHelpers';
import type {
  CardDef,
  CardSelector,
  GameState,
  StateSelector,
  Sticker,
} from '@engine/domain/types';

interface StateCriteriaContext {
  gameState: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  selector: Pick<CardSelector, 'having'>;
}

function matchHavingGlory(id: number, stateId: number, ctx: StateCriteriaContext): boolean {
  const { gameState, defs, stickerDefs, selector } = ctx;
  const activeState = defs[id].states.find(s => s.id === stateId);
  if (
    activeState &&
    (selector.having?.minGlory !== undefined || selector.having?.maxGlory !== undefined)
  ) {
    const baseGlory = getEffectiveGlory(
      activeState,
      gameState,
      defs,
      gameState.instances[id],
      stickerDefs,
    );
    if (selector.having.minGlory !== undefined && baseGlory < selector.having.minGlory)
      return false;
    if (selector.having.maxGlory !== undefined && baseGlory > selector.having.maxGlory)
      return false;
  }
  return true;
}

function matchHavingProduction(id: number, stateId: number, ctx: StateCriteriaContext): boolean {
  const { gameState, defs, stickerDefs, selector } = ctx;
  const activeState = defs[id].states.find(s => s.id === stateId);
  if (
    activeState &&
    (selector.having?.minProduction !== undefined || selector.having?.maxProduction !== undefined)
  ) {
    const baseProduction = (activeState.productions ?? []).reduce((maxProduction, production) => {
      const effectiveProduction = getEffectiveProductions(
        production,
        gameState,
        defs,
        gameState.instances[id],
        stickerDefs,
        false,
      );
      const totalProduction = Object.values(effectiveProduction).reduce(
        (sum, amount) => sum + amount,
        0,
      );
      return Math.max(maxProduction, totalProduction);
    }, 0);
    if (
      selector.having.minProduction !== undefined &&
      baseProduction < selector.having.minProduction
    )
      return false;
    if (
      selector.having.maxProduction !== undefined &&
      baseProduction > selector.having.maxProduction
    )
      return false;
  }
  return true;
}

function matchHavingSticker(id: number, stateId: number, ctx: StateCriteriaContext): boolean {
  const { gameState, selector } = ctx;
  if (selector.having?.minStickers !== undefined || selector.having?.maxStickers !== undefined) {
    const stickers = gameState.instances[id].stickers[stateId] ?? [];
    if (selector.having.minStickers !== undefined && stickers.length < selector.having.minStickers)
      return false;
    if (selector.having.maxStickers !== undefined && stickers.length > selector.having.maxStickers)
      return false;
  }
  return true;
}

export function matchHaving(id: number, stateId: number, ctx: StateCriteriaContext): boolean {
  if (!ctx.selector.having) return true;

  return (
    matchHavingGlory(id, stateId, ctx) &&
    matchHavingProduction(id, stateId, ctx) &&
    matchHavingSticker(id, stateId, ctx)
  );
}

export function stateSelector(
  selector: StateSelector,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number[] {
  const { ids } = selector;

  return (
    ids?.filter(id => matchHaving(instanceId, id, { gameState, defs, stickerDefs, selector })) ?? []
  );
}
