import { CardRow } from './CardRow';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import { createInstance } from '@engine/application/factory';
import { PassiveType } from '@engine/domain/enums';
import { loadCardDefs } from '@engine/infrastructure/loaders';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CardRow> = {
  title: 'Components/CardRow',
  component: CardRow,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <GameProvider initialState={EMPTY_STATE}>
        <Story />
      </GameProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardRow>;

function makeInstances(cardIds: number[]) {
  const defs = loadCardDefs();
  return Object.fromEntries(
    cardIds.map((id, i) => {
      const inst = createInstance(i + 1, id, 1, defs);
      return [inst.id, inst];
    }),
  );
}

export const SingleCard: Story = {
  args: (() => {
    const instances = makeInstances([1]);
    const ids = Object.keys(instances).map(Number);
    return { cardIds: ids, boardEffects: {}, instances };
  })(),
};

export const MultipleCards: Story = {
  args: (() => {
    const instances = makeInstances([1, 2, 3]);
    const ids = Object.keys(instances).map(Number);
    return { cardIds: ids, boardEffects: {}, instances };
  })(),
};

export const WithBlockingCard: Story = {
  args: (() => {
    const defs = loadCardDefs();
    const blocked = createInstance(1, 1, 1, defs);
    const blocker = createInstance(2, 2, 1, defs);
    const instances = { [blocked.id]: blocked, [blocker.id]: blocker };
    return {
      cardIds: [blocked.id, blocker.id],
      boardEffects: {
        [blocker.id]: [{ id: 'block', type: PassiveType.BLOCK, cards: { ids: [blocked.id] } }],
      },
      instances,
    };
  })(),
};
