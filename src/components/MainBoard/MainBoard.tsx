import { CardRow } from '@components/CardRow/CardRow';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { MarkdownText } from '@components/ui/MarkdownText/MarckdownText';
import { Modal } from '@components/ui/Modal/Modal';
import { Section } from '@components/ui/Section/Section';
import { getActiveState } from '@engine/application/cardHelpers';
import { CardTag } from '@engine/domain/enums';
import { Phase } from '@engine/domain/types/Phase';
import { tCardName, tCardParchmentText } from '@helpers/cardI18n';
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
    <div className="flex w-full flex-row flex-wrap justify-center place-items-end-safe gap-2 lg:gap-4">
      {cardIds.map((id: number) => {
        const inst = gameState.instances[id];
        if (!inst) return null;
        const chooseStateIds = defs[inst.cardId].chooseState ?? [];

        if (chooseStateIds.length > 0) {
          return (
            <div
              key={id}
              className="flex min-w-0 basis-[calc(50%-0.25rem)] flex-col gap-1 lg:basis-[calc(33.333%-0.667rem)]"
            >
              <div className="mb-2 flex w-full flex-wrap gap-2">
                {chooseStateIds.map(stateId => {
                  const stateDef = defs[inst.cardId].states.find(s => s.id === stateId);
                  const isCurrent = inst.stateId === stateId;
                  return (
                    <Button
                      key={`${id}-${stateId}`}
                      color={isCurrent ? 'base-primary' : 'danger'}
                      size="sm"
                      className="flex-1"
                      onClick={() => chooseState(inst.id, stateId)}
                    >
                      {stateDef?.name
                        ? tCardName(t, stateDef.name)
                        : `${t('roundpreview.switchState')} ${stateId}`}
                    </Button>
                  );
                })}
              </div>
              <GameCard instance={inst} />
            </div>
          );
        }

        return (
          <div
            key={id}
            className="basis-[calc(50%-0.25rem)] lg:basis-[calc(33.333%-0.667rem)] max-w-80"
          >
            <GameCard instance={inst} />
          </div>
        );
      })}
    </div>
  );
}

export function MainBoard() {
  const {
    gameState,
    startTurn,
    endTurnVoluntary,
    startRound,
    chooseState,
    displayNewCards,
    setDisplayNewCards,
    defs,
    parchmentTextPending,
    dismissParchmentText,
  } = useGame();
  const { t } = useTranslation();

  const goals = gameState.permanents.filter(
    c => getActiveState(gameState.instances[c], defs)?.tags?.includes(CardTag.GOAL) ?? false,
  );
  const permanents = gameState.permanents.filter(c => !goals.includes(c));
  return (
    <main className="@container/main flex flex-1 flex-col gap-6 p-2 lg:p-4">
      {parchmentTextPending && (
        <div className="flex flex-col gap-4 p-4 bg-card rounded-lg">
          <MarkdownText text={tCardParchmentText(t, parchmentTextPending.id)} ink />
          <div className="flex justify-end">
            <Button color="base-primary" onClick={dismissParchmentText}>
              {t('parchmentCard.continue')}
            </Button>
          </div>
        </div>
      )}
      {gameState.phase === Phase.ROUND_START && (
        <EmptyState
          title={t('roundpreview.title', { round: gameState.round })}
          subtitle={t('roundpreview.subtitle')}
          action={
            <Button onClick={startTurn} color="primary" size="md">
              {t('roundpreview.start')}
            </Button>
          }
        >
          {gameState.lastAddedCards.length > 0 && (
            <NewCardSelection cardIds={gameState.lastAddedCards} chooseState={chooseState} />
          )}
        </EmptyState>
      )}

      {gameState.phase === Phase.TURN_END && gameState.drawPile.length > 0 && (
        <EmptyState
          title={t('endturn.title', { turn: gameState.turn + 1 })}
          action={
            <Button onClick={startTurn} color="primary" size="md">
              {t('endturn.start')}
            </Button>
          }
        />
      )}

      {(gameState.phase === Phase.ROUND_END ||
        (gameState.phase === Phase.TURN_END && gameState.drawPile.length === 0)) && (
        <EmptyState
          title={t('endround.title', { round: gameState.round })}
          action={
            <Button onClick={startRound} color="primary" size="md">
              {t('endround.end')}
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

      {gameState.phase === Phase.PLAYING && gameState.board.length === 0 && (
        <EmptyState
          title={t('endturn.title', { turn: gameState.turn + 1 })}
          action={
            <Button onClick={endTurnVoluntary} color="primary" size="md">
              {t('endturn.start')}
            </Button>
          }
        />
      )}

      {[Phase.PLAYING, Phase.TURN_END].includes(gameState.phase) && permanents.length > 0 && (
        <Section
          title={t('sections.permanents')}
          subtitle={t('cardCount', { count: permanents.length })}
        >
          <CardRow cardIds={permanents} />
        </Section>
      )}

      {[Phase.PLAYING, Phase.TURN_END].includes(gameState.phase) && goals.length > 0 && (
        <Section title={t('sections.goals')} subtitle={t('cardCount', { count: goals.length })}>
          <CardRow cardIds={goals} />
        </Section>
      )}

      {[Phase.PLAYING, Phase.TURN_END].includes(gameState.phase) &&
        Object.keys(gameState.triggerPile).length === 0 &&
        gameState.lastAddedCards.length > 0 &&
        displayNewCards && (
          <Modal
            title={t('cardAdded.title', { count: gameState.lastAddedCards.length })}
            onClose={() => setDisplayNewCards(false)}
            className="min-w-4xl"
          >
            <NewCardSelection cardIds={gameState.lastAddedCards} chooseState={chooseState} />
          </Modal>
        )}
    </main>
  );
}
