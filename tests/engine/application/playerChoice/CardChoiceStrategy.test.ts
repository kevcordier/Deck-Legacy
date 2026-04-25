import { makeInstance, makeState } from '../fixtures';
import { CardChoiceStrategy } from '@engine/application/playerChoice/CardChoiceStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import type { CardDef, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const goldDef: CardDef = {
  id: 1,
  name: 'G',
  states: [{ id: 1, name: 'S', productions: [{ gold: 2 }] }],
};
const multiProdDef: CardDef = {
  id: 2,
  name: 'M',
  // Two separate production options → triggers choose_resource for ADD_RESOURCES
  states: [{ id: 1, name: 'S', productions: [{ gold: 1 }, { wood: 1 }] }],
};
const multiKeyProdDef: CardDef = {
  id: 4,
  name: 'MK',
  // Single production with multiple resource keys → two sticker candidates for BOOST_CARD
  states: [{ id: 1, name: 'S', productions: [{ gold: 1, wood: 1 }] }],
};
const noProdDef: CardDef = { id: 3, name: 'N', states: [{ id: 1, name: 'S' }] };

const goldSticker: Sticker = {
  id: 10,
  description: 'Gold boost',
  type: 'add',
  production: 'gold',
  glory: 0,
};
const woodSticker: Sticker = {
  id: 11,
  description: 'Wood boost',
  type: 'add',
  production: 'wood',
  glory: 0,
};

const pending = (id = 'p1') => ({
  id,
  type: 'choose_card' as never,
  sourceInstanceId: 99,
  kind: ActionEffectType.ADD_RESOURCES,
  choices: [],
  pickCount: 1,
  isMandatory: true,
});

describe('CardChoiceStrategy – ADD_RESOURCES', () => {
  it('resolves resource from single production card', () => {
    const defs = { 1: goldDef };
    const strategy = new CardChoiceStrategy(defs, {});
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const choice = {
      id: 'r1',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 99,
      instanceIds: [1],
    };
    const resolved = { id: 'r1', type: ActionEffectType.ADD_RESOURCES, sourceInstanceId: 99 };
    const [merged, remaining] = strategy.apply(choice, resolved, gs, [pending()]);
    expect(merged.resources).toEqual({ gold: 2 });
    expect(remaining).toHaveLength(0);
  });

  it('adds pending CHOOSE_RESOURCE for multi-production card', () => {
    const defs = { 2: multiProdDef };
    const strategy = new CardChoiceStrategy(defs, {});
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ instances: { 2: inst } });
    const choice = {
      id: 'r1',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 99,
      instanceIds: [2],
    };
    const resolved = { id: 'r1', type: ActionEffectType.ADD_RESOURCES, sourceInstanceId: 99 };
    const [, remaining] = strategy.apply(choice, resolved, gs, [pending()]);
    expect(remaining.some(r => r.type === 'choose_resource')).toBe(true);
  });

  it('handles card with no productions', () => {
    const defs = { 3: noProdDef };
    const strategy = new CardChoiceStrategy(defs, {});
    const inst = makeInstance({ id: 3, cardId: 3, stateId: 1 });
    const gs = makeState({ instances: { 3: inst } });
    const choice = {
      id: 'r1',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 99,
      instanceIds: [3],
    };
    const resolved = { id: 'r1', type: ActionEffectType.ADD_RESOURCES, sourceInstanceId: 99 };
    const [merged, remaining] = strategy.apply(choice, resolved, gs, [pending()]);
    expect(merged.resources).toBeUndefined();
    expect(remaining).toHaveLength(0);
  });
});

