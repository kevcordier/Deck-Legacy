import { SignInForm } from '@components/SignInForm/SignInForm';
import { Button } from '@components/ui/Button/Button';
import { Divider } from '@components/ui/Divider/Divider';
import { PasswordInput } from '@components/ui/Input/PasswordInput';
import { TextInput } from '@components/ui/Input/TextInput';
import { Modal } from '@components/ui/Modal/Modal';
import { PasswordStrength } from '@components/ui/PasswordStrength/PasswordStrength';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import { checkPassword } from '@domain/password/checkPassword';
import { useAuth } from '@hooks/useAuth';
import { useSyncStatus } from '@hooks/useSyncStatus';
import { api } from '@infrastructure/api/api';
import { toast } from '@infrastructure/toast/toast';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface AccountPanelProps {
  /** Closes the surrounding modal, once signed out or deleted. */
  readonly onDone: () => void;
}

/**
 * Account tab of the options: display name, password, sign out and account deletion; sync
 * status.
 */
export function AccountPanel({ onDone }: AccountPanelProps) {
  const { t } = useTranslation();
  const { status, user, setPassword, signOut, deleteAccount } = useAuth();
  const syncStatus = useSyncStatus();
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Without a registered account, nothing is sent to the API (EDR-050).
    if (!user || user.isAnonymous) return;
    api.getMe().then(
      me => {
        if (!cancelled) setDisplayName(me.displayName ?? '');
      },
      () => toast.error(t('errors.network')),
    );
    return () => {
      cancelled = true;
    };
  }, [t, user]);

  const run = async (task: () => Promise<void>, success?: string) => {
    setWorking(true);
    try {
      await task();
      if (success) toast.success(t(success));
    } catch (error) {
      toast.error(error instanceof Error ? t(error.message) : t('errors.unknown'));
    } finally {
      setWorking(false);
    }
  };

  if (status === 'disabled' || status === 'offline') {
    return (
      <Text className="text-sm">
        {t(status === 'disabled' ? 'account.unavailable' : 'account.offline')}
      </Text>
    );
  }

  if (!user || user.isAnonymous) {
    return (
      <View className="gap-6">
        <Text className="text-sm">{t('account.guestStatus')}</Text>
        <SignInForm />
      </View>
    );
  }
  const passwordsMatch = newPassword === confirmPassword;
  const canChangePassword = checkPassword(newPassword).valid && passwordsMatch;

  return (
    <>
      <View className="gap-6">
        <Text className="text-ink/70 text-xs">{t(`sync.${syncStatus}`)}</Text>

        <View className="gap-2">
          <Text className="text-sm">{t('account.signedInAs', { email: user.email ?? '' })}</Text>

          <Text className="text-xs">{t('account.displayName')}</Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                maxLength={32}
                placeholder={t('account.displayNamePlaceholder')}
                className="min-h-11"
              />
            </View>
            <Button
              size="sm"
              color="ink"
              font="body"
              className="min-h-11"
              disabled={working || displayName.trim().length < 2}
              onPress={() =>
                void run(async () => {
                  const me = await api.updateMe(displayName.trim());
                  setDisplayName(me.displayName ?? '');
                }, 'account.saved')
              }
            >
              {t('account.save')}
            </Button>
          </View>
        </View>

        <Divider />

        <View className="gap-2">
          <Title level={4}>{t('account.changePassword')}</Title>
          <PasswordInput
            value={newPassword}
            onChangeText={setNewPassword}
            autoComplete="new-password"
            placeholder={t('account.newPassword')}
            className="min-h-11"
          />
          <PasswordStrength password={newPassword} />
          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoComplete="new-password"
            placeholder={t('account.confirmPassword')}
            className="min-h-11"
          />
          {!passwordsMatch && confirmPassword.length > 0 && (
            <Text className="text-danger text-xs">{t('account.passwordMismatch')}</Text>
          )}
          <View className="items-start">
            <Button
              size="md"
              color="ink"
              font="body"
              disabled={working || !canChangePassword}
              onPress={() =>
                void run(async () => {
                  await setPassword(newPassword);
                  setNewPassword('');
                  setConfirmPassword('');
                }, 'account.passwordChanged')
              }
            >
              {t('account.changePassword')}
            </Button>
          </View>
        </View>

        <Divider />

        <View className="items-start gap-2">
          <Button
            size="md"
            color="ink"
            font="body"
            disabled={working}
            onPress={() =>
              void run(async () => {
                await signOut();
                onDone();
              })
            }
          >
            {t('account.signOut')}
          </Button>
        </View>

        <Divider />

        <View className="items-start gap-2">
          <Title level={4} className="text-danger">
            {t('account.deleteTitle')}
          </Title>
          <Text className="text-ink/70 text-xs">{t('account.deleteHint')}</Text>
          <Button
            size="md"
            color="danger"
            font="body"
            disabled={working}
            onPress={() => setConfirmDelete(true)}
          >
            {t('account.deleteButton')}
          </Button>
        </View>
      </View>

      {confirmDelete && (
        <Modal
          title={t('account.deleteTitle')}
          onClose={() => setConfirmDelete(false)}
          footer={
            <View className="flex-row justify-end gap-2">
              <Button
                size="md"
                variant="text"
                color="ink"
                font="body"
                onPress={() => setConfirmDelete(false)}
              >
                {t('kingdom.cancel')}
              </Button>
              <Button
                size="md"
                color="danger"
                font="body"
                disabled={working}
                onPress={() =>
                  void run(async () => {
                    await deleteAccount();
                    setConfirmDelete(false);
                    onDone();
                  }, 'account.deleted')
                }
              >
                {t('account.deleteConfirmButton')}
              </Button>
            </View>
          }
        >
          <Text>{t('account.deleteConfirm', { email: user.email ?? '' })}</Text>
        </Modal>
      )}
    </>
  );
}
