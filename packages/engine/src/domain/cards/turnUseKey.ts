/** Key of an action in `GameState.turnUsedActions`. */
export function turnUseKey(instanceId: number, actionId: string): string {
  return `${instanceId}|${actionId}`;
}
