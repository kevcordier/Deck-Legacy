export function splitClassTokens(className: string): string[] {
  return className
    .split(/\s+/)
    .filter(Boolean)
    .map(token => token.replace(/^!/, ''));
}
