import type { PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  CardState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Sticker,
} from '@engine/domain/types';
import { tCardActionLabel } from '@helpers/cardI18n';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';

export type ChoiceSection = {
  title: string;
  subtitle: ReactNode;
  content: ReactNode;
  handleMultiConfirm?: () => void;
};

export type ChoiceSectionProps = {
  choice: PendingChoice;
  instances: Record<number, CardInstance>;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  t: TFunction;
  resolvePlayerChoice: (option: ResolvedActionEffect, choiceType: PendingChoiceType) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  selectedIds: number[];
  selectedCount: number;
  onToggleId: (id: number) => void;
  isMultiSelect: boolean;
  minSelect: number;
  maxSelect: number;
};

export function getChoiceActionLabel(
  choice: PendingChoice,
  instances: Record<number, CardInstance>,
  defs: Record<number, CardDef>,
  t: TFunction,
): ReactNode | undefined {
  const actionId = Number.parseInt(choice.id.split('-')[1]);
  if (Number.isNaN(actionId)) return undefined;
  const inst = instances[choice.sourceInstanceId];
  const def = inst ? defs[inst.cardId] : undefined;
  const state = def?.states.find(s => s.id === inst?.stateId);
  const effects = state?.actions;
  if (!effects || !def || !state) return undefined;
  const effectIdx = effects.findIndex(e =>
    e.actionEffects.some(a => a.id === actionId && a.type === choice.kind),
  );
  if (effectIdx === -1) return undefined;
  return tCardActionLabel(t, def.id, state.id, effectIdx, inst.cumulated) ?? undefined;
}

export function makePreviewInstance(
  instanceId: number,
  def: CardDef,
  state: CardState,
): CardInstance {
  return {
    id: instanceId,
    cardId: def.id,
    stateId: state.id,
    stickers: {},
    trackProgress: [],
    cumulated: 0,
    usedActionIds: [],
  };
}
