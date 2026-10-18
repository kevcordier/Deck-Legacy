import type { PendingChoiceType } from '@deck-legacy/engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Sticker,
} from '@deck-legacy/engine/domain/types';
import type { TFunction } from 'i18next';

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
