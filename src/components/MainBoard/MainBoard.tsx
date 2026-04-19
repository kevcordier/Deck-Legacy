import { CardRow } from '@components/CardRow/CardRow';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { Section } from '@components/ui/Section/Section';
import { Phase } from '@engine/domain/types/Phase';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

export function MainBoard() {
  const { state, startTurn } = useGame();
  const { t } = useTranslation();
  return (
    <main className="scrollbar @container/main flex flex-1 flex-col gap-6 py-4">
      {state.phase === Phase.START_ROUND && (
        <EmptyState
          title={t('roundpreview.title', { round: state.round })}
          subtitle={t('roundpreview.subtitle')}
          action={
            <Button onClick={startTurn} color="primary" size="md">
              {t('roundpreview.start')}
            </Button>
          }
        >
          {state.lastAddedIds.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {state.lastAddedIds.map((id: number) => {
                const inst = state.instances[id];
                if (!inst) return null;
                return (
                  <div key={id} className="min-w-xs basis-1/4">
                    <GameCard instance={inst} />
                  </div>
                );
              })}
            </div>
          )}
        </EmptyState>
      )}

      {state.phase === Phase.PLAYING && state.board.length > 0 && (
        <Section
          title={t('sections.tableau')}
          subtitle={`${t('cardCount', { count: state.board.length })}`}
        >
          <CardRow
            cardIds={state.board}
            boardEffects={state.boardEffects}
            instances={state.instances}
          />
        </Section>
      )}

      {state.phase === Phase.PLAYING && state.permanents.length > 0 && (
        <Section
          title={t('sections.permanents')}
          subtitle={t('cardCount', { count: state.permanents.length })}
        >
          <CardRow
            cardIds={state.permanents}
            boardEffects={state.boardEffects}
            instances={state.instances}
          />
        </Section>
      )}
    </main>
  );
}
