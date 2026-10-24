/** Choices of the player kept on the device. */
export type PreferenceKey = 'offline' | 'tutorial' | 'resourceWarning' | 'animations';

export interface Preferences {
  get(key: PreferenceKey): string | null;
  set(key: PreferenceKey, value: string): void;
}
