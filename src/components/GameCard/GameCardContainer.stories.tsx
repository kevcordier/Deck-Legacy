import type { Meta, StoryObj } from '@storybook/react';
import { GameCard } from './GameCard';
import { loadCardDefs, loadStickerDefs } from '@engine/infrastructure/loaders';
import { createInstance } from '@engine/application/factory';
import type { CardInstance, Resources } from '@engine/domain/types';

type GameCardContainerProps = {
  id: number;
  cardId: number;
  stateId: number;
  instance: CardInstance;
  currentResources: Resources;
  isOnBoard: boolean;
  onActivate?: () => void;
  onAction?: (label: string) => void;
  onUpgrade?: (toStateId?: number) => void;
  onTrackStep?: (stepId: number) => void;
};

function GameCardContainer({
  id,
  cardId,
  stateId,
  currentResources,
  isOnBoard,
  onActivate,
  onAction,
  onUpgrade,
  onTrackStep,
}: GameCardContainerProps) {
  const defs = loadCardDefs();
  const stickerDefs = loadStickerDefs();

  const validCardId = defs[cardId] ? cardId : 1;
  const maxStateId = defs[validCardId]?.states.length ?? 0;
  const validStateId = stateId > 0 && stateId <= maxStateId ? stateId : 1;

  const instance = createInstance(id, validCardId, validStateId, defs);

  return GameCard({
    instance,
    defs,
    stickerDefs,
    currentResources,
    isOnBoard,
    onActivate,
    onAction,
    onUpgrade,
    onTrackStep,
  });
}

const meta: Meta<typeof GameCardContainer> = {
  title: 'Container/GameCard',
  component: GameCardContainer,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    id: { control: 'number' },
    cardId: { control: 'number' },
    stateId: { control: 'number' },
    currentResources: { control: 'object' },
    isOnBoard: { control: 'boolean' },
    onActivate: { action: 'activated' },
    onAction: { action: 'action' },
    onUpgrade: { action: 'upgrade' },
    onTrackStep: { action: 'trackStep' },
  },
};

export default meta;
type Story = StoryObj<typeof GameCardContainer>;

export const GameCardPreview: Story = {
  name: 'Game Card Preview',
  args: {
    id: 1,
    cardId: 1,
    stateId: 1,
    currentResources: { wood: 2, gold: 2, stone: 2, iron: 2, weapon: 2, goods: 2 },
    isOnBoard: true,
  },
};
