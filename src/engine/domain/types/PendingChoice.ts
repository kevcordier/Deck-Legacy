import type { CardInstance, CardState, Resources, Target, UpgradeDef } from '@engine/domain/types';

type PendingChooseStateItem = {
  instance: CardInstance;
  addedTo: 'deck_top' | 'deck_bottom' | 'permanents';
  options: CardState[];
};

export type PendingChoice =
  | {
      kind: 'block_card';
      blockerUid: string;
      candidates: string[];
      actionLabel: string;
    }
  | {
      kind: 'choose_resource';
      source: 'activation' | 'action';
      cardUid: string;
      options: Resources[];
    }
  | {
      kind: 'discover_card';
      actionCardUid: string;
      actionLabel: string;
      candidates: number[];
      pickCount: number;
    }
  | (PendingChooseStateItem & {
      kind: 'choose_state';
      remaining?: PendingChooseStateItem[];
    })
  | {
      kind: 'choose_upgrade';
      cardUid: string;
      options: UpgradeDef[];
    }
  | {
      kind: 'copy_production';
      actionCardUid: string;
      candidates: string[];
    }
  | {
      kind: 'play_from_discard';
      actionCardUid: string;
      candidates: string[];
      pickCount: number;
    }
  | {
      kind: 'discard_for_cost';
      actionCardUid: string;
      actionId: string;
      candidates: string[];
      remainingScopes: Target[];
      collectedUids: string[];
    };
