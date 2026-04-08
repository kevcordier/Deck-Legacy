export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="font-body flex flex-col items-start gap-1">
      <div className="text-xs">{label}</div>
      <div className="text-ink/80 font-display text-sm font-semibold">{value}</div>
    </div>
  );
}
