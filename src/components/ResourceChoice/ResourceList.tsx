import { ResourcePill } from '@components/ResourcePill/ResourcePill';
import type { Resources } from '@engine/domain/types';
import React from 'react';

interface ResourceListProps {
  resourceOptions?: Resources[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ResourceList({ resourceOptions, size = 'md' }: ResourceListProps) {
  if (!resourceOptions || resourceOptions.length === 0) return null;
  return (
    <div className="gc-prod-list">
      {resourceOptions?.map((entries, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span>/</span>}
          {Object.entries(entries).map(([k, v]) =>
            Array.from({ length: v }, (_, i) => (
              <ResourcePill key={`${k}-${i}`} resource={k} size={size} />
            )),
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
