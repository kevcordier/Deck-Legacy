import { ExpansionIcon } from '@components/ExpansionIcon/ExpansionIcon';
import { Button } from '@components/ui/Button/Button';
import { Section } from '@components/ui/Section/Section';
import { Stat } from '@components/ui/Stat/Stat';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import type { ExpansionConfig } from '@deck-legacy/engine/domain/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

/** Expansions not released yet: playable only in development builds. */
const COMING_SOON = ['Foundations', 'Merchants'];

type ExpansionChoiceProps = {
  /** Expansions not played yet in this campaign. */
  readonly expansions: string[];
  readonly configs: Record<string, ExpansionConfig>;
  readonly onSelect: (expansion: string) => void;
};

/** Campaign step page: pick an expansion in the list, read its details, then confirm. */
export function ExpansionChoice({ expansions, configs, onSelect }: ExpansionChoiceProps) {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(expansions[0]);
  const config = configs[selected];
  const key = `campaign.expansions.${selected}`;
  const cardCount = config ? config.campaign.length + (config.discoverable?.length ?? 0) : 0;
  const comingSoon = !__DEV__ && COMING_SOON.includes(config?.expansion ?? selected);

  return (
    <ScrollView contentContainerClassName="mx-auto w-full max-w-5xl gap-4 p-4">
      <View className="gap-1">
        <Title level={2}>{t('campaign.chooseExpansionTitle')}</Title>
        <Text className="text-sm">{t('campaign.chooseExpansionDescription')}</Text>
      </View>

      <View className="gap-4 md:flex-row md:items-start">
        <View
          className="gap-2 md:w-64"
          accessibilityRole="radiogroup"
          accessibilityLabel={t('campaign.chooseExpansionTitle')}
        >
          {expansions.map(expansion => (
            <Button
              key={expansion}
              variant={expansion === selected ? 'contained' : 'outlined'}
              color={expansion === selected ? 'primary' : 'ink'}
              size="md"
              accessibilityRole="radio"
              accessibilityState={{ selected: expansion === selected }}
              onPress={() => setSelected(expansion)}
            >
              <View className="min-h-11 flex-1 flex-row items-center gap-3">
                <ExpansionIcon expansion={expansion} className="size-8" onDark />
                <Text className="flex-1">{t(`campaign.expansions.${expansion}.title`)}</Text>
              </View>
            </Button>
          ))}
        </View>

        {config && (
          <View className="bg-background/80 border-border flex-1 gap-5 rounded-lg border p-4">
            <View className="flex-row items-center gap-4">
              <ExpansionIcon expansion={selected} className="size-16" onDark />
              <Title level={2} className="flex-1">
                {t(`${key}.title`)}
              </Title>
            </View>

            <Section title={t('campaign.details.expansion')}>
              <Text className="text-sm">{t(`${key}.description`)}</Text>
            </Section>

            {i18n.exists(`${key}.campaign`) && (
              <Section title={t('campaign.details.campaign')}>
                <Text className="text-sm">{t(`${key}.campaign`)}</Text>
              </Section>
            )}

            <Section title={t('campaign.details.overview')}>
              <View className="flex-row flex-wrap gap-x-8 gap-y-3">
                {config.expansionMaxRound !== undefined && (
                  <Stat label={t('campaign.details.rounds')} value={config.expansionMaxRound} />
                )}
                {config.parameters?.discoverPerRound !== undefined && (
                  <Stat
                    label={t('campaign.details.discoverPerRound')}
                    value={config.parameters.discoverPerRound}
                  />
                )}
                {cardCount > 0 && <Stat label={t('campaign.details.cards')} value={cardCount} />}
              </View>
            </Section>

            <Section title={t('campaign.details.purge')}>
              <View className="gap-1">
                <Text className="text-sm">
                  {t('campaign.details.purgeBatch', { count: config.purge.purge })}
                </Text>
                <Text className="text-sm">
                  {t('campaign.details.purgePermanent', { count: config.purge.permanent })}
                </Text>
                {config.purge.focus && (
                  <Text className="text-sm">
                    {t('campaign.details.purgeFocus', {
                      count: config.purge.focus.count,
                      resource: t(`resources.${config.purge.focus.resource}`),
                    })}
                  </Text>
                )}
              </View>
            </Section>

            {i18n.exists(`${key}.rules`) && (
              <Section title={t('campaign.details.rules')}>
                <Text className="text-sm">{t(`${key}.rules`)}</Text>
              </Section>
            )}

            <View className="items-end">
              <Button
                variant="contained"
                color="base-primary"
                size="lg"
                disabled={comingSoon}
                onPress={() => onSelect(selected)}
              >
                {t(comingSoon ? 'campaign.details.comingSoon' : 'campaign.details.start')}
              </Button>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
