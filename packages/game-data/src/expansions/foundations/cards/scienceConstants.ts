import { ResourceType } from '@deck-legacy/engine/domain/enums';

/** Science foundation (Foundations 45–63): instance ids, printed number + 191. */
export const SCIENCE_CARDS = {
  scienceTrack: 237,
  students: [245, 246, 247, 248],
  university: 249,
  experiments: 250,
  metallurgy: 251,
  aerostats: 252,
  stoneRoads: 253,
  appliedScience: 254,
};

/** "Any resource sticker" (1–6) and the science sticker (62), for the effects that add one. */
export const RESOURCE_STICKERS = [1, 2, 3, 4, 5, 6, 62];

export const SCIENCE = ResourceType.SCIENCE;
