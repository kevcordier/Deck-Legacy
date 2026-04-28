import { CardRow } from '@components/CardRow/CardRow';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { Modal } from '@components/ui/Modal/Modal';
import { Section } from '@components/ui/Section/Section';
import { Phase } from '@engine/domain/types/Phase';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

function NewCardSelection({
  cardIds,
  chooseState,
}: {
  readonly cardIds: number[];
  readonly chooseState: (id: number, stateId: number) => void;
}) {
  const { gameState, defs } = useGame();
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {cardIds.map((id: number) => {
        const inst = gameState.instances[id];
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
  );
}

export function MainBoard() {
  const { gameState, startTurn, startRound, chooseState, displayNewCards, setDisplayNewCards } =
    useGame();
  const { t } = useTranslation();
  return (
    <main className="scrollbar @container/main flex flex-1 flex-col gap-6 p-4">
      {gameState.phase === Phase.PREROUND && (
        <EmptyState
          title={t('roundpreview.title', { round: gameState.round + 1 })}
          subtitle={t('roundpreview.subtitle')}
          action={
            <Button onClick={startRound} color="primary" size="md">
              {t('roundpreview.start')}
            </Button>
          }
        >
          {gameState.lastAddedCards.length > 0 && (
            <NewCardSelection cardIds={gameState.lastAddedCards} chooseState={chooseState} />
          )}
        </EmptyState>
      )}

      {(gameState.phase === Phase.PRETURN || gameState.phase === Phase.POSTTURN) && (
        <EmptyState
          title={t('endturn.title', { turn: gameState.turn + 1 })}
          action={
            <Button onClick={startTurn} color="primary" size="md">
              {t('endturn.start')}
            </Button>
          }
        />
      )}

      {gameState.phase === Phase.PLAYING && gameState.board.length > 0 && (
        <Section
          title={t('sections.tableau')}
          subtitle={`${t('cardCount', { count: gameState.board.length })}`}
        >
          <CardRow cardIds={gameState.board} />
        </Section>
      )}

      {gameState.phase === Phase.PLAYING && gameState.permanents.length > 0 && (
        <Section
          title={t('sections.permanents')}
          subtitle={t('cardCount', { count: gameState.permanents.length })}
        >
          <CardRow cardIds={gameState.permanents} />
        </Section>
      )}

      {gameState.phase === Phase.PLAYING &&
        Object.keys(gameState.triggerPile).length === 0 &&
        gameState.lastAddedCards.length > 0 &&
        displayNewCards && (
          <Modal
            title={t('cardAdded.title', { count: gameState.lastAddedCards.length })}
            onClose={() => setDisplayNewCards(false)}
          >
            <NewCardSelection cardIds={gameState.lastAddedCards} chooseState={chooseState} />
          </Modal>
        )}
    </main>
  );
}
