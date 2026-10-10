export class ActionCancelledError extends Error {
  constructor() {
    super('errors.actionCancelled');
    this.name = 'ActionCancelledError';
  }
}
