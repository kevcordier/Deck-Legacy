import { DEFAULT_OPTIONS, makeCatalog } from './fixtures';
import { GameSession } from '@engine/application/session/GameSession';
import { ActionEffectType, TargetScope } from '@engine/domain/enums';
import type { GameCatalog } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const STARTS_IN_PLAY = 17;
const BOTTOM_OF_DECK = 18;

function catalog(): GameCatalog {
  const base = makeCatalog();
  return {
    ...base,
    stickerStock: { ...base.stickerStock, [STARTS_IN_PLAY]: 1, [BOTTOM_OF_DECK]: 1 },
    stickers: {
      ...base.stickers,
      [STARTS_IN_PLAY]: { id: STARTS_IN_PLAY, effectId: 'starts_in_play' },
      [BOTTOM_OF_DECK]: {
        id: BOTTOM_OF_DECK,
        action: {
          id: 'sticker-18',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLACE_CARD_IN_PILE,
              cards: { scope: [TargetScope.SELF] },
              deck: 'draw',
              position: 'bottom',
            },
          ],
        },
      },
    },
  };
}

/** Board 1, 5, 9 and 10, then 2, 3, 4, 6, 7, 8 in the deck. */
function tutorial() {
  return GameSession.start(
    'tuto',
    catalog(),
    { ...DEFAULT_OPTIONS, allowCheats: true },
    'tutorial',
    [1, 5, 9, 10, 2, 3, 4, 6, 7, 8],
  );
}

describe('sticker effects', () => {
  it('uses the action a sticker gives the card', () => {
    const session = tutorial();
    session.execute({
      type: 'cheat',
      cheat: { op: 'addSticker', instanceId: 5, stickerId: BOTTOM_OF_DECK },
    });

    session.execute({ type: 'resolveAction', instanceId: 5, actionId: 'sticker-18' });

    const state = session.getState();
    expect(state.board).not.toContain(5);
    expect(state.drawPile.at(-1)).toBe(5);
  });

  it('starts each round with a "starts in play" card in play', () => {
    const session = tutorial();
    session.execute({
      type: 'cheat',
      cheat: { op: 'addSticker', instanceId: 8, stickerId: STARTS_IN_PLAY },
    });
    session.execute({ type: 'cheat', cheat: { op: 'discardCard', instanceIds: [8] } });
    // Play out the round: the first draw of the next round brings the card in play.
    for (let i = 0; i < 10 && session.getState().round === 1; i++) {
      session.execute({ type: 'endTurn' });
    }
    session.execute({ type: 'startTurn' });

    const state = session.getState();
    expect(state.round).toBe(2);
    expect(state.turn).toBe(1);
    expect(state.board).toContain(8);
    expect(state.board).toHaveLength(5);
  });
});
