import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';

export type KingdomViewerProps = {
  readonly kingdom: KingdomMeta;
  readonly onClose: () => void;
};
