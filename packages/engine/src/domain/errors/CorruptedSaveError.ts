export class CorruptedSaveError extends Error {
  constructor(message?: string) {
    super('errors.boundary.corruptedSave');
    this.name = 'CorruptedSaveError';
    Object.setPrototypeOf(this, CorruptedSaveError.prototype);
    if (message) {
      (this as { cause?: string }).cause = message;
    }
  }
}
