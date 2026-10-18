import { systemEnvironment } from '@engine/application/session/systemEnvironment';
import { environment } from '@engine/domain/environment/environment';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => environment.use(systemEnvironment));

describe('environment', () => {
  it('reads the installed environment', () => {
    environment.use({ now: () => 7, newId: () => 'x', random: () => 0.5 });

    expect([environment.now(), environment.newId(), environment.random()]).toEqual([7, 'x', 0.5]);
  });

  it('fails clearly when no environment is installed', () => {
    environment.use(undefined as never);

    expect(() => environment.now()).toThrow('No engine environment');
  });
});
