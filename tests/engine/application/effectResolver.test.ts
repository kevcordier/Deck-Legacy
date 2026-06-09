import { makeInstance, makeState, makeStickerDefs } from './fixtures';
import {
  countValuePerElement,
  getPickNumbers,
  resolveActionEffect,
} from '@engine/application/effectResolver';
import { ActionEffectType, PassiveType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef, RemovedResourceScope, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const simpleDef: CardDef = { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] };
const defs: Record<number, CardDef> = { 1: simpleDef };
const stickerDefs: Record<number, Sticker> = makeStickerDefs();

describe('getPickNumbers', () => {
  it('prioritizes pickMin over pickNumber when both are provided', () => {
    const picks = getPickNumbers({ pickMin: 2, pickNumber: 3, pickMax: 4 }, 10);
    expect(picks).toEqual({ pickMin: 2, pickMax: 4 });
  });

  it('keeps default pickMin when only pickMax is provided', () => {
    const picks = getPickNumbers({ pickMax: 2 }, 10);
    expect(picks).toEqual({ pickMin: 1, pickMax: 2 });
  });
});

// ─── CHOOSE_EFFECT ────────────────────────────────────────────────────────────

describe('resolveActionEffect – CHOOSE_EFFECT', () => {
  it('creates a choose_action_effect pending choice with the provided sub-effects', () => {
    const subEffect = { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } };
    const effect = {
      id: 1,
      type: ActionEffectType.CHOOSE_EFFECT,
      effects: [subEffect],
    };
    const [, pending] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_action_effect');
    expect(pending[0].choices).toEqual([subEffect]);
    expect(pending[0].pickMax).toBe(1);
    expect(pending[0].isMandatory).toBe(true);
  });
});

// ─── ADD_RESOURCES ────────────────────────────────────────────────────────────

describe('resolveActionEffect – ADD_RESOURCES', () => {
  it('resolves fixed resource', () => {
    const effect = { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 3 } };
    const [resolved, pending] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(resolved.resources).toEqual({ gold: 3 });
    expect(pending).toHaveLength(0);
  });

  it('creates pending choice for multi-option resource', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { choice: [{ gold: 1 }, { wood: 1 }] },
    };
    const [, pending] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_resource');
  });

  it('expands choice.any into concrete resource options', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { choice: [{ any: 1 }] },
    };
    const [, pending] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);

    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_resource');
    expect(pending[0].choices).toContainEqual({ gold: 1 });
    expect(pending[0].choices).toContainEqual({ wood: 1 });
    expect(pending[0].choices).toContainEqual({ stone: 1 });
    expect(pending[0].choices).toContainEqual({ iron: 1 });
    expect(pending[0].choices).toContainEqual({ weapon: 1 });
    expect(pending[0].choices).toContainEqual({ goods: 1 });
  });

  it('expands choice.any while preserving fixed resources', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { choice: [{ gold: 1, any: 2 }] },
    };
    const [, pending] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);

    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_resource');
    expect(pending[0].choices).toContainEqual({ gold: 3 });
    expect(pending[0].choices).toContainEqual({ gold: 1, wood: 2 });
  });

  it('resolves resource from single card selection', () => {
    const defProd: CardDef = {
      id: 2,
      name: 'P',
      states: [{ id: 1, name: 'S', productions: [{ gold: 2 }] }],
    };
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { cards: { scope: [TargetScope.BOARD] } },
    };
    const [resolved, pending] = resolveActionEffect(effect, 99, gs, { 2: defProd }, stickerDefs);
    expect(resolved.resources).toEqual({ gold: 2 });
    expect(pending).toHaveLength(0);
  });

  it('creates pending card choice when multiple cards produce resources', () => {
    const defProd: CardDef = {
      id: 2,
      name: 'P',
      states: [{ id: 1, name: 'S', productions: [{ gold: 2 }] }],
    };
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { cards: { scope: [TargetScope.BOARD] } },
    };
    const [, pending] = resolveActionEffect(effect, 99, gs, { 2: defProd }, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_card');
  });

  it('sets empty resources when card selection finds no cards', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { cards: { scope: [TargetScope.BOARD] } },
    };
    const [resolved] = resolveActionEffect(effect, 99, makeState(), defs, stickerDefs);
    expect(resolved.resources).toEqual({});
  });

  it('creates pending CHOOSE_RESOURCE when card has multiple production alternatives', () => {
    const multiProdDef: CardDef = {
      id: 2,
      name: 'M',
      states: [{ id: 1, name: 'S', productions: [{ gold: 1 }, { wood: 1 }] }],
    };
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { cards: { scope: [TargetScope.BOARD] } },
    };
    const [, pending] = resolveActionEffect(effect, 99, gs, { 2: multiProdDef }, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_resource');
    expect(pending[0].choices).toHaveLength(2);
  });
});

