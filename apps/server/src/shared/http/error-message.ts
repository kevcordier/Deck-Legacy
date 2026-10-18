/** Message of the thrown exception; Nest validation errors carry an array of messages. */
export function errorMessage(raw: string | object, fallback: string): string {
  if (typeof raw === 'string') return raw;
  const message = (raw as { message?: unknown }).message;
  if (Array.isArray(message)) return message.join(',');
  return typeof message === 'string' ? message : fallback;
}
