import { makeDefs, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { AdvanceStrategy } from '@engine/application/gameEvent/AdvanceStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { AdvanceEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('AdvanceStrategy', () => {
  const strategy = new AdvanceStrategy(makeDefs(), makeStickerDefs());

  it('draws turnCards from drawPile to board', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [1, 2], instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.ADVANCE,
      timestamp: 0,
      turnCards: [1],
    } as AdvanceEvent);
    expect(result.board).toContain(1);
    expect(result.drawPile).not.toContain(1);
  });
});
