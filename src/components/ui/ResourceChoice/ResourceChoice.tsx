import { Button } from '@components/ui/Button/Button';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import type { Resources } from '@engine/domain/types';

interface ResourceChoiceProps {
  readonly options: Resources[];
  readonly disabled?: boolean;
  readonly onSelect: (index: number) => void;
  readonly size?: 'sm' | 'md' | 'lg';
}

export function ResourceChoice({
  options,
  disabled = false,
  onSelect,
  size = 'md',
}: ResourceChoiceProps) {
  return (
    <div className="flex items-center gap-1">
      {options.map((opt, i) => {
        const entries = Object.entries(opt);
        return (
          <Button
            key={i}
            onClick={() => onSelect(i)}
            variant="text"
            color="base-ink"
            disabled={disabled}
            className="not-hover:not-disabled:bg-card transition-transform hover:scale-[1.02] rounded-full p-2! flex gap-1 backdrop-blur-sm"
          >
            {entries.map(([key, val]) =>
              Array.from({ length: val }, (_, j) => (
                <ResourcePill key={`${key}-${j}`} resource={key} size={size} />
              )),
            )}
          </Button>
        );
      })}
    </div>
  );
}
