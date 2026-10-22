import { makeDef, makeInstance, makeState } from '../fixtures';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { ActionEffectType, CardTag, GameEventType, Phase } from '@engine/domain/enums';
import type { CardAction, CardDef, ExpansionConfig } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const chooseFoundation: CardAction = {
  id: 'campaign-setup',
  actionEffects: [{ id: 1, type: ActionEffectType.ADVANCE_STORY, value: 1 }],
};

const campaignDef: CardDef = {
  id: 1,
  name: 'Campaign',
  states: [{ id: 1, name: 'Campaign', tags: [CardTag.PERMANENT] }],
};

const coverAction: CardAction = {
  id: 'cover-1',
  actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
};

const coverDef: CardDef = {
  id: 2,
  name: 'Cover',
  parchmentCard: true,
  states: [{ id: 1, name: 'Cover', actions: [coverAction] }],
};

const defs = { 1: campaignDef, 2: coverDef, 3: makeDef({ id: 3 }) };

describe('Campaign setup actions (EDR-059)', () => {
  const purgeState = {
    batchSize: 1,
    permanentToPurge: 0,
    shuffledPool: [1],
    completedBatchStarts: [0],
    selectedCardIds: [1],
    selectedPermanentIds: [],
    onPurgeTriggered: true,
    onStartDiscoverIds: [10],
  };

  function purgeAggregate(onStartActions?: CardAction[]) {
    const state = makeState({
      phase: Phase.PURGE,
      round: 0,
      drawPile: [1],
      discoveryPile: [10],
      instances: {
        1: makeInstance({ id: 1, cardId: 3, stateId: 1 }),
        10: makeInstance({ id: 10, cardId: 1, stateId: 1 }),
      },
      purgeState: { ...purgeState, onStartActions },
    });
    return new GameAggregate(crypto.randomUUID(), state, defs, {}, []);
  }

  it('records the setup actions of the campaign when it is selected', () => {
    const agg = new GameAggregate(crypto.randomUUID(), makeState(), defs, {}, []);
    const config: ExpansionConfig = {
      purge: { permanent: 0, purge: 0 },
      campaign: [{ id: 10, cardId: 1 }],
      onStart: { discover: { ids: [10] }, actions: [chooseFoundation] },
    };

    const result = agg.selectExpansion('Campaign', config);

    expect(result.purgeState?.onStartActions).toEqual([chooseFoundation]);
  });

  it('queues the setup for the campaign card, then waits for the player to start the round', () => {
    const agg = purgeAggregate([chooseFoundation]);

    const result = agg.finalizePurge();

    expect(result.phase).toBe(Phase.ROUND_END);
    expect(result.round).toBe(0);
    expect(Object.values(result.triggerPile)).toEqual([
      { effectDef: chooseFoundation, sourceInstanceId: 10 },
    ]);
  });

  it('starts the first round at once without setup actions', () => {
    const result = purgeAggregate().finalizePurge();

    expect(result.round).toBe(1);
    expect(result.triggerPile).toEqual({});
  });
});

describe('Parchment discovered by an effect (EDR-059)', () => {
  const advanceStory: CardAction = {
    id: 'advance',
    actionEffects: [{ id: 1, type: ActionEffectType.ADVANCE_STORY, value: 1 }],
  };

  function aggregateWithCover(expansion: string | undefined) {
    const state = makeState({
      phase: Phase.ROUND_END,
      permanents: [10],
      discoveryPile: [45],
      instances: {
        10: makeInstance({ id: 10, cardId: 1, stateId: 1 }),
        45: { ...makeInstance({ id: 45, cardId: 2, stateId: 1 }), expansion },
      },
    });
    return new GameAggregate(crypto.randomUUID(), state, defs, {}, []);
  }

  it('shows an expansion parchment, then goes back to the phase of the game', () => {
    const agg = aggregateWithCover('Foundations');

    const discovered = agg.cardAction(advanceStory, 10);
    expect(discovered.phase).toBe(Phase.PARCHMENT);
    expect(discovered.onGoingParchment).toBe(45);
    expect(discovered.parchmentResumePhase).toBe(Phase.ROUND_END);

    const resolved = agg.cardAction(coverAction, 45);
    expect(resolved.phase).toBe(Phase.ROUND_END);
    expect(resolved.onGoingParchment).toBeUndefined();
    expect(resolved.parchmentResumePhase).toBeUndefined();
    expect(resolved.resources.gold).toBe(1);
  });

  it('keeps the former handling of a base game parchment', () => {
    const agg = aggregateWithCover(undefined);

    const result = agg.cardAction(advanceStory, 10);

    expect(result.phase).toBe(Phase.ROUND_END);
    expect(result.onGoingParchment).toBe(45);
    expect(agg.getEvents().map(event => event.type)).toEqual([GameEventType.CARD_ACTION]);
  });
});
