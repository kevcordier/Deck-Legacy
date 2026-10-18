/** Short messages shown to the player (toasts). */
export interface Notifier {
  error(message: string): void;
  info(message: string): void;
  success(message: string): void;
}
