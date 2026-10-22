import { scholar } from './scholar';
import { ResourceType } from '@deck-legacy/engine/domain/enums';

const { GOLD, SCIENCE } = ResourceType;

/** Curious Girl (Foundations 53). */
export const curiousGirl = scholar({
  id: 226,
  names: ['Curious Girl', 'Eager Student', 'Studying Nun', '_____'],
  costs: [{ [GOLD]: 4 }, { [GOLD]: 4 }, { [SCIENCE]: 3 }],
  productions: [null, { [SCIENCE]: 1 }, { [SCIENCE]: 3 }],
  glory: 3,
  breakthrough: 10,
  chooseName: true,
});
