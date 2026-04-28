import { makeDefs, makeState, makeStickerDefs } from '../fixtures';
import { TurnEndedStrategy } from '@engine/application/gameEvent/TurnEndedStrategy';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('TurnEndedStrategy', () => {
  const strategy = new TurnEndedStrategy(makeDefs(), makeStickerDefs());

  it('sets phase to END_TURN', () => {
    const gs = makeState();
    const result = strategy.apply(gs);
    expect(result.phase).toBe(Phase.POSTTURN);
  });
});
