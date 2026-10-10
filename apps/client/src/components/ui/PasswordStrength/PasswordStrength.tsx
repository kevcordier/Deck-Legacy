import { Text } from '@components/ui/Text/Text';
import { MIN_PASSWORD_LENGTH, PASSWORD_RULES, checkPassword } from '@helpers/password';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface PasswordStrengthProps {
  readonly password: string;
  /** `card`: on a `bg-card` surface, whose colors do not follow the theme. */
  readonly tone?: 'theme' | 'card';
}

const BAR_COLORS = ['', 'bg-danger', 'bg-base-primary', 'bg-success', 'bg-success'] as const;

/** Strength meter and checklist of the minimum rules for a new password. */
export function PasswordStrength({ password, tone = 'theme' }: PasswordStrengthProps) {
  const { t } = useTranslation();
  const { rules, score, strength } = checkPassword(password);
  const muted = tone === 'card' ? 'text-base-ink/70' : 'text-ink/70';
  const empty = tone === 'card' ? 'bg-base-ink/15' : 'bg-ink/15';

  return (
    <View className="gap-1">
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={t('account.passwordStrength.label')}
        accessibilityValue={{
          min: 0,
          max: 4,
          now: score,
          text: t(`account.passwordStrength.${strength}`),
        }}
        className="flex-row items-center gap-1"
      >
        {[1, 2, 3, 4].map(level => (
          <View
            key={level}
            className={`h-1.5 flex-1 rounded ${level <= score ? BAR_COLORS[score] : empty}`}
          />
        ))}
      </View>
      {score > 0 && (
        <Text className={`${muted} text-xs`}>
          {t('account.passwordStrength.summary', {
            strength: t(`account.passwordStrength.${strength}`),
          })}
        </Text>
      )}
      {PASSWORD_RULES.map(rule => (
        <Text key={rule} className={`text-xs ${rules[rule] ? 'text-success' : muted}`}>
          {rules[rule] ? '✓' : '•'}{' '}
          {t(`account.passwordRules.${rule}`, { min: MIN_PASSWORD_LENGTH })}
        </Text>
      ))}
    </View>
  );
}
