import type { CardAction, CardDef, CardInstance, Sticker } from '../../types';
import { getActiveState } from './getActiveState';

/** Actions of the card's active state, then those given by the stickers on that state. */
export const getStateActions = (
  instance: CardInstance,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): CardAction[] => [
  ...(getActiveState(instance, defs).actions ?? []),
  ...(instance.stickers[instance.stateId] ?? []).flatMap(id => {
    const action = stickerDefs[id]?.action;
    return action ? [action] : [];
  }),
];
