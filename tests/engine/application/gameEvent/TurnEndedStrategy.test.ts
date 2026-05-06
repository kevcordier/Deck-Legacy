import { makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { TurnEndedStrategy } from '@engine/application/gameEvent/TurnEndedStrategy';
import { ActionEffectType, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('TurnEndedStrategy', () => {
  it('sets phase to POSTTURN', () => {
    const strategy = new TurnEndedStrategy({}, makeStickerDefs());
    const gs = makeState();
    const result = strategy.apply(gs);
    expect(result.phase).toBe(Phase.POSTTURN);
  });

  it('adds END_OF_TURN triggers to triggerPile for board cards', () => {
    const defWithTrigger: CardDef = {
      id: 1,
      name: 'T',
      states: [
        {
          id: 1,
          name: 'S',
          actions: [
            {
              id: '1-1-1',
              trigger: Trigger.END_OF_TURN,
              actionEffects: [
                { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } },
              ],
            },
          ],
        },
      ],
    };
    const strategy = new TurnEndedStrategy({ 1: defWithTrigger }, makeStickerDefs());
    const inst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [10], instances: { 10: inst } });
    const result = strategy.apply(gs);
    expect(Object.keys(result.triggerPile)).toHaveLength(1);
  });
});