// ─── DISCARD_CARD / DESTROY_CARD ──────────────────────────────────────────────

describe('resolveActionEffect – DISCARD_CARD', () => {
  it('creates pending choice for multiple candidates', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const effect = {
      id: 1,
      type: ActionEffectType.DISCARD_CARD,
      cards: { scope: [TargetScope.BOARD] },
    };
    const [, pending] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_card');
  });

  it('sets instanceIds to undefined when no candidates', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.DISCARD_CARD,
      cards: { scope: [TargetScope.BOARD] },
    };
    const [resolved] = resolveActionEffect(effect, 99, makeState(), defs, stickerDefs);
    expect(resolved.instanceIds?.length).toBe(undefined);
  });
});

describe('resolveActionEffect – DESTROY_CARD', () => {
  it('excludes cards protected by CANT_BE_DESTROYED from selectable choices', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [2, 3],
      instances: { 2: inst2, 3: inst3 },
      boardEffects: {
        2: [{ id: 'cant-destroy', type: PassiveType.CANT_BE_DESTROYED }],
      },
    });
    const effect = {
      id: 1,
      type: ActionEffectType.DESTROY_CARD,
      cards: { scope: [TargetScope.BOARD] },
    };

    const [, pending] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_card');
    expect(pending[0].choices).toEqual([3]);
  });
});

// ─── SELF and TOP_OF_DECK scopes ─────────────────────────────────────────────

describe('resolveActionEffect – SELF / TOP_OF_DECK scopes', () => {
  it('auto-selects self without pending choice', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [5], instances: { 5: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.DISCARD_CARD,
      cards: { scope: [TargetScope.SELF] },
    };
    const [resolved, pending] = resolveActionEffect(effect, 5, gs, defs, stickerDefs);
    expect(resolved.instanceIds).toEqual([5]);
    expect(pending).toHaveLength(0);
  });

  it('auto-selects top of deck without pending choice', () => {
    const inst = makeInstance({ id: 7, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [7], instances: { 7: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.DISCARD_CARD,
      cards: { scope: [TargetScope.TOP_OF_DECK] },
    };
    const [resolved, pending] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(resolved.instanceIds).toEqual([7]);
    expect(pending).toHaveLength(0);
  });
  it('auto-selects the last selected cards without pending choice', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.DISCARD_CARD,
      cards: { scope: [TargetScope.LAST_SELECTED] },
    };
    const [resolved, pending] = resolveActionEffect(effect, 99, makeState(), defs, stickerDefs, {
      isMandatory: false,
      parentActionId: undefined,
      lastSelectedIds: [2, 3],
    });
    expect(resolved.instanceIds).toEqual([2, 3]);
    expect(pending).toHaveLength(0);
  });
});

// ─── pickNumber / all candidates ──────────────────────────────────────────────

describe('resolveActionEffect – pickNumber', () => {
  it('creates pending with custom pickNumber from pickNumber', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3, 4], instances: { 2: inst2, 3: inst3, 4: inst4 } });
    const effect = {
      id: 1,
      type: ActionEffectType.DISCARD_CARD,
      cards: { scope: [TargetScope.BOARD], pickNumber: 2 },
    };
    const [, pending] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].pickMax).toBe(2);
  });
});

// ─── DISCOVER_CARD ────────────────────────────────────────────────────────────

