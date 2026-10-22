import type { ExpansionPack } from './types';
import type { ExpansionConfig } from '@deck-legacy/engine/domain/types';

/** Campaigns of an expansion folder by name; each records the expansion that brings it. */
export function packCampaigns({ deck }: ExpansionPack): [string, ExpansionConfig][] {
  if ('campaigns' in deck) {
    return Object.entries(deck.campaigns).map(([name, config]) => [
      name,
      { ...config, expansion: deck.name },
    ]);
  }
  const { name, ...config } = deck;
  return [[name, { ...config, expansion: name }]];
}
