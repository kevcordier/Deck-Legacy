import { CardUpgradeFlip } from './CardUpgradeFlip';
import { useViewerCardWidth } from '@components/CardViewerModal/useViewerCardWidth';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const cardWidth = useViewerCardWidth(true);
  return (
    <Modal onClose={onClose} label="card-upgraded" bare>
      <Text className="text-card font-body-bold text-center uppercase">
        {t('cardUpgraded.title')}
      </Text>
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
