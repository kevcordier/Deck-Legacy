type TagProps = {
  readonly label: string;
  readonly className?: string;
};

export function Tag({ label, className = '' }: TagProps) {
  return (
    <span
      className={`font-display text-base-ink inline-block gap-1 rounded border-black bg-black/20 px-1 py-0.5 text-xs @3xs:text-base ${className}`}
    >
      {label}
    </span>
  );
}