describe('resolveActionEffect – DISCOVER_CARD', () => {
  it('forces DISCOVERY scope', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const gs = makeState({ discoveryPile: [5], instances: { 5: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.DISCOVER_CARD,
      cards: {},
    };
    const [resolved] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(resolved.instanceIds).toEqual([5]);
  });

  it('does not force DISCOVERY scope if a different scope is specified', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 6, cardId: 1, stateId: 1 });
    const gs = makeState({ discoveryPile: [5, 6], instances: { 5: inst, 6: inst2 } });
    const effect = {
      id: 1,
      type: ActionEffectType.DISCOVER_CARD,
      cards: { scope: [TargetScope.TOP_OF_DISCOVERY], pickNumber: 2 },
    };
    const [resolved] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(resolved.instanceIds).toEqual([5, 6]);
  });
});

// ─── ADD_STICKER ──────────────────────────────────────────────────────────────

describe('resolveActionEffect – ADD_STICKER', () => {
  it('auto-resolves single sticker id', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      stickers: { ids: [3], pickNumber: 1 },
    };
    const gs = makeState({ stickerStock: { 3: 2 } });
    const [resolved, pending] = resolveActionEffect(effect, 1, gs, defs, stickerDefs);
    expect(resolved.stickerIds).toEqual([3]);
    expect(pending).toHaveLength(0);
  });

  it('filters out stickers with no remaining stock', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      stickers: { ids: [3], pickNumber: 1 },
    };
    const gs = makeState({ stickerStock: { 3: 0 } });
    const [, pending] = resolveActionEffect(effect, 1, gs, defs, stickerDefs);
    expect(pending).toHaveLength(0);
  });

  it('creates pending choice for multiple sticker ids', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      stickers: { ids: [3, 5], pickNumber: 1 },
    };
    const gs = makeState({ stickerStock: { 3: 2, 5: 1 } });
    const [, pending] = resolveActionEffect(effect, 1, gs, defs, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_sticker');
  });

  it('marks action as unresolvable when pickMin exceeds available stickers', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      stickers: { ids: [3], pickMin: 2, pickMax: 2 },
    };
    const gs = makeState({ stickerStock: { 3: 1 } });

    const [resolved, pending] = resolveActionEffect(effect, 1, gs, defs, stickerDefs);

    expect(resolved.unresolvable).toBe(true);
    expect(pending).toHaveLength(0);
  });

  it('handles missing stickers.ids by resolving with an empty stickerIds array', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      stickers: { pickNumber: 1 },
    };
    const [resolved, pending] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);

    expect(resolved.stickerIds).toEqual([]);
    expect(pending).toHaveLength(0);
  });

  it('treats absent sticker stock entries as zero', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      stickers: { ids: [77], pickNumber: 1 },
    };
    const [resolved, pending] = resolveActionEffect(
      effect,
      1,
      makeState({ stickerStock: {} }),
      defs,
      stickerDefs,
    );

    expect(resolved.stickerIds).toEqual([]);
    expect(pending).toHaveLength(0);
  });
});

describe('resolveActionEffect – BOOST_CARD selector enrichment', () => {
  it('enriches selector with produces and keeps only cards that can produce', () => {
    const producerDef: CardDef = {
      id: 2,
      name: 'Producer',
      states: [{ id: 1, name: 'S', productions: [{ gold: 1 }] }],
    };
    const plainDef: CardDef = {
      id: 3,
      name: 'Plain',
      states: [{ id: 1, name: 'S' }],
    };
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 3, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });

    const effect = {
      id: 1,
      type: ActionEffectType.BOOST_CARD,
      cards: { scope: [TargetScope.BOARD] },
    };

    const [resolved, pending] = resolveActionEffect(
      effect,
      99,
      gs,
      { ...defs, 2: producerDef, 3: plainDef },
      stickerDefs,
    );

    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_card');
    expect(pending[0].choices).toEqual([2]);
  });
});

