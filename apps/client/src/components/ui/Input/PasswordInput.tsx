import { EyeIcon, EyeOffIcon } from '@components/ui/Icon/icon';
import { TextInput } from '@components/ui/Input/TextInput';
import { type ComponentProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

type PasswordInputProps = Readonly<Omit<ComponentProps<typeof TextInput>, 'secureTextEntry'>>;

/** Password field with a button that shows or hides the typed characters. */
export function PasswordInput({ className = '', tone = 'theme', ...rest }: PasswordInputProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <View className="relative justify-center">
      <TextInput
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        tone={tone}
        className={`pr-11 ${className}`}
        {...rest}
      />
      <Pressable
        onPress={() => setVisible(value => !value)}
        accessibilityRole="button"
        accessibilityLabel={t(visible ? 'account.hidePassword' : 'account.showPassword')}
        accessibilityState={{ checked: visible }}
        hitSlop={4}
        className="absolute bottom-0 right-0 top-0 w-11 items-center justify-center active:opacity-60"
      >
        {visible ? (
          <EyeOffIcon className="text-ink-card size-5" />
        ) : (
          <EyeIcon className="text-ink-card size-5" />
        )}
      </Pressable>
    </View>
  );
}
