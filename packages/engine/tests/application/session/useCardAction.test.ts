import { DEFAULT_OPTIONS, fieldCard } from './fixtures';
import { GameSession } from '@engine/application/session/GameSession';
import {
  ActionEffectType,
  CardTag,
  PendingChoiceType,
  Phase,
  TargetScope,
} from '@engine/domain/enums';
import type { ActionEffect, CardDef, GameCatalog } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const turmeric: CardDef = {
  id: 10,
  name: 'Turmeric',
  states: [
    {
      id: 1,
      name: 'Turmeric',
      actions: [
        {
          id: 'use',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.USE_CARD_ACTION,
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] },
            },
          ],
        },
      ],
    },
  ],
};

const merchant: CardDef = {
  id: 11,
  name: 'Merchant',
  states: [
    {
      id: 1,
      name: 'Merchant',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: 'trade',
          cost: { resources: [{ gold: 1 }, { stone: 1 }] },
          actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 2 } }],
        },
        {
          id: 'promote',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    { id: 2, name: 'Rich Merchant', tags: [CardTag.PERSON] },
  ],
};

/** Instance 2 is Turmeric, 3 and 4 are merchants, the others fields (the gold cheat produces with 1). */
function catalog(): GameCatalog {
  return {
    cards: { 1: fieldCard, 10: turmeric, 11: merchant },
    stickers: {},
    campaign: Array.from({ length: 12 }, (_, i) => {
      let cardId = 1;
      if (i === 1) cardId = 10;
      if (i === 2 || i === 3) cardId = 11;
      return { id: i + 1, cardId };
    }),
    discoverable: [],
    expansions: {},
    stickerStock: {},
  };
}

function start(firstDraw: number[]) {
  const rest = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(id => !firstDraw.includes(id));
  return GameSession.start(
    'use',
    catalog(),
    { ...DEFAULT_OPTIONS, allowCheats: true },
    'tutorial',
    [...firstDraw, ...rest],
  );
}

function pending(session: GameSession) {
  const [choice] = session.toView().pendingChoices ?? [];
  return choice;
}

function pickCard(session: GameSession, instanceId: number) {
  const choice = pending(session);
  session.execute({
    type: 'resolvePlayerChoice',
    choice: {
      id: choice.id,
      type: choice.kind,
      sourceInstanceId: choice.sourceInstanceId,
      instanceIds: [instanceId],
    },
    choiceType: choice.type,
  });
}

function pickAction(session: GameSession, actionId: string) {
  const choice = pending(session);
  const effect = choice.choices.find(
    option =>
      typeof option === 'object' &&
      'usedAction' in option &&
      option.usedAction?.actionId === actionId,
  );
  session.execute({
    type: 'resolvePlayerChoice',
    choice: {
      id: choice.id,
      type: choice.kind,
      sourceInstanceId: choice.sourceInstanceId,
      newActionEffects: [effect as ActionEffect],
    },
    choiceType: choice.type,
  });
}

describe('USE_CARD_ACTION', () => {
  it('asks for the person, then resolves its only usable action for it', () => {
    const session = start([2, 3, 4, 5]);

    session.execute({ type: 'resolveAction', instanceId: 2, actionId: 'use' });
    expect(pending(session).type).toBe(PendingChoiceType.CHOOSE_CARD);
    expect(pending(session).choices).toEqual([3, 4]);
    pickCard(session, 4);

    // Without gold only the free action is usable: it resolves right away, for the merchant.
    const state = session.getState();
    expect(session.toView().pendingChoices).toBeNull();
    expect(state.instances[4].stateId).toBe(2);
    expect(state.instances[2].stateId).toBe(1);
    expect(state.board).not.toContain(2);
    expect(state.turn).toBe(1);
    // The server replays the recorded commands to the same events.
    const firstDraw = [2, 3, 4, 5, 1, 6, 7, 8, 9, 10];
    const verified = GameSession.verify('use', structuredClone(session.getEvents()), {
      ...catalog(),
      tutorialDrawOrder: firstDraw,
    });
    expect(verified?.getState().instances[4].stateId).toBe(2);
  });

  it('lets the player choose the action and pays its cost, without ending the turn', () => {
    const session = start([1, 2, 3, 5]);
    session.execute({ type: 'cheat', cheat: { op: 'addResources', resources: { gold: 1 } } });

    session.execute({ type: 'resolveAction', instanceId: 2, actionId: 'use' });
    pickCard(session, 3);
    expect(pending(session).type).toBe(PendingChoiceType.CHOOSE_ACTION_EFFECT);
    expect(pending(session).choices).toHaveLength(2);
    pickAction(session, 'trade');

    const state = session.getState();
    expect(session.toView().pendingChoices).toBeNull();
    expect(state.resources.gold ?? 0).toBe(0);
    expect(state.resources.wood).toBe(2);
    expect(state.board).toContain(3);
    expect(state.board).not.toContain(2);
    expect(state.phase).toBe(Phase.PLAYING);
    expect(state.turn).toBe(1);
  });

  it("asks how to pay the used action's cost when it can be paid several ways", () => {
    const session = start([1, 2, 3, 5]);
    session.execute({
      type: 'cheat',
      cheat: { op: 'addResources', resources: { gold: 1, stone: 1 } },
    });

    session.execute({ type: 'resolveAction', instanceId: 2, actionId: 'use' });
    pickCard(session, 3);
    pickAction(session, 'trade');
    expect(pending(session)).toMatchObject({
      kind: ActionEffectType.COST,
      type: PendingChoiceType.CHOOSE_RESOURCE,
    });
    session.execute({
      type: 'resolvePayCost',
      resolved: { resources: { stone: 1 }, discardedCardIds: [], destroyedCardIds: [] },
    });

    const state = session.getState();
    expect(state.resources).toMatchObject({ gold: 1, wood: 2 });
    expect(state.resources.stone ?? 0).toBe(0);
  });
});
