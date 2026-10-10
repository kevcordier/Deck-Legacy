import { getStoryCatalog, makeInstance } from './storyCatalog';
import { GameCard } from '@components/GameCard/GameCard';
import { Grid } from '@components/ui/Grid/Grid';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@deck-legacy/engine/application/emptyState';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';
import type { Meta, StoryObj } from '@storybook/react-native';

type GameCardContainerProps = {
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
    instanceId: { control: 'number', min: 1, max: 120 },
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

    const validCardId =
      [
        ...catalog.deck,
        ...Object.values(catalog.expansions).flatMap(expansion => expansion.deck),
      ].find(({ id }) => id === instanceId)?.cardId ?? 1;
    const def = defs[validCardId];
    const instance = makeInstance({
      id: instanceId,
      cardId: validCardId,
      stateId: 1,
      stickers,
      trackProgress,
      cumulated,
      glories,
    });

    return (
      <GameProvider
        key={JSON.stringify({
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
