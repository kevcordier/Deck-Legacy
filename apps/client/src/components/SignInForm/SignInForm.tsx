import { Button } from '@components/ui/Button/Button';
import { PasswordInput } from '@components/ui/Input/PasswordInput';
import { TextInput } from '@components/ui/Input/TextInput';
import { PasswordStrength } from '@components/ui/PasswordStrength/PasswordStrength';
import { Tabs } from '@components/ui/Tabs/Tabs';
import { Text } from '@components/ui/Text/Text';
import { checkPassword } from '@helpers/password';
import { toast } from '@helpers/toast';
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type Tab = 'signIn' | 'create';

/** Colors of the form on the themed background, or on a `bg-card` surface (fixed colors). */
const TONES = {
  theme: {
    hint: 'text-ink/70',
    main: 'primary',
  },
  card: {
    hint: 'text-base-ink/70',
    main: 'base-primary',
  },
} as const;

/** Minimum accepted at sign-in: accounts created before the stricter rules may use it. */
const MIN_SIGN_IN_PASSWORD = 6;
const MIN_NAME = 2;

/**
 * Two tabs: sign in to an existing account, or create one (display name, email, password) from
 * the current guest account, whose kingdoms are kept.
 */
export function SignInForm({ tone = 'theme' }: { readonly tone?: 'theme' | 'card' }) {
  const { t } = useTranslation();
  const colors = TONES[tone];
  const { createAccount, signIn } = useAuth();
  const [tab, setTab] = useState<Tab>('signIn');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [working, setWorking] = useState(false);
  const validEmail = email.includes('@');
  const validSignInPassword = password.length >= MIN_SIGN_IN_PASSWORD;
  const validNewPassword = checkPassword(password).valid;
  const passwordsMatch = password === confirmPassword;
  const validName = displayName.trim().length >= MIN_NAME;

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

  const create = () =>
    run(async () => {
      await createAccount(email.trim(), password);
      await api.updateMe(displayName.trim());
    }, 'account.accountCreated');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'signIn', label: t('account.signIn') },
    { id: 'create', label: t('account.createAccount') },
  ];

  return (
    <View className="gap-3">
      <Tabs tabs={tabs} value={tab} onChange={setTab} tone={tone} />

      <Text className={`${colors.hint} text-xs`}>
        {tab === 'signIn' ? t('account.signInHint') : t('account.keepProgressHint')}
      </Text>

      {tab === 'create' && (
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={32}
          autoComplete="username"
          placeholder={t('account.displayNamePlaceholder')}
          tone={tone}
          className="min-h-11"
        />
      )}

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder={t('account.email')}
        tone={tone}
        className="min-h-11"
      />

      <PasswordInput
        value={password}
        onChangeText={setPassword}
        autoComplete={tab === 'signIn' ? 'current-password' : 'new-password'}
        placeholder={t('account.password')}
        tone={tone}
        className="min-h-11"
      />

      {tab === 'create' && (
        <>
          <PasswordStrength password={password} tone={tone} />
          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoComplete="new-password"
            placeholder={t('account.confirmPassword')}
            tone={tone}
            className="min-h-11"
          />
          {!passwordsMatch && confirmPassword.length > 0 && (
            <Text className="text-danger text-xs">{t('account.passwordMismatch')}</Text>
          )}
        </>
      )}

      {tab === 'signIn' ? (
        <Button
          size="md"
          color={colors.main}
          font="body"
          disabled={working || !validEmail || !validSignInPassword}
          onPress={() => void run(() => signIn(email.trim(), password))}
        >
          {t('account.signIn')}
        </Button>
      ) : (
        <Button
          size="md"
          color={colors.main}
          font="body"
          disabled={working || !validName || !validEmail || !validNewPassword || !passwordsMatch}
          onPress={() => void create()}
        >
          {t('account.createAccount')}
        </Button>
      )}
    </View>
  );
}
