import { GameCard } from '@components/GameCard/GameCard';
import ScoreTooltip from '@components/Tooltips/ScoreTooltip';
import { Button } from '@components/ui/Button/Button';
import { Glory } from '@components/ui/Glory/Glory';
import { Modal } from '@components/ui/Modal/Modal';
import { Tooltip } from '@components/ui/Tooltip/Tooltip';
import { useGame } from '@hooks/useGame';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type GameOverScreenProps = {
  readonly score: number;
  readonly onStartNewGame: () => void;
  readonly onContinueCampaign?: () => void;
  readonly canContinueCampaign?: boolean;
};

export function GameOverScreen({
  score,
  onStartNewGame,
  onContinueCampaign,
  canContinueCampaign = false,
}: GameOverScreenProps) {
  const { t } = useTranslation();
  const { gameState } = useGame();
  const [kingdomOpen, setKingdomOpen] = useState(false);
  const kingdomCards = Object.values(gameState.instances)
    .filter(({ id }) =>
      [
        ...gameState.discardPile,
        ...gameState.permanents,
        ...gameState.board,
        ...gameState.drawPile,
      ].includes(id),
    )
    .sort((a, b) => a.id - b.id);

  return (
    <>
      <div className="bg-background bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-card border-border animate-fade-in-scale flex max-w-xl flex-col items-center gap-6 rounded-lg border p-8">
          <div className="font-display text-base-primary text-3xl font-semibold tracking-tight">
            {t('gameOver.title')}
          </div>

          <div className="flex flex-col items-center gap-2">
            <Tooltip
              position="bottom"
              content={<ScoreTooltip />}
              className="items-center justify-center"
            >
              <Glory glory={score} className="size-20 text-2xl" />
            </Tooltip>
            <span className="font-display text-base-ink text-lg">{t('gameOver.glory')}</span>
          </div>

          <div className="flex flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-0.5">
              <Button onClick={() => setKingdomOpen(true)} color="base-primary" size="md">
                {t('gameOver.viewKingdom')}
              </Button>
            </div>
          </div>

          <span className="text-base-ink">{t('gameOver.descriptionEndGame')}</span>

          <div className="flex flex-col items-center justify-center gap-2">
            <Button onClick={onStartNewGame} color="base-primary" size="md">
              {t('gameOver.newGame')}
            </Button>

            {onContinueCampaign && (
              <Button onClick={onContinueCampaign} color="base-primary" size="md">
                {canContinueCampaign ? t('gameOver.continueCampaign') : t('gameOver.saveScore')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {kingdomOpen && (
        <Modal
          title={t('gameOver.kingdomTitle')}
          subtitle={t('deckViewer.modalSubtitle', { count: kingdomCards.length })}
          onClose={() => setKingdomOpen(false)}
          label="game-over-kingdom"
        >
          {kingdomCards.length === 0 ? (
            <p className="text-sm italic text-ink/50">{t('gameOver.kingdomEmpty')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {kingdomCards.map(inst => (
                <div className="@container min-w-60" key={inst.id}>
                  <GameCard instance={inst} />
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