describe('CardChoiceStrategy – BOOST_CARD', () => {
  it('resolves single sticker from production', () => {
    const defs = { 1: goldDef };
    const stickerDefs = { 10: goldSticker };
    const strategy = new CardChoiceStrategy(defs, stickerDefs);
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst }, stickerStock: { 10: 2 } });
    const choice = {
      id: 'r1',
      type: ActionEffectType.BOOST_CARD,
      sourceInstanceId: 99,
      instanceIds: [1],
    };
    const resolved = { id: 'r1', type: ActionEffectType.BOOST_CARD, sourceInstanceId: 99 };
    const [merged, remaining] = strategy.apply(choice, resolved, gs, [pending()]);
    expect(merged.stickerId).toBe(10);
    expect(remaining).toHaveLength(0);
  });

  it('adds pending CHOOSE_STICKER when multiple sticker options exist', () => {
    const defs = { 4: multiKeyProdDef };
    const stickerDefs = { 10: goldSticker, 11: woodSticker };
    const strategy = new CardChoiceStrategy(defs, stickerDefs);
    const inst = makeInstance({ id: 4, cardId: 4, stateId: 1 });
    const gs = makeState({ instances: { 4: inst }, stickerStock: { 10: 1, 11: 1 } });
    const choice = {
      id: 'r1',
      type: ActionEffectType.BOOST_CARD,
      sourceInstanceId: 99,
      instanceIds: [4],
    };
    const resolved = { id: 'r1', type: ActionEffectType.BOOST_CARD, sourceInstanceId: 99 };
    const [, remaining] = strategy.apply(choice, resolved, gs, [pending()]);
    expect(remaining.some(r => r.type === 'choose_sticker')).toBe(true);
  });

  it('handles card with no productions for boost', () => {
    const defs = { 3: noProdDef };
    const strategy = new CardChoiceStrategy(defs, {});
    const inst = makeInstance({ id: 3, cardId: 3, stateId: 1 });
    const gs = makeState({ instances: { 3: inst } });
    const choice = {
      id: 'r1',
      type: ActionEffectType.BOOST_CARD,
      sourceInstanceId: 99,
      instanceIds: [3],
    };
    const resolved = { id: 'r1', type: ActionEffectType.BOOST_CARD, sourceInstanceId: 99 };
    const [merged, remaining] = strategy.apply(choice, resolved, gs, [pending()]);
    expect(merged.stickerId).toBeUndefined();
    expect(remaining).toHaveLength(0);
  });

  it('filters stickers with 0 stock', () => {
    const defs = { 1: goldDef };
    const stickerDefs = { 10: goldSticker };
    const strategy = new CardChoiceStrategy(defs, stickerDefs);
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst }, stickerStock: { 10: 0 } });
    const choice = {
      id: 'r1',
      type: ActionEffectType.BOOST_CARD,
      sourceInstanceId: 99,
      instanceIds: [1],
    };
    const resolved = { id: 'r1', type: ActionEffectType.BOOST_CARD, sourceInstanceId: 99 };
    const [merged] = strategy.apply(choice, resolved, gs, [pending()]);
    expect(merged.stickerId).toBeUndefined();
  });
});

describe('CardChoiceStrategy – other action types', () => {
  it('sets instanceIds from choice for non-resource/boost types', () => {
    const defs = { 1: noProdDef };
    const strategy = new CardChoiceStrategy(defs, {});
    const inst = makeInstance({ id: 7, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 7: inst } });
    const choice = {
      id: 'r1',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 99,
      instanceIds: [7],
    };
    const resolved = { id: 'r1', type: ActionEffectType.DISCARD_CARD, sourceInstanceId: 99 };
    const [merged, remaining] = strategy.apply(choice, resolved, gs, [pending()]);
    expect(merged.instanceIds).toEqual([7]);
    expect(remaining).toHaveLength(0);
  });

  it('handles empty instanceIds in choice', () => {
    const strategy = new CardChoiceStrategy({}, {});
    const choice = {
      id: 'r1',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 99,
      instanceIds: [],
    };
    const resolved = { id: 'r1', type: ActionEffectType.DISCARD_CARD, sourceInstanceId: 99 };
    const [merged, remaining] = strategy.apply(choice, resolved, makeState(), [pending()]);
    expect(merged).toBe(resolved);
    expect(remaining).toHaveLength(0);
  });
});
