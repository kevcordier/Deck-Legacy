import { GameBoard } from '@components/GameBoard/GameBoard';
import { Header } from '@components/Header/Header';
import { OptionsModal } from '@components/OptionsModal/OptionsModal';
import { ParchmentModal } from '@components/ParchmentModal/ParchmentModal';
import { PendingChoiceModal } from '@components/PendingChoiceModal/PendingChoiceModal';
import { ResourceBar } from '@components/ResourceBar/ResourceBar';
import { RulesModal } from '@components/RulesModal/RulesModal';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';

export function Game() {
  const {
    state: gs,
    defs,
    stickerDefs,
    pendingChoices,
    triggerPile,
    phase,
    deleteSave,
    resolveAction,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
    skipChoice,
    parchmentTextPending,
    dismissParchmentText,
  } = useGame();

  const { setOptionsOpen, setRulesOpen, optionsOpen, rulesOpen } = useGameUI();

  return (
    <div className="z-1 flex h-screen flex-col">
      <Header />

      {phase !== 'pregame' && <ResourceBar />}

      <GameBoard />

      {parchmentTextPending && (
        <ParchmentModal def={parchmentTextPending} onContinue={dismissParchmentText} />
      )}

      {((pendingChoices && pendingChoices.length > 0) ||
        (triggerPile && Object.keys(triggerPile).length > 0)) && (
        <PendingChoiceModal
          choice={pendingChoices?.[0]}
          triggerPile={triggerPile}
          defs={defs}
          instances={gs.instances}
          stickerDefs={stickerDefs}
          resolvePlayerChoice={resolvePlayerChoice}
          resolvePayCost={resolvePayCost}
          onResolveTrigger={resolveAction}
          onSkipTrigger={skipTrigger}
          onSkipChoice={skipChoice}
        />
      )}

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}

      {optionsOpen && (
        <OptionsModal
          onClose={() => setOptionsOpen(false)}
          onReset={() => {
            deleteSave();
          }}
        />
      )}
    </div>
  );
}
