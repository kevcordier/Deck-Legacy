import { ResourcePill } from '@components/Resource/ResourcePill';
import type { Resources } from '@engine/types';

interface ResourceChoiceProps {
  options: Resources[];
  onSelect: (r: Resources) => void;
}

export function ResourceChoice({ options, onSelect }: ResourceChoiceProps) {
  return (
    <div className="res-choice-list">
      {options.map((opt, i) => {
        const entries = Object.entries(opt);
        const [key, val] = entries[0] ?? ['?', 1];
        return (
          <button key={i} onClick={() => onSelect(opt)} className="btn-res-choice">
            {Array.from({ length: val }, (_, j) => (
              <ResourcePill key={`${key}-${j}`} resource={key} size="lg" />
            ))}
          </button>
        );
      })}
    </div>
  );
}
