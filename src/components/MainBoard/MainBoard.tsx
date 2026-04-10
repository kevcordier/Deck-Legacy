import { CardRow } from '@components/CardRow/CardRow';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { GameCard } from '@components/GameCard/GameCard';
import { Section } from '@components/ui/Section/Section';
import { Button } from '@components/ui/Button/Button';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

export function MainBoard() {
  const { state, phase, startGame, startRound } = useGame();
  const { t } = useTranslation();
  return (
    <main className="scrollbar flex flex-1 flex-col gap-6 p-4">
      {phase === 'pregame' && (
        <EmptyState
          title={t('game.title')}
          subtitle={t('game.subtitle')}
          action={
            <Button onClick={startGame} color="primary" size="md">
              {t('pregame.startNew')}
            </Button>
          }
        />
      )}

      {phase === 'preround' && state.round === 0 && (
        <EmptyState
          title={t('pregame.readyToPlay')}
          subtitle={t('pregame.deckShuffled', { count: state.drawPile.length })}
          action={
            <Button onClick={startRound} color="primary" size="md">
              {t('pregame.startGame')}
            </Button>
          }
        />
      )}

      {phase === 'roundpreview' && (
        <EmptyState
          title={t('roundpreview.title', { round: state.round })}
          subtitle={t('roundpreview.subtitle')}
          action={
            <Button onClick={startRound} color="primary" size="md">
              {t('roundpreview.start')}
            </Button>
          }
        >
          {state.lastAddedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {state.lastAddedIds.map((id: number) => {
                const inst = state.instances[id];
                if (!inst) return null;
                return <GameCard key={id} instance={inst} />;
              })}
            </div>
          )}
        </EmptyState>
      )}

      {phase === 'playing' && state.board.length > 0 && (
        <Section
          title={t('sections.tableau')}
          subtitle={`${t('cardCount', { count: state.board.length })}`}
        >
          <CardRow
            cardIds={state.board}
            blockingCards={state.blockingCards}
            instances={state.instances}
          />
        </Section>
      )}

      {phase === 'playing' && state.permanents.length > 0 && (
        <Section
          title={t('sections.permanents')}
          subtitle={t('cardCount', { count: state.permanents.length })}
        >
          <CardRow
            cardIds={state.permanents}
            blockingCards={state.blockingCards}
            instances={state.instances}
          />
        </Section>
      )}
    </main>
  );
}
