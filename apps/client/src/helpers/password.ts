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

export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordCheck {
  /** Whether each required rule is met. */
  readonly rules: Readonly<Record<PasswordRule, boolean>>;
  /** True when every required rule is met. */
  readonly valid: boolean;
  /** 0 (empty) to 4 (strong). */
  readonly score: 0 | 1 | 2 | 3 | 4;
  readonly strength: PasswordStrength;
}

const STRENGTHS: readonly PasswordStrength[] = ['empty', 'weak', 'fair', 'good', 'strong'];

/**
 * Checks a new password against the minimum rules and rates its strength. A password that misses
 * a rule is at most `weak`; a valid one is `fair`, then gains a level for a symbol and for 12+
 * characters.
 */
export function checkPassword(password: string): PasswordCheck {
  const rules: Record<PasswordRule, boolean> = {
    length: password.length >= MIN_PASSWORD_LENGTH,
    lowercase: /\p{Ll}/u.test(password),
    uppercase: /\p{Lu}/u.test(password),
    digit: /\d/.test(password),
  };
  const valid = PASSWORD_RULES.every(rule => rules[rule]);
  let score: PasswordCheck['score'] = 0;
  if (password.length > 0) {
    score = 1;
    if (valid) {
      const symbol = /[^\p{L}\d]/u.test(password);
      const long = password.length >= 12;
      score = (2 + Number(symbol) + Number(long)) as PasswordCheck['score'];
    }
  }
  return { rules, valid, score, strength: STRENGTHS[score] };
}
