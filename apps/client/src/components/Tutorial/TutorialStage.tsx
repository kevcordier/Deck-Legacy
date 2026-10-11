import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { DeckCardGrid } from '@components/DeckViewer/DeckViewer';
import { Modal } from '@components/ui/Modal/Modal';
import { TUTORIAL_DRAW_ORDER } from '@contexts/TutorialContext';
import { useGame } from '@hooks/useGame';
import { useTutorial } from '@hooks/useTutorial';
import { useTranslation } from 'react-i18next';

const STARTING_DECK = [...TUTORIAL_DRAW_ORDER].sort((a, b) => a - b);
const NOOP = () => {};

/** What the current tutorial step shows on top of the board: the starting deck or a card in large. */
export function TutorialStage() {
  const { run, steps, stepIndex, nextStep } = useTutorial();
  const { gameState } = useGame();
  const { t } = useTranslation();
  const step = run ? steps[stepIndex] : undefined;

  if (step?.showStartingDeck) {
    return (
      <Modal
        title={t('deckViewer.title')}
        subtitle={t('deckViewer.modalSubtitle', { count: STARTING_DECK.length })}
        onClose={nextStep}
        label="starting-deck"
      >
        <DeckCardGrid cards={STARTING_DECK.map(id => gameState.instances[id]).filter(Boolean)} />
      </Modal>
    );
  }

  if (step?.zoomCardId !== undefined) {
    // The step decides when the card goes away: closing it does nothing.
    return (
      <CardViewerModal
        key={step.zoomCardId}
        cardIds={[step.zoomCardId]}
        initialId={step.zoomCardId}
        onClose={NOOP}
      />
    );
  }

  return null;
}
