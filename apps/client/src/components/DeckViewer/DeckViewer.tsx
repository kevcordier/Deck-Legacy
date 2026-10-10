import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { GameCard } from '@components/GameCard/GameCard';
import { MiniGameCard } from '@components/MiniGameCard/MiniGameCard';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { Divider } from '@components/ui/Divider/Divider';
import { Grid } from '@components/ui/Grid/Grid';
import { SelectInput } from '@components/ui/Input/SelectInput';
import { TextInput } from '@components/ui/Input/TextInput';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import { getActiveState } from '@deck-legacy/engine/application/cardHelpers';
import { CardTag } from '@deck-legacy/engine/domain/enums';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { tCardTag } from '@helpers/cardI18n';
import { useGame } from '@hooks/useGame';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useTutorial } from '@hooks/useTutorial';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

type CardListFilter = {
  search: string;
  tag: string;
};

type DeckViewerProps = {
  readonly title: string;
  readonly icon: ReactNode;
  readonly emptyText?: string;
  readonly deck: CardInstance[];
  readonly displayedCards?: CardInstance[];
  readonly variant?: 'full' | 'left' | 'right';
  readonly pinned?: boolean;
  readonly onTogglePinned?: () => void;
  readonly footer?: ReactNode;
  readonly deckName?: 'draw' | 'discard' | 'destroyed';
};

const TOUR_IDS = {
  draw: 'draw-viewer-open',
  discard: 'discard-viewer-open',
  destroyed: 'destroyed-viewer-open',
} as const;

/** Cards of the full list. Phone: mini cards, at least two per row; a tap opens the card in large. */
function DeckCardGrid({ cards }: { readonly cards: CardInstance[] }) {
  const isDesktop = useIsDesktop();
  const [viewerCardId, setViewerCardId] = useState<number | null>(null);

  if (isDesktop) {
    return (
      <Grid minItemWidth={240} maxColumns={4}>
        {cards.map(inst => (
          <GameCard key={inst.id} instance={inst} size="lg" />
        ))}
      </Grid>
    );
  }

  return (
    <>
      <Grid minItemWidth={140} maxColumns={4} gap={8}>
        {cards.map(inst => (
          <MiniGameCard key={inst.id} instance={inst} onPress={() => setViewerCardId(inst.id)} />
        ))}
      </Grid>
      {viewerCardId !== null && (
        <CardViewerModal
          cardIds={cards.map(inst => inst.id)}
          initialId={viewerCardId}
          onClose={() => setViewerCardId(null)}
        />
      )}
    </>
  );
}

export function DeckViewer({
  title,
  icon,
  emptyText,
  deck,
  displayedCards,
  variant = 'full',
  pinned,
  onTogglePinned,
  footer,
  deckName,
}: DeckViewerProps) {
  const { defs } = useGame();
  const { t } = useTranslation();
  const { run, nextStep } = useTutorial();
  const [modalOpen, setModalOpen] = useState(false);
  const [cardFilter, setCardFilter] = useState<CardListFilter>({ search: '', tag: '' });
  const isLeft = variant === 'left';
  // Collapsed side columns only show their icon (former `@min-[10rem]` container query).
  const expanded = variant === 'full' || pinned === true;

  const cardFilterFn = (inst: CardInstance) => {
    const cs = getActiveState(inst, defs);
    return (
      t(`names.${cs.name}`, { ns: 'cards' })
        ?.toString()
        .toLowerCase()
        .includes(cardFilter.search.toLowerCase()) &&
      (cardFilter.tag === '' || cs.tags?.includes(cardFilter.tag as CardTag))
    );
  };

  const filteredDeck = deck.filter(cardFilterFn);

  const openIcon = isLeft ? '▶︎' : '◀︎';
  const closeIcon = isLeft ? '◀︎' : '▶︎';

  const tagOptions = [
    { label: t('cardList.allTags'), value: '' },
    ...deck
      .reduce<string[]>((acc, inst) => {
        const cs = getActiveState(inst, defs);
        cs.tags?.forEach(tag => {
          if (![CardTag.GOAL].includes(tag) && !acc.includes(tag)) {
            acc.push(tag);
          }
        });
        return acc;
      }, [])
      .map(value => ({ label: tCardTag(t, value), value }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  const content = (
    <>
      <View
        className={`border-b-border min-h-11 items-center justify-between gap-2 border-b p-2 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
      >
        {variant !== 'full' && (
          <Pressable
            onPress={onTogglePinned}
            accessibilityRole="button"
            accessibilityLabel={pinned ? t('deckViewer.unpinPanel') : t('deckViewer.pinPanel')}
            className="px-1 active:opacity-60"
          >
            <Text className="text-ink/40 text-xs leading-none">
              {pinned ? closeIcon : openIcon}
            </Text>
          </Pressable>
        )}
        <View className="shrink flex-row items-center gap-2">
          <Title level={4}>
            {icon}
            {expanded && ` ${title} (${deck.length})`}
          </Title>
          {expanded && deck.length > 1 && (
            <TutorialTarget id={deckName ? TOUR_IDS[deckName] : undefined}>
              <Button
                onPress={() => {
                  if (run) {
                    nextStep();
                  }
                  setModalOpen(true);
                }}
                size="xs"
                variant="text"
                color="ink"
              >
                {t('deckViewer.viewAll')}
              </Button>
            </TutorialTarget>
          )}
        </View>
      </View>

      {expanded &&
        (deck.length > 0
          ? displayedCards &&
            displayedCards.length > 0 && (
              <View className="items-center gap-2 p-2">
                {displayedCards.map(displayedCard => (
                  <GameCard key={displayedCard.id} instance={displayedCard} />
                ))}
              </View>
            )
          : emptyText && (
              <Text className="text-ink/50 font-body-italic p-2 text-center text-sm">
                {emptyText}
              </Text>
            ))}
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
          onClose={() => {
            setModalOpen(false);
            setCardFilter({ search: '', tag: '' });
            if (run) {
              nextStep();
            }
          }}
          label={deckName}
          // The draw pile slides in from the left, the discard (and destroyed) piles from the right.
          side={deckName === 'draw' ? 'left' : 'right'}
        >
          <TutorialTarget id="deck-viewer">
            <View className="gap-4 py-4 sm:flex-row sm:items-center">
              <TextInput
                value={cardFilter.search}
                onChangeText={search => setCardFilter({ ...cardFilter, search })}
                placeholder={t('cardList.searchPlaceholder')}
                className="sm:flex-1"
              />
              <SelectInput
                value={cardFilter.tag}
                onChange={tag => setCardFilter({ ...cardFilter, tag })}
                options={tagOptions}
                className="sm:w-56"
              />
            </View>
            <Divider color="gradient" orientation="horizontal" className="my-4" />
          </TutorialTarget>
          {deck.length === 0 ? (
            <Text className="text-ink/50 font-body-italic p-2 text-center text-sm">
              {t('deckViewer.emptyDeck')}
            </Text>
          ) : (
            <DeckCardGrid cards={filteredDeck} />
          )}
        </Modal>
      )}
    </View>
  );
}
