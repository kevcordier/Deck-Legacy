/** Minimum length of a new password (sign-in still accepts older, shorter ones). */
export const MIN_PASSWORD_LENGTH = 8;

export type PasswordRule = 'length' | 'lowercase' | 'uppercase' | 'digit';

/** Rules a new password must all meet, in display order. */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  'length',
  'lowercase',
  'uppercase',
  'digit',
];
