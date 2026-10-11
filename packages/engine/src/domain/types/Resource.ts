import type { ResourceType } from '../enums';

export type Resources = Partial<Record<ResourceType, number>>;

/** A resource cost; `'any'` lets the player pay any amount, from 0 to their stock. */
export type ResourceCost = Partial<Record<ResourceType, number | 'any'>>;
