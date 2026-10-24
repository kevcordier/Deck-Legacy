import { CardNumber } from '@components/CardNumber/CardNumber';
import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';
import { Fragment, type ReactNode } from 'react';

/** `wrapIcon` for card texts: {{discovered}} shows the number of the cards discovered by `effects`. */
export function cardTextTokens(effects: readonly ActionEffect[] | undefined) {
  const discoveredIds = (effects ?? [])
    .filter(effect => effect.type === ActionEffectType.DISCOVER_CARD)
    .flatMap(effect => effect.cards?.ids ?? []);
  const discovered = (
    <>
      {discoveredIds.map((id, index) => (
        <Fragment key={id}>
          {index > 0 && '/'}
          <CardNumber instanceId={id} />
        </Fragment>
      ))}
    </>
  );
  return (key: string, icon: ReactNode): ReactNode => (key === 'discovered' ? discovered : icon);
}
