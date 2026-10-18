import { FilterableCardGrid } from './FilterableCardGrid';
import { PileTop } from './PileTop';
import { Button } from '@components/ui/Button/Button';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

type DeckViewerProps = {
  readonly title: string;
  readonly icon: ReactNode;
  readonly emptyText?: string;
  readonly deck: CardInstance[];
  readonly displayedCards?: CardInstance[];
  readonly variant?: 'full' | 'left' | 'right';
  readonly footer?: ReactNode;
  readonly deckName?: 'draw' | 'discard' | 'destroyed';
  /** Cards of the pile under the displayed ones, drawn as a stack under the last card. */
  readonly stackCount?: number;
};

export function DeckViewer({
  title,
  icon,
  emptyText,
  deck,
  displayedCards,
  variant = 'full',
  footer,
  deckName,
  stackCount = 0,
}: DeckViewerProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const isLeft = variant === 'left';

  const content = (
    <>
      <View
        className={`border-b-border min-h-11 items-center justify-between gap-2 border-b p-2 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
      >
        <View className="shrink flex-row items-center gap-2">
          <Title level={4}>
            {icon}
            {` ${title} (${deck.length})`}
          </Title>
          {deck.length > 1 && (
            <Button onPress={() => setModalOpen(true)} size="xs" variant="text" color="ink">
              {t('deckViewer.viewAll')}
            </Button>
          )}
        </View>
      </View>

      {deck.length > 0
        ? displayedCards &&
          displayedCards.length > 0 && <PileTop cards={displayedCards} stackCount={stackCount} />
        : emptyText && (
            <Text className="text-ink/50 font-body-italic p-2 text-center text-sm">
              {emptyText}
            </Text>
          )}
    </>
  );

  return (
    <View className="bg-background w-full flex-1">
      {variant === 'full' ? content : <ScrollView>{content}</ScrollView>}
      {footer && <View className="border-t-border mt-auto border-t p-2">{footer}</View>}

      {modalOpen && (
        <Modal
          title={t('deckViewer.title')}
          subtitle={t('deckViewer.modalSubtitle', { count: deck.length })}
          onClose={() => setModalOpen(false)}
          label={deckName}
          // The draw pile slides in from the left, the discard (and destroyed) piles from the right.
          side={deckName === 'draw' ? 'left' : 'right'}
        >
          {deck.length === 0 ? (
            <Text className="text-ink/50 font-body-italic p-2 text-center text-sm">
              {t('deckViewer.emptyDeck')}
            </Text>
          ) : (
            <FilterableCardGrid cards={deck} hiddenOrder={deckName === 'draw'} />
          )}
        </Modal>
      )}
    </View>
  );
}
