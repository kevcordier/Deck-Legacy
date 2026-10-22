import { DEFAULT_OPTIONS, makeCatalog } from './fixtures';
import { GameSession } from '@engine/application/session/GameSession';
import { ActionEffectType, CardTag, GameEventType, Phase, Trigger } from '@engine/domain/enums';
import type { CardDef, GameCatalog } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const proclamation: CardDef = {
  id: 3,
  name: 'Proclamation',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Proclamation',
      actions: [
        {
          id: '3-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { choice: [{ gold: 1 }, { wood: 1 }] },
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Always in play: its free unlimited action keeps each turn open (TURN_END) and its optional
 * end-of-round trigger keeps each round open (ROUND_END), so the player ends them.
 */
const well: CardDef = {
  id: 4,
  name: 'Well',
  states: [
    {
      id: 1,
      name: 'Well',
      tags: [CardTag.PERMANENT],
      actions: [
        { id: '4-1-1', unlimited: true, actionEffects: [] },
        { id: '4-1-2', trigger: Trigger.END_OF_ROUND, optional: true, actionEffects: [] },
      ],
    },
  ],
};

/**
 * The minimal catalog, a well (1), a parchment with a choice discovered first (11), two
 * discoverable cards and an expansion.
 */
function campaignCatalog(): GameCatalog {
  const catalog = makeCatalog();
  return {
    ...catalog,
    cards: { ...catalog.cards, 3: proclamation, 4: well },
    campaign: catalog.campaign.map(entry => {
      if (entry.id === 1) return { ...entry, cardId: 4 };
      return entry.id === 11 ? { ...entry, cardId: 3 } : entry;
    }),
    discoverable: [
      { id: 14, cardId: 1 },
      { id: 13, cardId: 1 },
    ],
    expansions: { ext: { campaign: [{ id: 20, cardId: 1 }], purge: { purge: 1, permanent: 0 } } },
  };
}

/** Ends every turn and round at once, until the campaign is over; takes the first option. */
function playToGameOver(session: GameSession): void {
  for (let step = 0; step < 200 && session.getState().phase !== Phase.GAME_OVER; step += 1) {
    const { phase, drawPile, triggerPile } = session.getState();
    const [choice] = session.toView().pendingChoices ?? [];
    const [triggerId] = Object.keys(triggerPile);
    if (choice) {
      session.execute({
        type: 'resolvePlayerChoice',
        choice: {
          id: choice.id,
          type: choice.kind,
          sourceInstanceId: choice.sourceInstanceId,
          resources: choice.choices[0] as Record<string, number>,
        },
        choiceType: choice.type,
      });
    } else if (triggerId) session.execute({ type: 'skipTrigger', triggerId });
    else if (phase === Phase.PLAYING) session.execute({ type: 'endTurn' });
    else if (phase === Phase.PARCHMENT) session.execute({ type: 'dismissParchment' });
    else if (phase === Phase.TURN_END && drawPile.length === 0) {
      session.execute({ type: 'endRound' });
    } else if (phase === Phase.ROUND_END) {
      // The last round cannot start a new one: it ends the game.
      session.execute({ type: 'startRound' });
      if (session.getState().phase === Phase.ROUND_END) session.execute({ type: 'endRound' });
    } else session.execute({ type: 'startTurn' });
  }
  expect(session.getState().phase).toBe(Phase.GAME_OVER);
}

describe('a whole campaign', () => {
  it('plays the rounds, scores the campaign and starts the expansion with its purge', () => {
    const session = GameSession.start('campaign', campaignCatalog(), DEFAULT_OPTIONS);
    expect(session.getState().discoverablePile).toEqual([13, 14]);

    playToGameOver(session);
    const types = session.getEvents().map(event => event.type);
    const parchments = types.flatMap((type, index) =>
      type === GameEventType.PARCHMENT_CARD_DISCOVERED ? [types[index + 1]] : [],
    );
    expect(parchments).toEqual([GameEventType.CARD_ACTION]);
    expect(Object.keys(session.getState().campaignScores)).toEqual(['base']);

    session.execute({ type: 'continueCampaign' });
    session.execute({ type: 'selectExpansion', name: 'missing' });
    expect(session.getState().activeExpansion).toBeUndefined();
    session.execute({ type: 'selectExpansion', name: 'ext' });
    const [candidate] = session.toView().purge?.candidates ?? [];
    expect(candidate).toBeDefined();

    session.execute({ type: 'selectPurgeCard', instanceId: candidate });
    session.execute({ type: 'selectPurgePermanent', instanceId: -1 });
    expect(session.getState().purgeState?.selectedCardIds).toEqual([candidate]);
    // A batch of one card at a time: each one is picked.
    for (let batch = 0; batch < 20 && !session.toView().purge?.isSelectionComplete; batch += 1) {
      const [next] = session.toView().purge?.candidates ?? [];
      session.execute({ type: 'selectPurgeCard', instanceId: next });
    }
    session.execute({ type: 'finalizePurge' });
    expect(session.getState().purgedCards.length).toBeGreaterThan(0);
    expect(session.getState().activeExpansion).toBe('ext');
  });
});
