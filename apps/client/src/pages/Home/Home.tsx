import { Header } from '@components/Header/Header';
import { KingdomTable } from '@components/KingdomTable/KingdomTable';
import { KingdomViewer } from '@components/KingdomViewer/KingdomViewer';
import { NewKingdomModal } from '@components/NewKingdomModal/NewKingdomModal';
import { OptionsModal, type OptionsTab } from '@components/OptionsModal/OptionsModal';
import { RulesModal } from '@components/RulesModal/RulesModal';
import { SignInForm } from '@components/SignInForm/SignInForm';
import { Button } from '@components/ui/Button/Button';
import { Divider } from '@components/ui/Divider/Divider';
import { TextInput } from '@components/ui/Input/TextInput';
import { Modal } from '@components/ui/Modal/Modal';
import { Text, TextStyle } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import { KINGDOM_NAME_MAX_LENGTH } from '@deck-legacy/api-contract';
import { kingdomPath, maxKingdoms } from '@helpers/kingdom';
import { FULL_SIZE, PAGE_BACKGROUND, PAGE_EDGES } from '@helpers/pageBackground';
import { useAuth } from '@hooks/useAuth';
import { useGameUI } from '@hooks/useGameInterface';
import { useKingdoms } from '@hooks/useKingdoms';
import {
  type KingdomMeta,
  abandonKingdom,
  createKingdom,
  renameKingdom,
} from '@services/persistence';
import { STORAGE_KEYS, storage } from '@services/storage';
import { scheduleSync } from '@services/sync';
import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageBackground, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** First screen without an account: sign in, or play on this device only. */
function Welcome({ onPlayOffline }: { readonly onPlayOffline: () => void }) {
  const { t } = useTranslation();
  // `bg-card` is light on the dark page: use `ink-card` and `base-primary` on it.
  return (
    <View className="bg-card border-ink-card/30 w-full max-w-md gap-6 self-center rounded-lg border p-4 lg:p-6">
      <TextStyle className="text-ink-card">
        <View className="gap-2">
          <Title level={2} className="text-base-primary">
            {t('home.welcomeTitle')}
          </Title>
          <Text className="text-sm">{t('home.welcomeText')}</Text>
        </View>
        <SignInForm tone="card" />
        <Divider color="ink-card" />
        <View className="gap-2">
          <Button size="md" color="ink-card" font="body" onPress={onPlayOffline}>
            {t('home.playOffline')}
          </Button>
          <Text className="text-ink-card/70 text-xs">{t('home.playOfflineHint')}</Text>
        </View>
      </TextStyle>
    </View>
  );
}

/**
 * Home page: sign in (or stay offline), then the player's kingdoms. A kingdom is one save;
 * up to ten with an account, one without.
 */
