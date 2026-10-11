/** Delay after the drop during which the click it produces is still swallowed. */
const RELEASE_DELAY_MS = 100;

/**
 * Web: the mouse button is released over the dragged card, so the browser fires a click on the
 * control under the pointer (an action, an upgrade, the card viewer). Swallows that click.
 * Touch: the cards let the browser scroll (`touch-action`), so the page must not scroll while a
 * card is dragged.
 * Call when the drag starts; call the returned function when it ends.
 */
export function suppressDropClick(): () => void {
  const swallow = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };
  const blockScroll = (event: TouchEvent) => event.preventDefault();
  globalThis.addEventListener('click', swallow, { capture: true, once: true });
  globalThis.addEventListener('touchmove', blockScroll, { passive: false });
  return () => {
    globalThis.removeEventListener('touchmove', blockScroll);
    setTimeout(
      () => globalThis.removeEventListener('click', swallow, { capture: true }),
      RELEASE_DELAY_MS,
    );
  };
}
