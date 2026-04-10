import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Button } from '@components/ui/Button/Button';
import type { Resources } from '@engine/domain/types';

interface ResourceChoiceProps {
  options: Resources[];
  disabled?: boolean;
  onSelect: (r: Resources) => void;
  size?: 'sm' | 'md' | 'lg';
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
        const [key, val] = entries[0] ?? ['?', 1];
        return (
          <Button
            key={i}
            onClick={() => onSelect(opt)}
            variant="text"
            disabled={disabled}
            className="transition-transform hover:scale-[1.02]"
          >
            {Array.from({ length: val }, (_, j) => (
              <ResourcePill key={`${key}-${j}`} resource={key} size={size} />
            ))}
          </Button>
        );
      })}
    </div>
  );
}
