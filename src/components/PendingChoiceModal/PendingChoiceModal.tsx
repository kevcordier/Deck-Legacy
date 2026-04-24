import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { TriggerIcon } from '@components/ui/Icon/icon';
import { Modal } from '@components/ui/Modal/Modal';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { StickerChoice } from '@components/ui/StickerChoice/StickerChoice';
import { ActionType, PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  CardState,
  PendingChoice,
  ResolvedAction,
  ResolvedCost,
  Resources,
  StepDef,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';
import { tCardActionLabel, tCardName } from '@helpers/cardI18n';
import { getResMeta } from '@helpers/renderHelpers';
import type { TFunction } from 'i18next';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

function getChoiceActionLabel(
  choice: PendingChoice,
  instances: Record<number, CardInstance>,
  defs: Record<number, CardDef>,
  t: TFunction,
): React.ReactNode | undefined {
  const actionId = Number.parseInt(choice.id.split('-')[1]);
  if (Number.isNaN(actionId)) return undefined;
  const inst = instances[choice.sourceInstanceId];
  const def = inst ? defs[inst.cardId] : undefined;
  const state = def?.states.find(s => s.id === inst?.stateId);
  const effects = state?.actions;
  if (!effects || !def || !state) return undefined;
  const effectIdx = effects.findIndex(e => e.actionEffects.some(a => a.id === actionId));
  if (effectIdx === -1) return undefined;
  return tCardActionLabel(t, def.id, state.id, effectIdx, { ...inst.cumulated }) || undefined;
}

function makePreviewInstance(def: CardDef, state: CardState): CardInstance {
  return {
    id: 0,
    cardId: def.id,
    stateId: state.id,
    stickers: {},
    trackProgress: [],
    cumulated: {},
    usedActionIds: [],
  };
}

interface PendingChoiceModalProps {
  readonly choice?: PendingChoice;
  readonly triggerPile?: Record<string, TriggerEntry> | null;
  readonly defs: Record<number, CardDef>;
  readonly instances: Record<number, CardInstance>;
  readonly stickerDefs: Record<number, Sticker>;
  readonly resolvePlayerChoice: (option: ResolvedAction) => void;
  readonly resolvePayCost: (resolved: ResolvedCost) => void;
  readonly onResolveTrigger: (
    sourceInstanceId: number,
    actionId: string,
    triggerId: string,
  ) => void;
  readonly onSkipTrigger: (uuid: string) => void;
  readonly onSkipChoice: (uuid: string) => void;
}

type ChoiceSection = {
  title: string;
  subtitle: React.ReactNode;
  content: React.ReactNode;
};

type ChoiceSectionContext = {
  instances: Record<number, CardInstance>;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  t: TFunction;
  resolvePlayerChoice: (option: ResolvedAction) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  selectedIds: number[];
  onToggleId: (id: number) => void;
};

function getChoiceSection(choice: PendingChoice, ctx: ChoiceSectionContext): ChoiceSection {
  const {
    instances,
    defs,
    stickerDefs,
    t,
    resolvePlayerChoice,
    resolvePayCost,
    selectedIds,
    onToggleId,
  } = ctx;
  if (choice.type === PendingChoiceType.CHOOSE_CARD) {
    const isMultiSelect = choice.pickCount > 1;

    const handleCardClick = (instanceId: number) => {
      if (isMultiSelect) {
        onToggleId(instanceId);
        return;
      }
      if (choice.kind === 'COST') {
        resolvePayCost({ resources: {}, discardedCardIds: [instanceId], destroyedCardIds: [] });
      } else {
        resolvePlayerChoice({
          id: choice.id,
          type: choice.kind,
          sourceInstanceId: choice.sourceInstanceId,
          instanceIds: [instanceId],
        });
      }
    };
    return {
      title: t(`pendingChoice.chooseCard.${choice.kind}`, { count: choice.pickCount }),
      subtitle: getChoiceActionLabel(choice, instances, defs, t),
      content: (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {choice.choices.map(id => {
            if (typeof id !== 'number') return null;
            const inst = instances[id];
            const def = inst ? defs[inst.cardId] : undefined;
            if (!def || !inst) return null;
            const state = def.states.find(s => s.id === inst.stateId) ?? def.states[0];
            const isSelected = isMultiSelect && selectedIds.includes(id);
            return (
              <div
                className={`relative transition-transform hover:scale-[1.02]${isSelected ? ' ring-primary rounded-xl ring-2' : ''}`}
                key={id}
              >
                <button
                  onClick={() => handleCardClick(id)}
                  className="absolute inset-0 z-12 cursor-pointer!"
                ></button>
                <GameCard instance={makePreviewInstance(def, state)} hideStatePreview />
              </div>
            );
          })}
        </div>
      ),
    };
  }

  if (choice.type === PendingChoiceType.CHOOSE_STEP && choice.targetInstanceId) {
    const targetInst = instances[choice.targetInstanceId];
    const targetDef = targetInst ? defs[targetInst.cardId] : undefined;
    const targetState = targetDef?.states.find(s => s.id === targetInst?.stateId);
    const track = targetState?.track;
    const stepIds = new Set(choice.choices.filter((c): c is number => typeof c === 'number'));
    const steps: StepDef[] = track?.steps.filter(s => stepIds.has(s.id)) ?? [];

    return {
      title: t('pendingChoice.chooseStep'),
      subtitle: getChoiceActionLabel(choice, instances, defs, t),
      content: (
        <div className="flex flex-wrap gap-3">
          {steps.map(step => {
            const costEntry = step.cost?.resources?.[0];
            return (
              <button
                key={step.id}
                onClick={() =>
                  resolvePlayerChoice({
                    id: choice.id,
                    type: ActionType.TRACK_ADVANCE,
                    sourceInstanceId: choice.sourceInstanceId,
                    stepId: step.id,
                  })
                }
                className="flex min-w-16 flex-col items-center gap-1 rounded-md border-2 border-base-ink bg-card p-3 hover:bg-base-ink/10"
              >
                {costEntry && (
                  <div className="flex items-center gap-0.5 text-sm text-base-ink">
                    {Object.entries(costEntry).map(([k, v]) => {
                      const meta = getResMeta(k);
                      return (
                        <Fragment key={k}>
                          {v}
                          {meta.icon && <meta.icon className={`${meta.cls} size-4`} alt={k} />}
                        </Fragment>
                      );
                    })}
                  </div>
                )}
                <span className="font-display text-xs text-base-ink">#{step.id}</span>
              </button>
            );
          })}
        </div>
      ),
    };
  }

  if (choice.type === PendingChoiceType.CHOOSE_STATE) {
    const sourceInst = instances[choice.sourceInstanceId];
    const cardDef = sourceInst ? defs[sourceInst.cardId] : undefined;
    return {
      title: t(`pendingChoice.chooseState`),
      subtitle: getChoiceActionLabel(choice, instances, defs, t),
      content: (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {choice.choices.map(stateId => {
            if (typeof stateId !== 'number') return null;
            const state = cardDef?.states.find(s => s.id === stateId);
            if (!cardDef || !state) return null;
            return (
              <div key={stateId} className="relative transition-transform hover:scale-[1.02]">
                <button
                  onClick={() =>
                    resolvePlayerChoice({
                      id: choice.id,
                      type: choice.kind,
                      sourceInstanceId: choice.sourceInstanceId,
                      stateId,
                    })
                  }
                  className="absolute inset-0 z-12 cursor-pointer!"
                ></button>
                <GameCard instance={makePreviewInstance(cardDef, state)} hideStatePreview />
              </div>
            );
          })}
        </div>
      ),
    };
  }

  if (choice.type === PendingChoiceType.CHOOSE_RESOURCE) {
    const handleResourceSelect = (i: number) => {
      const r = choice.choices[i] as Resources;
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
    return {
      title: t(`pendingChoice.chooseResource`),
      subtitle: getChoiceActionLabel(choice, instances, defs, t),
      content: (
        <ResourceChoice
          options={choice.choices.filter(
            (c): c is Resources => typeof c !== 'number' && typeof c !== 'string',
          )}
          size="lg"
          onSelect={handleResourceSelect}
        />
      ),
    };
  }

  const handleStickerSelect = (stickerId: number) => {
    resolvePlayerChoice({
      id: choice.id,
      type: choice.kind,
      sourceInstanceId: choice.sourceInstanceId,
      stickerId,
    });
  };
  return {
    title: t(`pendingChoice.chooseSticker`),
    subtitle: getChoiceActionLabel(choice, instances, defs, t),
    content: (
      <StickerChoice
        options={choice.choices
          .filter((c): c is number => typeof c === 'number')
          .map(id => stickerDefs[id])
          .filter(Boolean)}
        size="lg"
        onSelect={handleStickerSelect}
      />
    ),
  };
}

export function PendingChoiceModal({
  choice,
  triggerPile,
  defs,
  instances,
  stickerDefs,
  resolvePlayerChoice,
  resolvePayCost,
  onResolveTrigger,
  onSkipTrigger,
  onSkipChoice,
}: PendingChoiceModalProps) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const onToggleId = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const isMultiSelect =
    (choice?.pickCount ?? 1) > 1 && choice?.type === PendingChoiceType.CHOOSE_CARD;

  const handleMultiConfirm = () => {
    if (selectedIds.length !== choice?.pickCount) return;
    if (choice.kind === 'COST') {
      resolvePayCost({ resources: {}, discardedCardIds: selectedIds, destroyedCardIds: [] });
    } else {
      resolvePlayerChoice({
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        instanceIds: selectedIds,
      });
    }
  };

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
          const actionIdx = state?.actions?.findIndex(e => e.id === trigger.effectDef.id) ?? -1;
          const cardName = tCardName(t, def?.id, state?.id);
          const actionLabel = tCardActionLabel(t, def?.id, state?.id, actionIdx, {
            ...inst.cumulated,
          });
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
                    onResolveTrigger(trigger.sourceInstanceId, trigger.effectDef.id, triggerId)
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

  // ── pending choice ─────────────────────────────────────────────────────
  if (choice) {
    ({ title, subtitle, content } = getChoiceSection(choice, {
      instances,
      defs,
      stickerDefs,
      t,
      resolvePlayerChoice,
      resolvePayCost,
      selectedIds,
      onToggleId,
    }));
  }

  const onClose = choice?.isMandatory === false ? () => onSkipChoice(choice.id) : undefined;
  const isCardChoice =
    choice?.type === PendingChoiceType.CHOOSE_CARD ||
    choice?.type === PendingChoiceType.CHOOSE_STATE;

  return (
    <Modal
      title={title}
      onClose={onClose}
      subtitle={subtitle}
      className={isCardChoice ? 'lg:min-w-2xl' : ''}
    >
      {content}
      {isMultiSelect && choice && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleMultiConfirm}
            disabled={selectedIds.length !== choice.pickCount}
            color="base-primary"
          >
            {t('pendingChoice.confirm', {
              selected: selectedIds.length,
              total: choice.pickCount,
            })}
          </Button>
        </div>
      )}
    </Modal>
  );
}