describe('resolveActionEffect – UPGRADE_CARD selector enrichment', () => {
  it('adds BOARD and UPGRADABLE scopes when SELF is not present', () => {
    const upgradableDef: CardDef = {
      id: 2,
      name: 'U',
      states: [
        { id: 1, name: 'Base', upgrade: [{ upgradeTo: 2, cost: {} }] },
        { id: 2, name: 'Upgraded' },
      ],
    };
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst2 } });
    const effect = {
      id: 1,
      type: ActionEffectType.UPGRADE_CARD,
      cards: {},
    };

    const [resolved, pending] = resolveActionEffect(
      effect,
      99,
      gs,
      { ...defs, 2: upgradableDef },
      stickerDefs,
    );

    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_card');
    expect(pending[0].choices).toEqual([2]);
  });

  it('does not force UPGRADABLE when explicit ids are provided', () => {
    const nonUpgradableDef: CardDef = {
      id: 2,
      name: 'Forced',
      states: [
        { id: 1, name: 'Base' },
        { id: 2, name: 'Transformed' },
      ],
    };
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst2 } });
    const effect = {
      id: 1,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { ids: [2] },
      states: { ids: [2] },
    };

    const [resolved, pending] = resolveActionEffect(
      effect,
      99,
      gs,
      { ...defs, 2: nonUpgradableDef },
      stickerDefs,
    );

    expect(resolved.instanceIds).toEqual([2]);
    expect(resolved.stateId).toBe(2);
    expect(pending).toHaveLength(0);
  });

  it('auto-selects target state when upgrade has a single upgradeTo', () => {
    const upgradableDef: CardDef = {
      id: 2,
      name: 'U',
      states: [
        { id: 1, name: 'Base', upgrade: [{ upgradeTo: 2, cost: {} }] },
        { id: 2, name: 'Upgraded' },
      ],
    };
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst2 } });
    const effect = {
      id: 1,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
    };

    const [resolved, pending] = resolveActionEffect(
      effect,
      2,
      gs,
      { ...defs, 2: upgradableDef },
      stickerDefs,
    );

    expect(resolved.instanceIds).toEqual([2]);
    expect(resolved.stateId).toBe(2);
    expect(pending).toHaveLength(0);
  });

  it('creates choose_state pending choice when multiple upgradeTo are available', () => {
    const upgradableDef: CardDef = {
      id: 2,
      name: 'U',
      states: [
        {
          id: 1,
          name: 'Base',
          upgrade: [
            { upgradeTo: 2, cost: {} },
            { upgradeTo: 3, cost: {} },
          ],
        },
        { id: 2, name: 'Upgraded A' },
        { id: 3, name: 'Upgraded B' },
      ],
    };
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst2 } });
    const effect = {
      id: 1,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
    };

    const [resolved, pending] = resolveActionEffect(
      effect,
      2,
      gs,
      { ...defs, 2: upgradableDef },
      stickerDefs,
    );

    expect(resolved.instanceIds).toEqual([2]);
    expect(resolved.stateId).toBeUndefined();
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_state');
    expect(pending[0].choices).toEqual([2, 3]);
    expect(pending[0].targetInstanceId).toBe(2);
  });
});

// ─── ADD_STICKER – production cap ────────────────────────────────────────────

describe('resolveActionEffect – ADD_STICKER production cap', () => {
  const highProdDef: CardDef = {
    id: 10,
    name: 'High',
    states: [{ id: 1, name: 'S', productions: [{ gold: 9 }] }],
  };

  it('excludes card with total production >= 9 from card target choices', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      cards: { scope: [TargetScope.BOARD] },
      stickers: { ids: [3], pickNumber: 1 },
    };
    const inst = makeInstance({ id: 2, cardId: 10, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst }, stickerStock: { 3: 5 } });
    const [resolved, pending] = resolveActionEffect(
      effect,
      1,
      gs,
      { ...defs, 10: highProdDef },
      stickerDefs,
    );
    expect(resolved.instanceIds?.length).toBe(undefined);
    expect(pending).toHaveLength(0);
  });
});

// ─── CHOOSE_STATE ─────────────────────────────────────────────────────────────

describe('resolveActionEffect – CHOOSE_STATE', () => {
  it('auto-resolves single state', () => {
    const effect = { id: 1, type: ActionEffectType.CHOOSE_STATE, states: { ids: [2] } };
    const [resolved, pending] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(resolved.stateId).toBe(2);
    expect(pending).toHaveLength(0);
  });

  it('creates pending choice for multiple states', () => {
    const effect = { id: 1, type: ActionEffectType.CHOOSE_STATE, states: { ids: [1, 2, 3] } };
    const [, pending] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_state');
  });
});

