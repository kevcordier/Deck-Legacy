import { CardUpgradeFlip } from './CardUpgradeFlip';
import { useViewerCardWidth } from '@components/CardViewerModal/useViewerCardWidth';
import { Modal } from '@components/ui/Modal/Modal';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { View } from 'react-native';

type CardUpgradeRevealProps = {
  readonly before: CardInstance;
  readonly after: CardInstance;
  readonly onClose: () => void;
};

/**
 * Shows an upgraded card in large, in a modal (upgrades that do not end the turn).
 * A tap anywhere closes it (also during the animation).
 */
export function CardUpgradeReveal({ before, after, onClose }: CardUpgradeRevealProps) {
  const cardWidth = useViewerCardWidth();
  return (
    <Modal onClose={onClose} label="card-upgraded" bare>
      <View className="items-center">
        <CardUpgradeFlip
          before={before}
          after={after}
          width={cardWidth}
          size="lg"
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}
