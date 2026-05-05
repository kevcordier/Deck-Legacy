import { Modal } from '@components/ui/Modal/Modal';
import { StickerDisplay } from '@components/ui/StickerDisplay/StickerDisplay';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTranslation } from 'react-i18next';

export function StickerStockModal() {
  const { t } = useTranslation();
  const { stickerStockOpen, setStickerStockOpen } = useGameUI();
  const { stickerDefs, gameState } = useGame();

  if (!stickerStockOpen) return null;

  const entries = Object.values(stickerDefs).sort((a, b) => a.id - b.id);

  return (
    <Modal title={t('stickerStock.title')} onClose={() => setStickerStockOpen(false)}>
      <div className="flex flex-wrap gap-3">
        {entries.map(sticker => {
          const count = gameState.stickerStock[sticker.id] ?? 0;
          return (
            <div
              key={sticker.id}
              className={`border-border flex flex-col items-center gap-1 rounded-lg border px-3 py-2 ${count === 0 ? 'opacity-40' : ''}`}
            >
              <StickerDisplay sticker={sticker} size="md" />
              <span className="font-display text-sm">
                {count === 0 ? t('stickerStock.outOfStock') : t('stickerStock.count', { count })}
              </span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
