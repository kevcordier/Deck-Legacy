/**
 * Runtime configuration, inlined by Expo from `EXPO_PUBLIC_*` variables (see `.env.example`).
 */
function trimSlash(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') end -= 1;
  return value.slice(0, end);
}

export const config = {
  apiUrl: trimSlash(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',
};
