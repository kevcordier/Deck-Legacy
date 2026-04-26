import { CardRow } from '@components/CardRow/CardRow';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { Section } from '@components/ui/Section/Section';
import { Phase } from '@engine/domain/types/Phase';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

export function MainBoard() {
  const { state, startTurn, startRound, defs, chooseState } = useGame();
  const { t } = useTranslation();
  return (
    <main className="scrollbar @container/main flex flex-1 flex-col gap-6 p-4">
      {state.phase === Phase.PREROUND && (
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
            <div className="flex flex-wrap justify-center gap-4">
              {state.lastAddedIds.map((id: number) => {
                const inst = state.instances[id];
                if (!inst) return null;

                if (defs[inst.cardId].chooseState) {
                  return (
                    <div key={id} className="min-w-xs basis-1/4 gap-1 flex flex-col">
                      <Button
                        color="danger"
                        size="md"
                        className="mb-2 w-full"
                        onClick={() => chooseState(inst.id, inst.stateId === 1 ? 2 : 1)}
                      >
                        {t('roundpreview.switchState')}
                      </Button>
                      <GameCard instance={inst} />
                    </div>
                  );
                }

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

      {state.phase === Phase.PRETURN && (
        <EmptyState
          title={t('endturn.title', { turn: state.turn + 1 })}
          action={
            <Button onClick={startTurn} color="primary" size="md">
              {t('endturn.start')}
            </Button>
          }
        />
      )}

      {state.phase === Phase.PLAYING && state.board.length > 0 && (
        <Section
          title={t('sections.tableau')}
          subtitle={`${t('cardCount', { count: state.board.length })}`}
        >
          <CardRow cardIds={state.board} />
        </Section>
      )}

      {state.phase === Phase.PLAYING && state.permanents.length > 0 && (
        <Section
          title={t('sections.permanents')}
          subtitle={t('cardCount', { count: state.permanents.length })}
        >
          <CardRow cardIds={state.permanents} />
        </Section>
      )}
    </main>
  );
}
