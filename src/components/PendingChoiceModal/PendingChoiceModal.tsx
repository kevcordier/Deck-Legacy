import { CardTrackContent } from '@components/CardTrack/CardTrack';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { TriggerIcon } from '@components/ui/Icon/icon';
import { Modal } from '@components/ui/Modal/Modal';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { StickerChoice } from '@components/ui/StickerChoice/StickerChoice';
import { ActionEffectType, PendingChoiceType } from '@engine/domain/enums';
import type {
  ActionEffect,
  CardDef,
  CardInstance,
  CardState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Resources,
  StepDef,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';
import { tCardActionLabel, tCardName } from '@helpers/cardI18n';
import type { TFunction } from 'i18next';
import { useState } from 'react';
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
  return (
    tCardActionLabel(t, def.id, state.id, effectIdx, { ...(inst.cumulated ?? {}) }) || undefined
  );
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
  readonly resolvePlayerChoice: (
    option: ResolvedActionEffect,
    choiceType: PendingChoiceType,
  ) => void;
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
  handleMultiConfirm?: () => void;
};

type ChoiceSectionContext = {
  instances: Record<number, CardInstance>;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  t: TFunction;
  resolvePlayerChoice: (option: ResolvedActionEffect, choiceType: PendingChoiceType) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  selectedIds: number[];
  onToggleId: (id: number) => void;
  isMultiSelect: boolean;
  minSelect: number;
  maxSelect: number;
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
    isMultiSelect,
    minSelect,
    maxSelect,
  } = ctx;
  if (choice.type === PendingChoiceType.CHOOSE_CARD) {
    const handleCardClick = (instanceId: number) => {
      if (isMultiSelect) {
        onToggleId(instanceId);
        return;
      }
      if (choice.kind === 'COST') {
        resolvePayCost({ resources: {}, discardedCardIds: [instanceId], destroyedCardIds: [] });
      } else {
        resolvePlayerChoice(
          {
            id: choice.id,
            type: choice.kind,
            sourceInstanceId: choice.sourceInstanceId,
            instanceIds: [instanceId],
          },
          choice.type,
        );
      }
    };
    return {
      title: t(`pendingChoice.chooseCard.${choice.kind}`, { count: maxSelect }),
      subtitle: getChoiceActionLabel(choice, instances, defs, t),
      handleMultiConfirm: () => {
        if (!choice) return;
        if (selectedIds.length < minSelect || selectedIds.length > maxSelect) return;
        if (choice.kind === 'COST') {
          resolvePayCost({ resources: {}, discardedCardIds: selectedIds, destroyedCardIds: [] });
        } else {
          resolvePlayerChoice(
            {
              id: choice.id,
              type: choice.kind,
              sourceInstanceId: choice.sourceInstanceId,
              instanceIds: selectedIds,
            },
            choice.type,
          );
        }
      },
      content: (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
    const handleStepClick = (stepId: number) => {
      if (isMultiSelect) {
        onToggleId(stepId);
        return;
      }
      resolvePlayerChoice(
        {
          id: choice.id,
          type: ActionEffectType.TRACK_ADVANCE,
          sourceInstanceId: choice.sourceInstanceId,
          stepIds: [stepId],
        },
        choice.type,
      );
    };
    const targetInst = instances[choice.targetInstanceId];
    const targetDef = targetInst ? defs[targetInst.cardId] : undefined;
    const targetState = targetDef?.states.find(s => s.id === targetInst?.stateId);
    const track = targetState?.track;
    const stepIds = new Set(choice.choices.filter((c): c is number => typeof c === 'number'));
    const steps: StepDef[] = track?.steps.filter(s => stepIds.has(s.id)) ?? [];

    return {
      title: t('pendingChoice.chooseStep'),
      subtitle: getChoiceActionLabel(choice, instances, defs, t),
      handleMultiConfirm: () => {
        if (!choice) return;
        if (selectedIds.length < minSelect || selectedIds.length > maxSelect) return;
        resolvePlayerChoice(
          {
            id: choice.id,
            type: choice.kind,
            sourceInstanceId: choice.sourceInstanceId,
            stepIds: selectedIds,
          },
          choice.type,
        );
      },
      content: (
        <div className="flex flex-wrap gap-3">
          {steps.map(step => {
            const isSelected = isMultiSelect && selectedIds.includes(step.id);
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`flex min-w-16 flex-col items-center gap-1 rounded-md border-2 border-base-ink bg-card p-3 hover:bg-base-ink/10 ${isSelected ? ' ring-primary rounded-xl ring-2' : ''}`}
              >
                {track && <CardTrackContent instance={targetInst} track={track} step={step} />}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {choice.choices.map(stateId => {
            if (typeof stateId !== 'number') return null;
            const state = cardDef?.states.find(s => s.id === stateId);
            if (!cardDef || !state) return null;
            return (
              <div key={stateId} className="relative transition-transform hover:scale-[1.02]">
                <button
                  onClick={() =>
                    resolvePlayerChoice(
                      {
                        id: choice.id,
                        type: choice.kind,
                        sourceInstanceId: choice.sourceInstanceId,
                        stateId,
                      },
                      choice.type,
                    )
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
        resolvePlayerChoice(
          {
            id: choice.id,
            type: choice.kind,
            sourceInstanceId: choice.sourceInstanceId,
            resources: r,
          },
          choice.type,
        );
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

  if (choice.type === PendingChoiceType.CHOOSE_ACTION_EFFECT) {
    const handleActionEffectSelect = (i: number) => {
      const actionEffect = choice.choices[i] as ActionEffect;
      resolvePlayerChoice(
        {
          id: choice.id,
          type: choice.kind,
          sourceInstanceId: choice.sourceInstanceId,
          newActionEffects: [actionEffect],
        },
        choice.type,
      );
    };
    return {
      title: t(`pendingChoice.chooseActionEffect`),
      subtitle: getChoiceActionLabel(choice, instances, defs, t),
      content: (
        <div className="flex flex-col gap-4">
          {choice.choices.map((actionEffect, index) => (
            <div
              key={`${(actionEffect as ActionEffect).id}-${index.toString()}`}
              className="bg-card flex items-center justify-between gap-5 rounded border p-4"
            >
              <div className="flex-1">
                <div className="font-display text-base-primary mb-1 text-sm font-semibold">
                  {tCardActionLabel(
                    t,
                    defs[instances[choice.sourceInstanceId].cardId].id,
                    instances[choice.sourceInstanceId].stateId,
                    `${(actionEffect as ActionEffect).id}-${index.toString()}`,
                  )}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  color="base-primary"
                  onClick={() => handleActionEffectSelect(index)}
                >
                  {t('triggerPile.resolve')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ),
    };
  }

  const handleStickerSelect = (stickerId: number) => {
    resolvePlayerChoice(
      {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        stickerId,
      },
      choice.type,
    );
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

  const minSelect = choice?.pickMin ?? choice?.pickCount ?? 1;
  const maxSelect = choice?.pickMax ?? choice?.pickCount ?? 1;

  const onToggleId = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= maxSelect) return prev;
      return [...prev, id];
    });
  };

  const isMultiSelect = minSelect !== maxSelect || minSelect > 1;

  let content;
  let title = '';
  let subtitle;
  let handleMultiConfirm;

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
            ...(inst.cumulated ?? {}),
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
    ({ title, subtitle, content, handleMultiConfirm } = getChoiceSection(choice, {
      instances,
      defs,
      stickerDefs,
      t,
      resolvePlayerChoice,
      resolvePayCost,
      selectedIds,
      onToggleId,
      isMultiSelect,
      minSelect,
      maxSelect,
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
        <div className="flex justify-end items-center gap-2 pt-2">
          <span>
            {minSelect === maxSelect
              ? t('pendingChoice.choices', {
                  total: minSelect,
                })
              : t('pendingChoice.choices-between', {
                  min: minSelect,
                  max: maxSelect,
                })}
          </span>
          <Button
            onClick={handleMultiConfirm}
            disabled={selectedIds.length < minSelect || selectedIds.length > maxSelect}
            color="base-primary"
          >
            {t('pendingChoice.confirm', {
              selected: selectedIds.length,
            })}
          </Button>
        </div>
      )}
    </Modal>
  );
}
