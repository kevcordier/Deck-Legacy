import type { SyntheticEvent } from 'react';

const INTERACTIVE_SELECTOR = 'button, input, a, [role="button"]';

/**
 * True when the event originated on an interactive control (button, input, link…)
 * strictly nested between `currentTarget` and `target` — used to let a card-level
 * click/keydown handler ignore events meant for the card's own action buttons,
 * without mistaking `currentTarget` itself (e.g. a `role="button"` wrapper) as interactive.
 */
export function isInteractiveElementClick(event: SyntheticEvent<Element>): boolean {
  const currentTarget = event.currentTarget;
  let el = event.target as HTMLElement | null;
  while (el && el !== currentTarget) {
    if (el.matches(INTERACTIVE_SELECTOR)) return true;
    el = el.parentElement;
  }
  return false;
}
