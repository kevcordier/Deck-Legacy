import { Modal } from '@components/ui/Modal/Modal';
import { StickerDisplay } from '@components/ui/StickerDisplay/StickerDisplay';
import { Text } from '@components/ui/Text/Text';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export function StickerStockModal() {
  const { t } = useTranslation();
  const { stickerStockOpen, setStickerStockOpen } = useGameUI();
  const { stickerDefs, gameState } = useGame();

  if (!stickerStockOpen) return null;

  const entries = Object.values(stickerDefs)
    .filter(
      sticker =>
        !(sticker.additionalGlory && !sticker.production && !sticker.glory && !sticker.effectId),
    )
    .sort((a, b) => a.id - b.id);

  return (
    <Modal title={t('stickerStock.title')} onClose={() => setStickerStockOpen(false)}>
      <View className="flex-row flex-wrap gap-3">
        {entries.map(sticker => {
          const count = gameState.stickerStock[sticker.id] ?? 0;
          return (
            <View
              key={sticker.id}
              className={`border-border items-center gap-1 rounded-lg border px-3 py-2 ${count === 0 ? 'opacity-40' : ''}`}
            >
              <StickerDisplay sticker={sticker} />
              <Text className="font-display text-sm">
                {count === 0 ? t('stickerStock.outOfStock') : t('stickerStock.count', { count })}
              </Text>
            </View>
          );
        })}
      </View>
    </Modal>
  );
}
