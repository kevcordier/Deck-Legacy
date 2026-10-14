import { Header } from '@components/Header/Header';
import { type KingdomRow, KingdomTable } from '@components/KingdomTable/KingdomTable';
import { OptionsModal } from '@components/OptionsModal/OptionsModal';
import { RulesModal } from '@components/RulesModal/RulesModal';
import { Button } from '@components/ui/Button/Button';
import { Text, TextStyle } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import { FULL_SIZE, PAGE_BACKGROUND } from '@helpers/pageBackground';
import { api } from '@services/api';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageBackground, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Scoreboard page: the kingdoms of registered players with the best total score (needs the API). */
export function Scoreboard() {
  const { t } = useTranslation();
  const [kingdoms, setKingdoms] = useState<KingdomRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.kingdomLeaderboard().then(
      entries => {
        if (cancelled) return;
        setKingdoms(
          entries.map(entry => ({
            id: entry.id,
            name: entry.name,
            player: entry.displayName ?? t('scoreboard.anonymous'),
            summary: { score: entry.score, segments: entry.segments },
          })),
        );
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [t]);

  const goHome = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  let content;
  if (failed) content = <Text className="text-sm">{t('errors.network')}</Text>;
  else if (!kingdoms)
    content = <Text className="font-body-italic text-sm">{t('scoreboard.loading')}</Text>;
  else if (kingdoms.length === 0)
    content = <Text className="font-body-italic text-sm">{t('scoreboard.empty')}</Text>;
  else content = <KingdomTable kingdoms={kingdoms} ranking />;

  return (
    <ImageBackground
      source={PAGE_BACKGROUND}
      resizeMode="cover"
      className="flex-1"
      imageStyle={FULL_SIZE}
    >
      <SafeAreaView className="bg-background/80 flex-1">
        <Header onOpenRules={() => setRulesOpen(true)} onOpenOptions={() => setOptionsOpen(true)} />

        <ScrollView contentContainerClassName="w-full max-w-5xl gap-6 self-center p-4 lg:p-8">
          {/* `bg-card` is light on the dark page: use `ink-card` and `base-primary` on it. */}
          <View className="bg-card border-ink-card/30 gap-4 rounded-lg border p-4 lg:p-6">
            <TextStyle className="text-ink-card">
              <View className="flex-row flex-wrap items-center justify-between gap-3">
                <View className="shrink">
                  <Title level={2} className="text-base-primary">
                    {t('scoreboard.title')}
                  </Title>
                  <Text className="text-ink-card/70 text-xs">{t('scoreboard.subtitle')}</Text>
                </View>
                <Button size="md" color="ink-card" font="body" onPress={goHome}>
                  {t('options.backHome')}
                </Button>
              </View>
              {content}
            </TextStyle>
          </View>
        </ScrollView>

        {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
        {optionsOpen && <OptionsModal initialTab="general" onClose={() => setOptionsOpen(false)} />}
      </SafeAreaView>
    </ImageBackground>
  );
}
