import { useGame } from '@hooks/useGame';
import { ResourceBar } from '@components/ResourceBar/ResourceBar';
import { PendingChoiceModal } from '@components/PendingChoiceModal/PendingChoiceModal';
import { OptionsModal } from '@components/OptionsModal/OptionsModal';
import { RulesModal } from '@components/RulesModal/RulesModal';
import { Header } from '@components/Header/Header';
import { useGameUI } from '@hooks/useGameInterface';
import { GameBoard } from '@components/GameBoard/GameBoard';

export function Game() {
  const {
    state: gs,
    defs,
    pendingChoices,
    triggerPile,
    phase,
    deleteSave,
    resolveAction,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
    skipChoice,
  } = useGame();

  const { setOptionsOpen, setRulesOpen, optionsOpen, rulesOpen } = useGameUI();

  return (
    <div className="z-1 flex h-screen flex-col">
      <Header />

      {phase !== 'pregame' && <ResourceBar />}

      <GameBoard />

      {((pendingChoices && pendingChoices.length > 0) ||
        (triggerPile && Object.keys(triggerPile).length > 0)) && (
        <PendingChoiceModal
          choice={pendingChoices?.[0]}
          triggerPile={triggerPile}
          defs={defs}
          instances={gs.instances}
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
