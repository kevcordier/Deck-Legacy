import { useTranslation } from 'react-i18next';
import type {
  PendingChoice,
  CardDef,
  Resources,
  CardInstance,
  CardState,
  ResolvedAction,
  ResolvedCost,
  TriggerEntry,
} from '@engine/domain/types';
import { TriggerIcon } from '@components/ui/Icon/icon';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { GameCard } from '@components/GameCard/GameCard';
import { PendingChoiceType } from '@engine/domain/enums';
import { tCardName, tCardActionLabel } from '@helpers/cardI18n';
import { Modal } from '@components/ui/Modal/Modal';
import { Button } from '@components/ui/Button/Button';

function makePreviewInstance(def: CardDef, state: CardState): CardInstance {
  return {
    id: 0,
    cardId: def.id,
    stateId: state.id,
    stickers: {},
    trackProgress: [],
  };
}

interface PendingChoiceModalProps {
  choice?: PendingChoice;
  triggerPile?: Record<string, TriggerEntry> | null;
  defs: Record<number, CardDef>;
  instances: Record<number, CardInstance>;
  resolvePlayerChoice(option: ResolvedAction): void;
  resolvePayCost(resolved: ResolvedCost): void;
  onResolveTrigger(sourceInstanceId: number, actionId: string, triggerId: string): void;
  onSkipTrigger(uuid: string): void;
  onSkipChoice(uuid: string): void;
}

export function PendingChoiceModal({
  choice,
  triggerPile,
  defs,
  instances,
  resolvePlayerChoice,
  resolvePayCost,
  onResolveTrigger,
  onSkipTrigger,
  onSkipChoice,
}: PendingChoiceModalProps) {
  const { t } = useTranslation();

  let content;
  let title = '';
  let subtitle;
  // ── trigger_pile ───────────────────────────────────────────────────────
  if (triggerPile && Object.keys(triggerPile).length > 0) {
    title = t('triggerPile.title');
    subtitle = Object.keys(triggerPile).length > 1 ? t('triggerPile.subtitle') : null;
    content = (
      <div className="flex flex-col gap-4">
        {Object.entries(triggerPile).map(([triggerId, trigger]) => {
          const inst = instances[trigger.sourceInstanceId];
          const def = inst ? defs[inst.cardId] : undefined;
          const state = def?.states.find(s => s.id === inst?.stateId) ?? def?.states[0];
          const actionIdx =
            state?.cardEffects?.findIndex(e => e.label === trigger.effectDef.label) ?? -1;
          const cardName = tCardName(t, def?.id, state?.id, state?.name);
          const actionLabel = tCardActionLabel(
            t,
            def?.id,
            state?.id,
            actionIdx,
            trigger.effectDef.label,
          );
          return (
            <div
              key={triggerId}
              className="bg-card flex items-center justify-between gap-5 rounded border p-4"
            >
              <TriggerIcon
                className="size-8"
                color={trigger.effectDef.optional ? 'yellow' : 'red'}
              />
              <div className="flex-1">
                {cardName && (
                  <div className="font-display text-base-primary mb-1 text-sm font-semibold">
                    #{trigger.sourceInstanceId} {cardName}
                  </div>
                )}
                <div className="font-display text-base-ink text-xs">{actionLabel}</div>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  color="base-primary"
                  onClick={() =>
                    onResolveTrigger(trigger.sourceInstanceId, trigger.effectDef.label, triggerId)
                  }
                >
                  {t('triggerPile.resolve')}
                </Button>
                {trigger.effectDef.optional && (
                  <Button
                    size="sm"
                    variant="outlined"
                    color="base-ink"
                    onClick={() => onSkipTrigger(triggerId)}
                  >
                    {t('triggerPile.skip')}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── choose_card ──────────────────────────────────────────────────────
  if (choice && choice.type === PendingChoiceType.CHOOSE_CARD) {
    const handleCardClick = (instanceId: number) => {
      if (choice.kind === 'COST') {
        resolvePayCost({ resources: {}, discardedCardIds: [instanceId], destroyedCardIds: [] });
      } else {
        resolvePlayerChoice({
          id: choice.id,
          type: choice.kind,
          sourceInstanceId: choice.sourceInstanceId,
          instanceId,
        });
      }
    };

    title = t(`pendingChoice.chooseCard.${choice.kind}`, { count: choice.pickCount });

    content = (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {choice.choices.map(id => {
          if (typeof id !== 'number') return null;
          const inst = instances[id];
          const def = inst ? defs[inst.cardId] : undefined;
          if (!def || !inst) return null;
          const state = def.states.find(s => s.id === inst.stateId) ?? def.states[0];
          return (
            <div className="relative transition-transform hover:scale-[1.02]" key={id}>
              <div
                role="button"
                onClick={() => handleCardClick(id)}
                className="absolute inset-0 z-12 cursor-pointer!"
              ></div>
              <GameCard instance={makePreviewInstance(def, state)} hideStatePreview />
            </div>
          );
        })}
      </div>
    );
  }

  // ── choose_state ───────────────────────────────────────────────────────
  if (choice && choice.type === PendingChoiceType.CHOOSE_STATE) {
    const sourceInst = instances[choice.sourceInstanceId];
    const cardDef = sourceInst ? defs[sourceInst.cardId] : undefined;

    title = t(`pendingChoice.chooseState`);
    subtitle = t(`pendingChoice.chooseStateSubtitle`);
    content = (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {choice.choices.map(stateId => {
          if (typeof stateId !== 'number') return null;
          const state = cardDef?.states.find(s => s.id === stateId);
          if (!cardDef || !state) return null;
          return (
            <div key={stateId} className="relative transition-transform hover:scale-[1.02]">
              <div
                role="button"
                onClick={() =>
                  resolvePlayerChoice({
                    id: choice.id,
                    type: choice.kind,
                    sourceInstanceId: choice.sourceInstanceId,
                    stateId,
                  })
                }
                className="absolute inset-0 z-12 cursor-pointer!"
              ></div>
              <GameCard instance={makePreviewInstance(cardDef, state)} hideStatePreview />
            </div>
          );
        })}
      </div>
    );
  }

  // ── choose_resource ────────────────────────────────────────────────────
  if (choice && choice.type === PendingChoiceType.CHOOSE_RESOURCE) {
    const handleResourceSelect = (r: Resources) => {
      if (choice.kind === 'COST') {
        resolvePayCost({ resources: r, discardedCardIds: [], destroyedCardIds: [] });
      } else {
        resolvePlayerChoice({
          id: choice.id,
          type: choice.kind,
          sourceInstanceId: choice.sourceInstanceId,
          resources: r,
        });
      }
    };

    title = t(`pendingChoice.chooseResource`);
    subtitle = t(`pendingChoice.gainResource`);

    content = (
      <ResourceChoice
        options={choice.choices.filter(
          (c): c is Resources => typeof c !== 'number' && typeof c !== 'string',
        )}
        size="lg"
        onSelect={handleResourceSelect}
      />
    );
  }

  const onClose = choice?.isMandatory === false ? () => onSkipChoice(choice.id) : undefined;

  return (
    <Modal title={title} onClose={onClose} subtitle={subtitle}>
      {content}
    </Modal>
  );
}
