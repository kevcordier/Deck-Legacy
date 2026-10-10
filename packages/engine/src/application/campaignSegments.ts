import { GameEventType } from '../domain/enums';
import type { CampaignScoreSavedEvent, GameEvent } from '../domain/types';

export type CampaignSegment = { segment: string; score: number };

/**
 * Campaign segment scores in the order they were played (`base` first, then expansions as
 * the player chose them). `campaignScores` is a record whose key order is not reliable once
 * stored (jsonb reorders keys), so the order is read from the event log instead.
 *
 * Only the campaign started by the last `GAME_STARTED` counts. When a segment is saved
 * several times (game over, then "continue campaign"), the last score wins and the segment
 * keeps its first position.
 */
export function getCampaignSegments(events: readonly GameEvent[]): CampaignSegment[] {
  const segments: CampaignSegment[] = [];
  for (const event of events) {
    if (event.type === GameEventType.GAME_STARTED) {
      segments.length = 0;
      continue;
    }
    if (event.type !== GameEventType.CAMPAIGN_SCORE_SAVED) continue;
    const { segment, score } = event as CampaignScoreSavedEvent;
    const existing = segments.find(s => s.segment === segment);
    if (existing) {
      existing.score = score;
    } else {
      segments.push({ segment, score });
    }
  }
  return segments;
}
