import type { Resources } from '@engine/domain/types';
import { ResourcePill } from './ResourcePill';
import React from 'react';

interface ResourceListProps {
  resourceOptions?: Resources[];
  className?: string;
}

export function ResourceList({ resourceOptions }: ResourceListProps) {
  if (!resourceOptions || resourceOptions.length === 0) return null;
  return (
    <div className="gc-prod-list">
      {resourceOptions?.map((entries, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span>/</span>}
          {Object.entries(entries).map(([k, v]) =>
            Array.from({ length: v }, (_, i) => (
              <ResourcePill key={`${k}-${i}`} resource={k} size="md" />
            )),
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
