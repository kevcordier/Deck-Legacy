import { checkPassword } from '@domain/password/checkPassword';
import { describe, expect, it } from 'vitest';

describe('checkPassword', () => {
  it('rates an empty password as empty', () => {
    expect(checkPassword('')).toMatchObject({ valid: false, score: 0, strength: 'empty' });
  });

  it('reports each missing rule', () => {
    expect(checkPassword('abc').rules).toEqual({
      length: false,
      lowercase: true,
      uppercase: false,
      digit: false,
    });
    expect(checkPassword('ABCDEFGH1').rules.lowercase).toBe(false);
  });

  it('keeps a password missing a rule weak, whatever its length', () => {
    expect(checkPassword('abcdefghijklmnop!')).toMatchObject({ valid: false, strength: 'weak' });
  });

  it('accepts accented letters', () => {
    expect(checkPassword('éÉté1234').valid).toBe(true);
  });

  it('rates a valid password fair, then good, then strong', () => {
    expect(checkPassword('Abcdefg1')).toMatchObject({ valid: true, strength: 'fair' });
    expect(checkPassword('Abcdefg1!')).toMatchObject({ valid: true, strength: 'good' });
    expect(checkPassword('Abcdefghijk1')).toMatchObject({ valid: true, strength: 'good' });
    expect(checkPassword('Abcdefghij1!')).toMatchObject({ valid: true, strength: 'strong' });
  });
});
