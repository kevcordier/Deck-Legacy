type TextInputProps = {
  readonly placeholder?: string;
  readonly className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ placeholder, type = 'text', className, ...rest }: TextInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      {...rest}
      className={`border rounded px-2 py-1 w-full ${className}`}
    />
  );
}
