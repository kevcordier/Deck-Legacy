import type { CampaignSegmentScore } from '../games/domain/campaign-segment-score';
import type { Prisma } from '../generated/prisma/client';

/** Segment scores stored as JSON; malformed entries are dropped. */
export function toSegments(value: Prisma.JsonValue): CampaignSegmentScore[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) return [];
    const { segment, score } = item;
    return typeof segment === 'string' && typeof score === 'number' ? [{ segment, score }] : [];
  });
}
