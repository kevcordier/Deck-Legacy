import type { BeaconRenderProps } from 'react-joyride';

export function TutorialBeacon({ size }: Readonly<BeaconRenderProps>) {
  return (
    <span className="relative flex items-center justify-center">
      <span
        className="absolute rounded-full bg-primary/25 dark:bg-dark-primary/25"
        style={{ width: size + 18, height: size + 18 }}
      />
      <span
        className="absolute rounded-full border-2 border-primary/45 animate-ping dark:border-dark-primary/50"
        style={{ width: size + 8, height: size + 8 }}
      />
      <span
        className="relative block rounded-full border-2 border-primary bg-primary shadow-[0_0_0_4px_rgba(199,146,51,0.18)] dark:border-dark-primary dark:bg-dark-primary dark:shadow-[0_0_0_4px_rgba(255,208,124,0.2)]"
        style={{ width: size, height: size }}
      >
        <span className="absolute inset-1 rounded-full border border-white/60 dark:border-dark-background/60" />
      </span>
    </span>
  );
}
