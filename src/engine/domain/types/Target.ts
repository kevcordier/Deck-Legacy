import type { TargetScope } from '@engine/domain/enums';

export type Target = { scope: TargetScope; tag?: string; cardId?: number };
