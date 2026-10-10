import { getCampaignSegments } from '@engine/application/campaignSegments';
import { GameEventType } from '@engine/domain/enums';
import type { GameEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

let seq = 0;

function event(type: GameEventType, fields: Record<string, unknown> = {}): GameEvent {
  seq += 1;
  return { id: `e${seq}`, type, timestamp: seq, ...fields };
}

function saved(segment: string, score: number): GameEvent {
  return event(GameEventType.CAMPAIGN_SCORE_SAVED, { segment, score, openExpansionChoice: false });
}

describe('getCampaignSegments', () => {
  it('returns no segment for a game without saved scores', () => {
    expect(getCampaignSegments([event(GameEventType.GAME_STARTED)])).toEqual([]);
  });

  it('lists segments in the order they were played', () => {
    const events = [
      event(GameEventType.GAME_STARTED),
      saved('base', 40),
      saved('The Water Mill', 55),
      saved('Prosperity', 70),
    ];

    expect(getCampaignSegments(events)).toEqual([
      { segment: 'base', score: 40 },
      { segment: 'The Water Mill', score: 55 },
      { segment: 'Prosperity', score: 70 },
    ]);
  });

  it('keeps the first position and the last score of a segment saved twice', () => {
    const events = [
      event(GameEventType.GAME_STARTED),
      saved('base', 40),
      saved('base', 42),
      saved('Prosperity', 60),
    ];

    expect(getCampaignSegments(events)).toEqual([
      { segment: 'base', score: 42 },
      { segment: 'Prosperity', score: 60 },
    ]);
  });

  it('only counts the campaign started by the last GAME_STARTED', () => {
    const events = [
      event(GameEventType.GAME_STARTED),
      saved('base', 40),
      event(GameEventType.GAME_STARTED),
      saved('base', 12),
    ];

    expect(getCampaignSegments(events)).toEqual([{ segment: 'base', score: 12 }]);
  });
});
