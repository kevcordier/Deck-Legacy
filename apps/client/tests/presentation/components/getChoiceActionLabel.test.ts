import { getChoiceActionLabel } from '@components/PendingChoiceModal/getChoiceActionLabel';
import { ActionEffectType, PendingChoiceType } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import type { PendingChoice } from '@deck-legacy/engine/domain/types';
import { cardTexts } from '@deck-legacy/game-data';
import { catalog } from '@infrastructure/catalog/catalog';
import i18next from 'i18next';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native-svg', () => import('../svgMock'));
vi.mock('@components/ui/Icon/SvgIcon', () => ({ SvgIcon: () => null }));

describe('getChoiceActionLabel', () => {
  it('uses the label of the pending effect, not of the whole action (card 16, effect 2)', async () => {
    const i18n = i18next.createInstance();
    await i18n.init({ lng: 'fr', resources: { fr: { cards: cardTexts.fr } } });
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
