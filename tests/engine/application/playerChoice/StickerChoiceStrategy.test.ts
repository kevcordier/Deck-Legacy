import { makeState } from '../fixtures';
import { StickerChoiceStrategy } from '@engine/application/playerChoice/StickerChoiceStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('StickerChoiceStrategy', () => {
  const strategy = new StickerChoiceStrategy();

  const baseResolved = {
    id: 'r1',
    type: ActionEffectType.ADD_STICKER,
    sourceInstanceId: 1,
  };
  const pendingChoice = {
    id: 'p1',
    type: 'choose_sticker' as never,
    sourceInstanceId: 1,
    kind: ActionEffectType.ADD_STICKER,
    choices: [3, 5],
    pickMin: 1,
    pickMax: 1,
    isMandatory: true,
  };

  it('copies chosen stickerId into merged resolved action', () => {
    const choice = { ...baseResolved, stickerIds: [5] };
    const [merged, remaining] = strategy.apply(choice, baseResolved, makeState(), [pendingChoice]);
    expect(merged.stickerIds).toEqual([5]);
    expect(remaining).toHaveLength(0);
  });

  it('removes first pending choice from list', () => {
    const choice = { ...baseResolved, stickerIds: [3] };
    const extra = { ...pendingChoice, id: 'p2' };
    const [, remaining] = strategy.apply(choice, baseResolved, makeState(), [pendingChoice, extra]);
    expect(remaining).toHaveLength(1);
  });
});
