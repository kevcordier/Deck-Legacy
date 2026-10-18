import { isRecord } from './isRecord';
import { parseJson } from './parseJson';
import type { CampaignSegmentScore } from '@domain/kingdom/CampaignSegmentScore';
import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';
import type { KingdomSummary } from '@domain/kingdom/KingdomSummary';
import { EMPTY_SUMMARY } from '@domain/kingdom/emptySummary';

function toSegments(value: unknown): CampaignSegmentScore[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item =>
    isRecord(item) && typeof item.segment === 'string' && typeof item.score === 'number'
      ? [{ segment: item.segment, score: item.score }]
      : [],
  );
}

function toSummary(value: unknown): KingdomSummary {
  if (!isRecord(value)) return EMPTY_SUMMARY;
  return {
    score: typeof value.score === 'number' ? value.score : 0,
    segments: toSegments(value.segments),
    finished: value.finished === true,
    ...(typeof value.round === 'number' && { round: value.round }),
    ...(typeof value.turn === 'number' && { turn: value.turn }),
  };
}

/** Reads the stored kingdom index; malformed entries are dropped. */
export function parseKingdomIndex(content: string | null): KingdomMeta[] {
  const raw = parseJson(content);
  if (!Array.isArray(raw)) return [];
  return raw.flatMap(item =>
    isRecord(item) && typeof item.id === 'string'
      ? [
          {
            id: item.id,
            name: typeof item.name === 'string' ? item.name : '',
            createdAt: typeof item.createdAt === 'number' ? item.createdAt : 0,
            summary: toSummary(item.summary),
          },
        ]
      : [],
  );
}
