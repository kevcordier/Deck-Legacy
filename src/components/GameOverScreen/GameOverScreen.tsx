import { Button } from '@components/ui/Button/Button';
import { GloryIcon } from '@components/ui/Icon/icon';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

export function GameOverScreen() {
  const { t } = useTranslation();
  const { state, score, startGame } = useGame();

  return (
    <div className="bg-background bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-card border-border animate-fade-in-scale flex flex-col items-center gap-6 rounded-lg border p-8">
        <div className="font-display text-base-primary text-3xl font-semibold tracking-tight">
          {t('gameOver.title')}
        </div>

        <div className="flex flex-col items-center gap-2">
          <GloryIcon className="size-12" color="#e8b85a" />
          <span className="font-display text-base-primary text-3xl font-semibold">{score}</span>
          <span className="font-display text-base-ink text-lg">{t('gameOver.glory')}</span>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-base-ink font-semibold">{state.round}</span>
            <span className="font-display text-base-ink/80">{t('gameOver.rounds')}</span>
          </div>
        </div>

        <Button onClick={startGame} color="base-primary" size="lg">
          {t('gameOver.newGame')}
        </Button>
      </div>
    </div>
  );
}
