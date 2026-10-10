import { makeDefs, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { CardProducedStrategy } from '@engine/application/gameEvent/CardProducedStrategy';
import {
  ActionEffectType,
  GameEventType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef, CardProducedEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('CardProducedStrategy', () => {
  const strategy = new CardProducedStrategy(makeDefs(), makeStickerDefs());

  it('adds productions to resources', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], resources: { gold: 1 }, instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_PRODUCED,
      timestamp: 0,
      cardInstanceId: 1,
      productions: { gold: 3, wood: 1 },
    } as CardProducedEvent);
    expect(result.resources.gold).toBe(4);
    expect(result.resources.wood).toBe(1);
  });

  it('discards the producing card', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_PRODUCED,
      timestamp: 0,
      cardInstanceId: 1,
      productions: {},
    } as CardProducedEvent);
    expect(result.board).not.toContain(1);
    expect(result.discardPile).toContain(1);
  });

  it('registers ON_PRODUCE triggers in triggerPile', () => {
    const onProduceDef: CardDef = {
      id: 2,
      name: 'Producer',
      states: [
        {
          id: 1,
          name: 'Producer',
          productions: [{ [ResourceType.GOLD]: 3 }],
          actions: [
            {
              id: '2-1-1',
              trigger: Trigger.ON_PRODUCE,
              actionEffects: [
                {
                  id: 1,
                  type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
                  resources: { [ResourceType.GOLD]: 1 },
                  resourceScopes: ['production'],
                  cards: { scope: [TargetScope.SELF] },
                },
              ],
            },
          ],
        },
      ],
    };
    const strategyWithProducer = new CardProducedStrategy({ 2: onProduceDef }, makeStickerDefs());
    const inst = makeInstance({ id: 1, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const result = strategyWithProducer.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_PRODUCED,
      timestamp: 0,
      cardInstanceId: 1,
      productions: { gold: 3 },
    } as CardProducedEvent);
    expect(Object.keys(result.triggerPile)).toHaveLength(1);
    const trigger = Object.values(result.triggerPile)[0];
    expect(trigger.sourceInstanceId).toBe(1);
    expect(trigger.effectDef.trigger).toBe(Trigger.ON_PRODUCE);
  });
});
