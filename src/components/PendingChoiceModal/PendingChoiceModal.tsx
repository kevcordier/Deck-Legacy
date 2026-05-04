import { ChooseActionEffectSection } from './ChooseActionEffectSection';
import { ChooseCardSection } from './ChooseCardSection';
import { ChooseResourceSection } from './ChooseResourceSection';
import { ChooseStateSection } from './ChooseStateSection';
import { ChooseStepSection } from './ChooseStepSection';
import { ChooseStickerSection } from './ChooseStickerSection';
import { TriggerPileSection } from './TriggerPileSection';
import { type ChoiceSection, type ChoiceSectionProps, getChoiceActionLabel } from './shared';
import { Button } from '@components/ui/Button/Button';
import { Modal } from '@components/ui/Modal/Modal';
import { PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  readonly onSkipChoice: () => void;
}

function getSelectedCount(choice: PendingChoice | undefined, selectedIds: number[]): number {
  if (choice?.type !== PendingChoiceType.CHOOSE_CARD) {
    return selectedIds.length;
  }

  const countById = new Map<number, number>();
  choice.choices.forEach(item => {
    if (typeof item !== 'number') {
      return;
    }

    countById.set(item, (countById.get(item) ?? 0) + 1);
  });

  return selectedIds.reduce((total, id) => total + (countById.get(id) ?? 1), 0);
}

function getChoiceSection(props: ChoiceSectionProps): ChoiceSection {
  switch (props.choice.type) {
    case PendingChoiceType.CHOOSE_CARD:
      return {
        title: props.t(`pendingChoice.chooseCard.${props.choice.kind}`, {
          count: props.maxSelect,
        }),
        subtitle: getChoiceActionLabel(props.choice, props.instances, props.defs, props.t),
        handleMultiConfirm: () => {
          if (props.selectedCount < props.minSelect || props.selectedIds.length > props.maxSelect) {
            return;
          }
          if (props.choice.kind === 'COST') {
            props.resolvePayCost({
              resources: {},
              discardedCardIds: props.selectedIds,
              destroyedCardIds: [],
            });
            return;
          }
          props.resolvePlayerChoice(
            {
              id: props.choice.id,
              type: props.choice.kind,
              sourceInstanceId: props.choice.sourceInstanceId,
              instanceIds: props.selectedIds,
            },
            props.choice.type,
          );
        },
        content: <ChooseCardSection {...props} />,
      };
    case PendingChoiceType.CHOOSE_STEP:
      return {
        title: props.t('pendingChoice.chooseStep'),
        subtitle: getChoiceActionLabel(props.choice, props.instances, props.defs, props.t),
        handleMultiConfirm: () => {
          if (props.selectedCount < props.minSelect || props.selectedIds.length > props.maxSelect) {
            return;
          }
          props.resolvePlayerChoice(
            {
              id: props.choice.id,
              type: props.choice.kind,
              sourceInstanceId: props.choice.sourceInstanceId,
              stepIds: props.selectedIds,
            },
            props.choice.type,
          );
        },
        content: <ChooseStepSection {...props} />,
      };
    case PendingChoiceType.CHOOSE_STATE:
      return {
        title: props.t('pendingChoice.chooseState'),
        subtitle: getChoiceActionLabel(props.choice, props.instances, props.defs, props.t),
        content: <ChooseStateSection {...props} />,
      };
    case PendingChoiceType.CHOOSE_RESOURCE:
      return {
        title: props.t('pendingChoice.chooseResource'),
        subtitle: getChoiceActionLabel(props.choice, props.instances, props.defs, props.t),
        content: <ChooseResourceSection {...props} />,
      };
    case PendingChoiceType.CHOOSE_ACTION_EFFECT:
      return {
        title: props.t('pendingChoice.chooseActionEffect'),
        subtitle: getChoiceActionLabel(props.choice, props.instances, props.defs, props.t),
        content: <ChooseActionEffectSection {...props} />,
      };
    case PendingChoiceType.CHOOSE_STICKER:
      return {
        title: props.t('pendingChoice.chooseSticker'),
        subtitle: getChoiceActionLabel(props.choice, props.instances, props.defs, props.t),
        content: <ChooseStickerSection {...props} />,
      };
  }
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
  const maxSelect = choice?.pickMax ?? choice?.pickCount ?? choice?.choices.length ?? 1;
  const selectedCount = getSelectedCount(choice, selectedIds);

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
      <TriggerPileSection
        triggerPile={triggerPile}
        defs={defs}
        instances={instances}
        t={t}
        onResolveTrigger={onResolveTrigger}
        onSkipTrigger={onSkipTrigger}
      />
    );
  }

  // ── pending choice ─────────────────────────────────────────────────────
  if (choice) {
    ({ title, subtitle, content, handleMultiConfirm } = getChoiceSection({
      choice,
      instances,
      defs,
      stickerDefs,
      t,
      resolvePlayerChoice,
      resolvePayCost,
      selectedIds,
      selectedCount,
      onToggleId,
      isMultiSelect,
      minSelect,
      maxSelect,
    }));
  }

  const onClose = choice?.isMandatory === false ? () => onSkipChoice() : undefined;
  return (
    <Modal title={title} onClose={onClose} subtitle={subtitle}>
      {content}
      {choice && (isMultiSelect || choice.isMandatory === false) && (
        <div className="flex justify-end items-center gap-2 pt-2">
          {choice.isMandatory === false && (
            <Button onClick={() => onSkipChoice()} variant="outlined" color="ink">
              {t('pendingChoice.cancel')}
            </Button>
          )}
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
          {isMultiSelect && (
            <Button
              onClick={handleMultiConfirm}
              disabled={selectedCount < minSelect || selectedIds.length > maxSelect}
              color="base-primary"
            >
              {t('pendingChoice.confirm', {
                selected: selectedCount,
              })}
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
