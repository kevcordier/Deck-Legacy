/**
 * iOS / Android: nothing to do, Gesture Handler cancels the pressables under the finger as soon
 * as the drag starts.
 */
export function suppressDropClick(): () => void {
  return () => {};
}
