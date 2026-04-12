import {
  makeCardState,
  makeDef,
  makeGameState,
  makeInstance,
} from '@engine/application/__tests__/testHelpers';
import { PlayCardStrategy } from '@engine/application/cardAction/PlayCardStrategy';
import { ActionType, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const cardDefs: Record<number, CardDef> = {
  10: makeDef(10, [makeCardState(1)]),
};

const cardDefsWithTrigger: Record<number, CardDef> = {
  10: makeDef(10, [
    makeCardState(1, {
      cardEffects: [
        {
          label: 'On play effect',
          trigger: Trigger.ON_PLAY,
          optional: false,
          actions: [{ id: 1, type: ActionType.ADD_RESOURCES }],
        },
      ],
    }),
  ]),
};

const strategy = new PlayCardStrategy(cardDefs);

const instanceId = 5;
const instance = makeInstance(instanceId, 10, 1);

const payload = {
  id: '1-1',
  type: ActionType.PLAY_CARD,
  sourceInstanceId: 99,
  instanceId,
};

describe('PlayCardStrategy', () => {
  it('adds the card to the board', () => {
    const gs = makeGameState({ board: [1], instances: { [instanceId]: instance } });
    const result = strategy.applyEffect(gs, payload);
    expect(result.board).toContain(instanceId);
    expect(result.board).toContain(1);
  });

  it('removes the card from discoveryPile', () => {
    const gs = makeGameState({ discoveryPile: [5, 6], instances: { [instanceId]: instance } });
    const result = strategy.applyEffect(gs, payload);
    expect(result.discoveryPile).toEqual([6]);
  });

  it('removes the card from drawPile', () => {
    const gs = makeGameState({ drawPile: [5, 7], instances: { [instanceId]: instance } });
    const result = strategy.applyEffect(gs, payload);
    expect(result.drawPile).toEqual([7]);
  });

  it('removes the card from discardPile', () => {
    const gs = makeGameState({ discardPile: [5, 8], instances: { [instanceId]: instance } });
    const result = strategy.applyEffect(gs, payload);
    expect(result.discardPile).toEqual([8]);
  });

  it('removes the card from destroyedPile', () => {
    const gs = makeGameState({ destroyedPile: [5, 9], instances: { [instanceId]: instance } });
    const result = strategy.applyEffect(gs, payload);
    expect(result.destroyedPile).toEqual([9]);
  });

  it('adds ON_PLAY trigger effects to the triggerPile', () => {
    const strategyWithTrigger = new PlayCardStrategy(cardDefsWithTrigger);
    const gs = makeGameState({ instances: { [instanceId]: instance } });
    const result = strategyWithTrigger.applyEffect(gs, payload);
    expect(Object.values(result.triggerPile)).toHaveLength(1);
  });
});