// ─── ADD_BOARD_EFFECT ─────────────────────────────────────────────────────────

describe('resolveActionEffect – ADD_BOARD_EFFECT', () => {
  it('attaches effect to resolved action', () => {
    const passive = { id: 'block', type: 'BLOCK' as never };
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_BOARD_EFFECT,
      effect: passive,
    };
    const [resolved] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(resolved.effect).toBe(passive);
  });
});

describe('resolveActionEffect – REMOVE_RESOURCE_ON_CARD', () => {
  it('copies resourceScopes to resolved action', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      resourceScopes: ['production'] as RemovedResourceScope[],
    };
    const [resolved] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(resolved.resourceScopes).toEqual(['production']);
  });

  it('filters CHOOSE_CARD choices to cards with effective production', () => {
    const noProdDef: CardDef = {
      id: 10,
      name: 'NoProd',
      states: [{ id: 1, name: 'S' }],
    };
    const goldProdDef: CardDef = {
      id: 11,
      name: 'GoldProd',
      states: [{ id: 1, name: 'S', productions: [{ gold: 1 }] }],
    };
    const sourceDef: CardDef = {
      id: 12,
      name: 'Source',
      states: [{ id: 1, name: 'S' }],
    };

    const noProd = makeInstance({ id: 100, cardId: 10, stateId: 1 });
    const goldProd = makeInstance({ id: 110, cardId: 11, stateId: 1 });
    const source = makeInstance({ id: 120, cardId: 12, stateId: 1 });

    const gs = makeState({
      board: [100, 110, 120],
      instances: { 100: noProd, 110: goldProd, 120: source },
    });

    const effect = {
      id: 1,
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      cards: {
        scope: [TargetScope.BOARD],
        produces: [
          ResourceType.GOLD,
          ResourceType.WOOD,
          ResourceType.STONE,
          ResourceType.IRON,
          ResourceType.WEAPON,
          ResourceType.GOODS,
        ],
        pickNumber: 1,
      },
      resources: {
        choice: [{ any: 1 }],
      },
    };

    const [, pending] = resolveActionEffect(
      effect,
      120,
      gs,
      { 10: noProdDef, 11: goldProdDef, 12: sourceDef },
      stickerDefs,
    );

    const chooseCard = pending.find(choice => choice.type === 'choose_card');
    expect(chooseCard?.choices).toEqual([110]);
  });

  it('keeps cards with upgrade costs even without production when scope is upgradeCost', () => {
    const noProdUpgradableDef: CardDef = {
      id: 20,
      name: 'UpgradableNoProd',
      states: [
        {
          id: 1,
          name: 'S',
          upgrade: [{ cost: { resources: [{ gold: 1 }] }, upgradeTo: 2 }],
        },
        { id: 2, name: 'S2' },
      ],
    };
    const sourceDef: CardDef = {
      id: 21,
      name: 'Source',
      states: [{ id: 1, name: 'S' }],
    };

    const target = makeInstance({ id: 200, cardId: 20, stateId: 1 });
    const source = makeInstance({ id: 210, cardId: 21, stateId: 1 });

    const gs = makeState({
      board: [200, 210],
      instances: { 200: target, 210: source },
    });

    const effect = {
      id: 1,
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      cards: {
        scope: [TargetScope.BOARD, TargetScope.UPGRADABLE],
      },
      resources: {
        choice: [{ any: 1 }],
      },
      resourceScopes: ['upgradeCost'] as RemovedResourceScope[],
    };

    const [, pending] = resolveActionEffect(
      effect,
      210,
      gs,
      { 20: noProdUpgradableDef, 21: sourceDef },
      stickerDefs,
    );

    const chooseCard = pending.find(choice => choice.type === 'choose_card');
    expect(chooseCard?.choices).toEqual([200]);
  });
});

describe('resolveActionEffect – SHUFFLE_DECK', () => {
  it('copies deck target to resolved action', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.SHUFFLE_DECK,
      deck: 'discard' as const,
    };
    const [resolved] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(resolved.deck).toBe('discard');
  });
});

