import type { ArrowRenderProps } from 'react-joyride';

export function TutorialArrow({ base, placement, size }: Readonly<ArrowRenderProps>) {
  const clipPath: Record<string, string> = {
    top: 'polygon(50% 100%, 0% 0%, 100% 0%)',
    right: 'polygon(100% 0%, 0% 50%, 100% 100%)',
    bottom: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    left: 'polygon(0% 0%, 100% 50%, 0% 100%)',
  };
  return (
    <div
      className="bg-card"
      style={{
        width: base,
        height: size,
        clipPath: clipPath[placement] ?? 'polygon(50% 0%, 0% 100%, 100% 100%)',
      }}
    />
  );
}
