import { getChoiceActionLabel } from '@components/PendingChoiceModal/shared';
import cardsFr from '@data/locales/cards.fr.json';
import { createInstance } from '@deck-legacy/engine/application/factory';
import { ActionEffectType, PendingChoiceType } from '@deck-legacy/engine/domain/enums';
import type { PendingChoice } from '@deck-legacy/engine/domain/types';
import { catalog } from '@helpers/catalog';
import i18next from 'i18next';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@components/ui/Icon/icon', () => import('../helpers/iconMock'));

describe('getChoiceActionLabel', () => {
  it('uses the label of the pending effect, not of the whole action (card 16, effect 2)', async () => {
    const i18n = i18next.createInstance();
    await i18n.init({ lng: 'fr', resources: { fr: { cards: cardsFr } } });
    const instance = createInstance(16, 16, 1, catalog.cards);
    const choice = {
      id: '16-2',
      actionId: '16-1-1',
      effectId: 2,
      kind: ActionEffectType.BOOST_CARD,
      type: PendingChoiceType.CHOOSE_CARD,
      sourceInstanceId: 16,
      choices: [],
    } as unknown as PendingChoice;

    expect(getChoiceActionLabel(choice, { 16: instance }, catalog.cards, i18n.t).value).toBe(
      "Booster la production d'un bâtiment",
    );
  });
});
