import { Button } from '@components/ui/Button/Button';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import type { Resources } from '@engine/domain/types';

interface ResourceChoiceProps {
  readonly options: Resources[];
  readonly disabled?: boolean;
  readonly onSelect: (r: Resources) => void;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function ResourceChoice({
  options,
  disabled = false,
  onSelect,
  size = 'md',
}: ResourceChoiceProps) {
  return (
    <div className="flex items-center gap-2">
      {options.map((opt, i) => {
        const entries = Object.entries(opt);
        return (
          <Button
            key={i}
            onClick={() => onSelect(opt)}
            variant="text"
            disabled={disabled}
            className="transition-transform hover:scale-[1.02]"
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