// ─── TRACK_ADVANCE ────────────────────────────────────────────────────────────

describe('resolveActionEffect – TRACK_ADVANCE', () => {
  it('returns early when no target cards', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.BOARD] },
    };
    const [resolved, pending] = resolveActionEffect(effect, 99, makeState(), defs, stickerDefs);
    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toHaveLength(0);
  });

  it('auto-selects next step for inOrder track', () => {
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1, trackProgress: [1] });
    const defTrack: CardDef = {
      id: 2,
      name: 'T',
      states: [
        {
          id: 1,
          name: 'S',
          track: {
            inOrder: true,
            steps: [
              { id: 1 },
              { id: 2, effects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES }] },
            ],
          },
        },
      ],
    };
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.BOARD] },
    };
    const [resolved, pending] = resolveActionEffect(effect, 99, gs, { 2: defTrack }, stickerDefs);
    expect(resolved.stepIds).toEqual([2]);
    expect(resolved.instanceIds).toEqual([2]);
    expect(pending).toHaveLength(0);
  });

  it('creates pending step choice for non-inOrder track', () => {
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defTrack: CardDef = {
      id: 2,
      name: 'T',
      states: [
        {
          id: 1,
          name: 'S',
          track: { inOrder: false, steps: [{ id: 1 }, { id: 2 }] },
        },
      ],
    };
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.BOARD] },
    };
    const [, pending] = resolveActionEffect(effect, 99, gs, { 2: defTrack }, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_step');
  });

  it('returns early when no track on state', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.BOARD] },
    };
    const [resolved, pending] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(resolved.instanceIds).toEqual([2]);
    expect(pending).toHaveLength(0);
  });

  it('returns early when all steps are complete', () => {
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1, trackProgress: [1, 2] });
    const defTrack: CardDef = {
      id: 2,
      name: 'T',
      states: [{ id: 1, name: 'S', track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }] } }],
    };
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.BOARD] },
    };
    const [resolved] = resolveActionEffect(effect, 99, gs, { 2: defTrack }, stickerDefs);
    expect(resolved.stepIds).toBeUndefined();
  });

  it('sets newActionEffects to [] and picks first step when multiple available in inOrder track without effects', () => {
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defTrack: CardDef = {
      id: 2,
      name: 'T',
      states: [{ id: 1, name: 'S', track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }] } }],
    };
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.BOARD] },
    };
    const [resolved] = resolveActionEffect(effect, 99, gs, { 2: defTrack }, stickerDefs);
    expect(resolved.stepIds).toEqual([1]);
    expect(resolved.newActionEffects).toEqual([]);
  });

  it('derives pickNumber/pickMin/pickMax from valuePerElement for TRACK_ADVANCE', () => {
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 2, stateId: 1 });
    const defTrack: CardDef = {
      id: 2,
      name: 'T',
      states: [
        {
          id: 1,
          name: 'S',
          track: { inOrder: false, steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
        },
      ],
    };
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const effect = {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.BOARD] },
      valuePerElement: {
        amount: 1,
        cards: { scope: [TargetScope.BOARD] },
      },
    };
    const [, pending] = resolveActionEffect(effect, 99, gs, { 2: defTrack }, stickerDefs);
    expect(pending).toHaveLength(1);
    expect(pending[0].pickMin).toBe(2);
    expect(pending[0].pickMax).toBe(2);
  });
});

// ─── valuePerElement ──────────────────────────────────────────────────────────

