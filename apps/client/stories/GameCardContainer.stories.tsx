import { getStoryCatalog, makeInstance } from './storyCatalog';
import { GameCard } from '@components/GameCard/GameCard';
import { Grid } from '@components/ui/Grid/Grid';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/emptyState';
import type { ExpansionDeckEntry } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';
import { baseCampaignNames } from '@deck-legacy/game-data';
import type { Meta, StoryObj } from '@storybook/react-native';

const BASE_GAME = 'Base game';

/** `expansion`: the expansion that brings the deck (absent for the base game and its campaigns). */
type StoryDeck = { deck: ExpansionDeckEntry[]; expansion?: string };

/** Decks per option: the base game, its mini campaigns, then the expansions. */
const decks: Record<string, StoryDeck> = {
  [BASE_GAME]: { deck: [...getStoryCatalog().campaign, ...getStoryCatalog().discoverable] },
  ...Object.fromEntries(
    Object.entries(getStoryCatalog().expansions)
      .map(([name, config]) => {
        const isCampaign = baseCampaignNames.includes(name);
        const deck = [...config.campaign, ...(config.discoverable ?? [])];
        return [
          `${isCampaign ? 'Campaign' : 'Expansion'}: ${name}`,
          { deck, expansion: config.expansion },
          isCampaign,
        ] as const;
      })
      .sort(([, , a], [, , b]) => Number(b) - Number(a))
      .map(([label, config]) => [label, config]),
  ),
};

type GameCardContainerProps = {
  expansion: string;
  instanceId: number;
  stickers: Record<number, number[]>;
  trackProgress: number[];
  glories: number[];
  cumulated: number;
  wood: number;
  gold: number;
  stone: number;
  iron: number;
  weapon: number;
  goods: number;
  isOnBoard: boolean;
  isBlocked: boolean;
};

const meta: Meta<GameCardContainerProps> = {
  title: 'Components/GameCard',
  argTypes: {
    expansion: { control: 'select', options: Object.keys(decks) },
    instanceId: { control: { type: 'number', min: 1, max: 120 } },
    wood: { control: 'number' },
    gold: { control: 'number' },
    stone: { control: 'number' },
    iron: { control: 'number' },
    weapon: { control: 'number' },
    goods: { control: 'number' },
    isOnBoard: { control: 'boolean' },
    isBlocked: { control: 'boolean' },
  },
  render: ({
    expansion,
    instanceId,
    stickers = {},
    trackProgress = [],
    glories = [],
    cumulated = 0,
    isOnBoard,
    isBlocked,
    wood,
    gold,
    stone,
    iron,
    weapon,
    goods,
    ...props
  }) => {
    const catalog = getStoryCatalog();
    const defs = catalog.cards;

    // `instanceId` is the number printed on the card; one outside the deck shows its first card.
    const { deck, expansion: cardExpansion } = decks[expansion] ?? decks[BASE_GAME];
    const entry = deck.find(({ id, number }) => (number ?? id) === instanceId) ?? deck[0];
    const validCardId = entry.cardId;
    const def = defs[validCardId];
    const instance = makeInstance({
      id: entry.id,
      cardId: validCardId,
      expansion: cardExpansion,
      expansionId: cardExpansion ? (entry.number ?? entry.id) : undefined,
      stateId: 1,
      stickers,
      trackProgress,
      cumulated,
      glories,
    });

    return (
      <GameProvider
        key={JSON.stringify({
          expansion,
          instanceId,
          isOnBoard,
          isBlocked,
          wood,
          gold,
          stone,
          iron,
          weapon,
          goods,
        })}
        initialState={{
          ...EMPTY_STATE,
          resources: { wood, gold, stone, iron, weapon, goods },
          boardEffects: isBlocked
            ? { [1]: [{ ...CardPassives.block_card, cards: { ids: [instance.id] } }] }
            : {},
          instances: { [instance.id]: instance },
        }}
      >
        <Grid minItemWidth={200} maxColumns={def.states.length} gap={12}>
          {def.states.map(state => (
            <GameCard
              key={`game-card-${instance.id}-${state.id}`}
              {...props}
              instance={{ ...instance, stateId: state.id }}
              isOnBoard={isOnBoard}
            />
          ))}
        </Grid>
      </GameProvider>
    );
  },
};

export default meta;
type Story = StoryObj<GameCardContainerProps>;

export const GameCardPreview: Story = {
  args: {
    expansion: BASE_GAME,
    instanceId: 1,
    stickers: {},
    trackProgress: [],
    glories: [],
    cumulated: 0,
    wood: 2,
    gold: 2,
    stone: 2,
    iron: 2,
    weapon: 2,
    goods: 2,
    isOnBoard: true,
    isBlocked: false,
  },
};