export function Home() {
  const { t } = useTranslation();
  const { status, user } = useAuth();
  const { tutorialEnabled, setTutorialEnabled } = useGameUI();
  const kingdoms = useKingdoms();
  const [offlineChosen, setOfflineChosen] = useState(
    () => storage.getItem(STORAGE_KEYS.offline) === 'true',
  );
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<KingdomMeta | null>(null);
  const [viewing, setViewing] = useState<KingdomMeta | null>(null);
  const [toRename, setToRename] = useState<KingdomMeta | null>(null);
  const [newName, setNewName] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [optionsTab, setOptionsTab] = useState<OptionsTab | null>(null);

  const accountsAvailable = status !== 'disabled';
  const signedIn = Boolean(user && !user.isAnonymous);
  const showWelcome = accountsAvailable && !signedIn && !offlineChosen;
  const limit = maxKingdoms(signedIn ? user : null);
  const atLimit = kingdoms.length >= limit;

  const playOffline = () => {
    storage.setItem(STORAGE_KEYS.offline, 'true');
    setOfflineChosen(true);
  };

  const create = (name: string, tutorial: boolean) => {
    if (atLimit) return;
    const kingdom = createKingdom(randomUUID(), name);
    setTutorialEnabled(tutorial);
    setCreating(false);
    router.push(kingdomPath(kingdom));
  };

  const startRename = (kingdom: KingdomMeta) => {
    setNewName(kingdom.name);
    setToRename(kingdom);
  };

  const confirmRename = () => {
    const name = newName.trim();
    if (!toRename || name.length === 0) return;
    renameKingdom(toRename.id, name);
    scheduleSync();
    setToRename(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    abandonKingdom(toDelete.id);
    scheduleSync();
    setToDelete(null);
  };

  return (
    <ImageBackground
      source={PAGE_BACKGROUND}
      resizeMode="cover"
      className="flex-1"
      imageStyle={FULL_SIZE}
    >
      <SafeAreaView edges={PAGE_EDGES} className="bg-background/80 flex-1">
        <Header
          onOpenRules={() => setRulesOpen(true)}
          onOpenOptions={() => setOptionsTab('general')}
        >
          {accountsAvailable && (
            <Button
              onPress={() => router.push('/scoreboard')}
              color="danger"
              size="xs"
              title={t('scoreboard.title')}
            >
              🏆
            </Button>
          )}
        </Header>

        <ScrollView contentContainerClassName="w-full max-w-5xl gap-6 self-center p-4 lg:p-8">
          {showWelcome ? (
            <Welcome onPlayOffline={playOffline} />
          ) : (
            // `bg-card` is light on the dark page: use `ink-card` and `base-primary` on it.
            <View className="bg-card border-ink-card/30 gap-4 rounded-lg border p-4 lg:p-6">
              <TextStyle className="text-ink-card">
                <View className="flex-row flex-wrap items-center justify-between gap-3">
                  <View>
                    <Title level={2} className="text-base-primary">
                      {t('home.kingdoms')}
                    </Title>
                    <Text className="text-ink-card/70 text-xs">
                      {t('home.kingdomCount', { count: kingdoms.length, max: limit })}
                    </Text>
                  </View>
                  <Button
                    size="md"
                    color="base-primary"
                    font="body"
                    disabled={atLimit}
                    onPress={() => setCreating(true)}
                  >
                    {t('kingdom.new')}
                  </Button>
                </View>

                {atLimit && (
                  <Text className="text-ink-card/70 text-sm">
                    {signedIn ? t('home.limitReached') : t('home.limitReachedGuest')}
                  </Text>
                )}

                {kingdoms.length === 0 ? (
                  <View className="border-ink-card/30 items-center gap-2 rounded-lg border border-dashed p-8">
                    <Text className="font-body-italic text-center">{t('home.empty')}</Text>
                    <Button
                      size="md"
                      color="base-primary"
                      font="body"
                      onPress={() => setCreating(true)}
                    >
                      {t('kingdom.new')}
                    </Button>
                  </View>
                ) : (
                  <KingdomTable
                    kingdoms={kingdoms}
                    onOpen={kingdom => router.push(kingdomPath(kingdom))}
                    onView={setViewing}
                    onRename={startRename}
                    onDelete={setToDelete}
                  />
                )}
              </TextStyle>
            </View>
          )}
        </ScrollView>

        {creating && (
          <NewKingdomModal
            tutorialByDefault={tutorialEnabled}
            onClose={() => setCreating(false)}
            onCreate={create}
          />
        )}

        {viewing && <KingdomViewer kingdom={viewing} onClose={() => setViewing(null)} />}

        {toRename && (
          <Modal
            title={t('kingdom.renameTitle')}
            onClose={() => setToRename(null)}
            footer={
              <View className="flex-row justify-end gap-2">
                <Button
                  size="md"
                  variant="text"
                  color="ink"
                  font="body"
                  onPress={() => setToRename(null)}
                >
                  {t('kingdom.cancel')}
                </Button>
                <Button
                  size="md"
                  color="primary"
                  font="body"
                  disabled={newName.trim().length === 0}
                  onPress={confirmRename}
                >
                  {t('kingdom.renameConfirm')}
                </Button>
              </View>
            }
          >
            <View className="gap-2">
              <Text className="text-sm">{t('kingdom.nameLabel')}</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                maxLength={KINGDOM_NAME_MAX_LENGTH}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={confirmRename}
                className="min-h-11"
              />
            </View>
          </Modal>
        )}

        {toDelete && (
          <Modal
            title={t('kingdom.deleteTitle')}
            onClose={() => setToDelete(null)}
            footer={
              <View className="flex-row justify-end gap-2">
                <Button
                  size="md"
                  variant="text"
                  color="ink"
                  font="body"
                  onPress={() => setToDelete(null)}
                >
                  {t('kingdom.cancel')}
                </Button>
                <Button size="md" color="danger" font="body" onPress={confirmDelete}>
                  {t('kingdom.deleteConfirmButton')}
                </Button>
              </View>
            }
          >
            <Text>{t('kingdom.deleteConfirm', { name: toDelete.name })}</Text>
          </Modal>
        )}

        {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
        {optionsTab && <OptionsModal initialTab={optionsTab} onClose={() => setOptionsTab(null)} />}
      </SafeAreaView>
    </ImageBackground>
  );
}
