import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardInstance, GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
// Instance ids of the base deck (deck.json): Field Worker and two Wild Grass (land)
const FIELD_WORKER = 13;
const LAND = 1;
const OTHER_LAND = 2;
const GOLD_STICKER = 1;
const SWAMP = 21;

function play(landStates: Record<number, number>, landStickers: Record<number, number[]>) {
  const instances: Record<number, CardInstance> = {
    [FIELD_WORKER]: createInstance(FIELD_WORKER, 8, 1, catalog.cards),
    [LAND]: createInstance(LAND, 1, landStates[LAND] ?? 1, catalog.cards),
    [OTHER_LAND]: createInstance(OTHER_LAND, 1, landStates[OTHER_LAND] ?? 1, catalog.cards),
  };
  for (const [id, stickers] of Object.entries(landStickers)) {
    const instance = instances[Number(id)];
    instance.stickers[instance.stateId] = stickers;
  }
  const agg = new GameAggregate(
    'game',
    {
      ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
      board: [FIELD_WORKER, ...Object.keys(landStickers).map(Number)],
      instances,
    },
    catalog.cards,
    catalog.stickers,
  );
  const action = getStateActions(instances[FIELD_WORKER], catalog.cards, catalog.stickers)[0];
  agg.cardAction(action, FIELD_WORKER);
  return agg;
}

describe('Field Worker', () => {
  it('gains the production of the land, its stickers included', () => {
    const base = play({ [LAND]: 1 }, { [LAND]: [] }).getGameState().resources;
    const agg = play({ [LAND]: 1 }, { [LAND]: [GOLD_STICKER] });
    const gold = (base.gold ?? 0) + 1;
    expect(agg.getGameState().resources.gold).toBe(gold);
  });

  it('gains a production that only comes from stickers (Swamp prints none)', () => {
    const agg = new GameAggregate(
      'game',
      {
        ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
        phase: Phase.PLAYING,
        round: 1,
        turn: 1,
        board: [FIELD_WORKER, SWAMP],
        instances: {
          [FIELD_WORKER]: createInstance(FIELD_WORKER, 8, 1, catalog.cards),
          [SWAMP]: {
            ...createInstance(SWAMP, 13, 1, catalog.cards),
            stickers: { 1: [GOLD_STICKER] },
          },
        },
      },
      catalog.cards,
      catalog.stickers,
    );
    const action = getStateActions(
      agg.getGameState().instances[FIELD_WORKER],
      catalog.cards,
      catalog.stickers,
    )[0];
    agg.cardAction(action, FIELD_WORKER);
    expect(agg.getGameState().resources.gold).toBe(1);
  });
});

describe('Field Worker, with several lands in play', () => {
  it('gains the production of the chosen land, its stickers included', () => {
    const agg = play({}, { [LAND]: [GOLD_STICKER, GOLD_STICKER], [OTHER_LAND]: [] });
    const [choice] = agg.getCurrentCardAction()?.getPendingChoices() ?? [];
    expect(choice?.choices).toEqual([LAND, OTHER_LAND]);
    const before = agg.getGameState().resources.gold ?? 0;
    agg.resolveCardActionChoice(
      {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        instanceIds: [LAND],
      },
      choice.type,
    );
    expect((agg.getGameState().resources.gold ?? 0) - before).toBe(3);
  });
});
