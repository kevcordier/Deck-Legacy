import { kingdomIdFromParam } from '@domain/kingdom/kingdomIdFromParam';
import { kingdomPath } from '@domain/kingdom/kingdomPath';
import { maxKingdoms } from '@domain/kingdom/maxKingdoms';
import { slugify } from '@domain/kingdom/slugify';
import { describe, expect, it } from 'vitest';

const ID = '9c1e7d24-6b8a-4c3f-8e21-7a5d3f9b0c42';

describe('slugify', () => {
  it('removes accents, punctuation and case', () => {
    expect(slugify("  Le Royaume d'Été !  ")).toBe('le-royaume-d-ete');
  });

  it('falls back to a default slug', () => {
    expect(slugify('✨✨')).toBe('kingdom');
  });
});

describe('kingdom paths', () => {
  it('builds /game/{slug}-{id}', () => {
    expect(kingdomPath({ id: ID, name: 'Avalon' })).toBe(`/game/avalon-${ID}`);
  });

  it('reads the id from the end of the parameter, whatever the slug', () => {
    expect(kingdomIdFromParam(`avalon-${ID}`)).toBe(ID);
    expect(kingdomIdFromParam(`old-name-${ID.toUpperCase()}`)).toBe(ID);
    expect(kingdomIdFromParam([`x-${ID}`])).toBe(ID);
  });

  it('rejects parameters without an id', () => {
    expect(kingdomIdFromParam(undefined)).toBeNull();
    expect(kingdomIdFromParam('avalon')).toBeNull();
    expect(kingdomIdFromParam(`avalon-${ID.slice(0, -1)}z`)).toBeNull();
  });
});

describe('maxKingdoms', () => {
  it('allows ten kingdoms with an account and one otherwise', () => {
    expect(maxKingdoms({ isAnonymous: false })).toBe(10);
    expect(maxKingdoms({ isAnonymous: true })).toBe(1);
    expect(maxKingdoms(null)).toBe(1);
  });
});