describe('resolveActionEffect – valuePerElement', () => {
  it('resolves resource from card count', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      valuePerElement: {
        amount: 2,
        resource: ['gold' as never],
        cards: { scope: [TargetScope.BOARD] },
      },
    };
    const [resolved] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(resolved.value).toBe(2);
  });

  it('resolves resource from accumulation', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: 3 });
    const gs = makeState({ instances: { 1: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      valuePerElement: { amount: 1, resource: ['wood' as never], accumulation: true },
    };
    const [resolved] = resolveActionEffect(effect, 1, gs, defs, stickerDefs);
    expect(resolved.value).toBe(3);
  });

  it('returns early when count is 0', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      valuePerElement: {
        amount: 2,
        resource: ['gold' as never],
        cards: { scope: [TargetScope.BOARD] },
      },
    };
    const [resolved, pending] = resolveActionEffect(effect, 99, makeState(), defs, stickerDefs);
    expect(resolved.resources).toBeUndefined();
    expect(pending).toHaveLength(0);
  });

  it('creates multiple pending choices for multi-resource valuePerElement', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      valuePerElement: {
        amount: 1,
        resource: ['gold' as never, 'wood' as never],
        cards: { scope: [TargetScope.BOARD] },
      },
    };
    const [resolved, pending] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(pending).toHaveLength(0);
    expect(resolved.value).toBe(2);
  });

  it('resolves resource from productionTotal', () => {
    const woodProducerDef: CardDef = {
      id: 2,
      name: 'WoodProducer',
      states: [{ id: 1, name: 'S', productions: [{ wood: 3 }] }],
    };
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst2 } });
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      valuePerElement: {
        amount: 1,
        resource: ['gold' as never],
        productionTotal: 'wood' as never,
      },
    };
    const [resolved] = resolveActionEffect(effect, 99, gs, { 2: woodProducerDef }, stickerDefs);
    expect(resolved.value).toBe(3);
  });

  it('returns 0 for productionTotal when a production does not include the key', () => {
    const mixedProducerDef: CardDef = {
      id: 2,
      name: 'MixedProducer',
      states: [{ id: 1, name: 'S', productions: [{ wood: 2 }, { gold: 1 }] }],
    };
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst2 } });
    const result = countValuePerElement(
      { amount: 1, productionTotal: 'wood' as never },
      gs,
      99,
      { 2: mixedProducerDef },
      stickerDefs,
    );
    expect(result).toBe(2);
  });

  it('returns 0 for accumulation when instance has no cumulated map', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = countValuePerElement(
      { amount: 1, accumulation: true },
      gs,
      1,
      defs,
      stickerDefs,
    );
    expect(result).toBe(0);
  });

  it('returns 0 when valuePerElement has no cards, accumulation, or productionTotal', () => {
    const result = countValuePerElement({ amount: 1 }, makeState(), 1, defs, stickerDefs);
    expect(result).toBe(0);
  });
});

// ─── accumulated ──────────────────────────────────────────────────────────────

describe('resolveActionEffect – accumulated', () => {
  it('passes value through to resolved action', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.ADD_CUMULATED,
      value: 1,
    };
    const [resolved] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(resolved.value).toEqual(1);
  });

  it('keeps value when set to 0', () => {
    const effect = {
      id: 1,
      type: ActionEffectType.SET_CUMULATED,
      value: 0,
    };
    const [resolved] = resolveActionEffect(effect, 1, makeState(), defs, stickerDefs);
    expect(resolved.value).toBe(0);
  });
});

// ─── position ─────────────────────────────────────────────────────────────────

describe('resolveActionEffect – position', () => {
  it('passes position through to resolved action', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const effect = {
      id: 1,
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      cards: { scope: [TargetScope.BOARD] },
      deck: 'draw' as const,
      position: 'top' as const,
    };
    const [resolved] = resolveActionEffect(effect, 99, gs, defs, stickerDefs);
    expect(resolved.position).toEqual('top');
  });
});

describe('countValuePerElement – deficitTarget', () => {
  it('returns deficitTarget minus count when count is less than deficitTarget', () => {
    const result = countValuePerElement(
      { amount: 1, deficitTarget: 5 },
      makeState(),
      1,
      defs,
      stickerDefs,
    );
    expect(result).toBe(5);
  });

  it('returns 0 when count equals deficitTarget', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: 3 });
    const result = countValuePerElement(
      { amount: 1, accumulation: true, deficitTarget: 3 },
      makeState({ instances: { 1: inst } }),
      1,
      defs,
      stickerDefs,
    );
    expect(result).toBe(0);
  });

  it('returns 0 when count exceeds deficitTarget', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: 10 });
    const result = countValuePerElement(
      { amount: 1, accumulation: true, deficitTarget: 3 },
      makeState({ instances: { 1: inst } }),
      1,
      defs,
      stickerDefs,
    );
    expect(result).toBe(0);
  });
});
