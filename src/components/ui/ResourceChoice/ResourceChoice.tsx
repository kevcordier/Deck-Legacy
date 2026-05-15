import { Button } from '@components/ui/Button/Button';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import type { Resources } from '@engine/domain/types';

interface ResourceChoiceProps {
  readonly options: Resources[];
  readonly disabled?: boolean;
  readonly onSelect: (index: number) => void;
  readonly className?: string;
  readonly pillClassName?: string;
}

export function ResourceChoice({
  options,
  disabled = false,
  onSelect,
  className,
  pillClassName,
}: ResourceChoiceProps) {
  return (
    <div className={`flex items-center gap-1 justify-start w-fit ${className ?? ''}`}>
      {options.map((opt, i) => {
        const entries = Object.entries(opt);
        return (
          <Button
            key={JSON.stringify(opt)}
            onClick={() => onSelect(i)}
            variant="text"
            color="base-ink"
            disabled={disabled}
            className="bg-card! transition-transform hover:not-disabled:bg-transparent! hover:not-disabled:scale-[1.02] rounded-full! p-2! flex gap-1 not-disabled:backdrop-blur-xl"
          >
            {entries.map(([key, val]) =>
              val > 2 ? (
                <div key={key} className="flex items-start">
                  <ResourcePill
                    key={`${key}-${i.toString()}`}
                    resource={key}
                    className={pillClassName}
                  />
                  <span>x{val}</span>
                </div>
              ) : (
                Array.from({ length: val }, (_, j) => (
                  <ResourcePill key={`${key}-${j}`} resource={key} className={pillClassName} />
                ))
              ),
            )}
          </Button>
        );
      })}
    </div>
  );
}
