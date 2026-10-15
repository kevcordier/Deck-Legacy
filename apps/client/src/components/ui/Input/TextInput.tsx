import { TextInput as RNTextInput, type TextInputProps as RNTextInputProps } from 'react-native';

type TextInputProps = RNTextInputProps & {
  readonly className?: string;
  /** `card`: on a `bg-card` surface, whose colors do not follow the theme. The field is always white. */
  readonly tone?: 'theme' | 'card';
};

export function TextInput({ className = '', tone = 'theme', ...rest }: TextInputProps) {
  const border = tone === 'card' ? 'border-ink-card' : 'border-ink';
  return (
    <RNTextInput
      placeholderTextColor="#bda887"
      className={`${border} font-body text-ink-card w-full bg-white rounded border px-2 py-1 text-base ${className}`}
      {...rest}
    />
  );
}
