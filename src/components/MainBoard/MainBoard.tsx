import { CardRow } from '@components/CardRow/CardRow';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { Section } from '@components/ui/Section/Section';
import { getAffectedCardsByBoardEffects } from '@engine/application/cardHelpers';
import { PassiveType } from '@engine/domain/enums';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTranslation } from 'react-i18next';

export function MainBoard() {
  const { state, phase, startGame, startTurn } = useGame();
  const { setRulesOpen } = useGameUI();
  const { t } = useTranslation();
  return (
    <main className="scrollbar @container/main flex flex-1 flex-col gap-6 py-4">
      {phase === 'pregame' && (
        <EmptyState
          title={t('game.title')}
          subtitle={t('game.subtitle')}
          action={
            <Button onClick={startGame} color="primary" size="md">
              {t('pregame.startNew')}
            </Button>
          }
        >
          <Button variant="text" color="ink" size="sm" onClick={() => setRulesOpen(true)}>
            {t('pregame.viewRules')}
          </Button>
        </EmptyState>
      )}

      {phase === 'roundpreview' && (
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

      {phase === 'playing' && state.board.length > 0 && (
        <Section
          title={t('sections.tableau')}
          subtitle={`${t('cardCount', { count: state.board.length })}`}
        >
          <CardRow
            cardIds={state.board}
            blockedCards={Object.fromEntries(
              Object.entries(getAffectedCardsByBoardEffects(state, PassiveType.BLOCK)).flatMap(
                ([blockerId, blockedIds]) => blockedIds.map(blockedId => [blockedId, blockerId]),
              ) as [number, number][],
            )}
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
            blockedCards={Object.fromEntries(
              Object.entries(getAffectedCardsByBoardEffects(state, PassiveType.BLOCK)).flatMap(
                ([blockerId, blockedIds]) => blockedIds.map(blockedId => [blockedId, blockerId]),
              ) as [number, number][],
            )}
            instances={state.instances}
          />
        </Section>
      )}
    </main>
  );
}
