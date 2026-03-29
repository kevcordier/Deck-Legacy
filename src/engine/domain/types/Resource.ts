import type { ResourceType } from '@engine/domain/enums';

export type Resources = Partial<Record<ResourceType, number>>;
