import type { ChoiceSectionProps } from './shared';
import { StickerChoice } from '@components/ui/StickerChoice/StickerChoice';

export function ChooseStickerSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, stickerDefs, resolvePlayerChoice } = props;

  return (
    <StickerChoice
      options={choice.choices
        .filter((candidate): candidate is number => typeof candidate === 'number')
        .map(id => stickerDefs[id])
        .filter(Boolean)}
      size="lg"
      onSelect={stickerId =>
        resolvePlayerChoice(
          {
            id: choice.id,
            type: choice.kind,
            sourceInstanceId: choice.sourceInstanceId,
            stickerId,
          },
          choice.type,
        )
      }
    />
  );
}
