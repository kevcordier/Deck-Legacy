/** Removes trailing slashes from a URL (linear time, unlike a `/\/+$/` regex). */
export function trimTrailingSlashes(url: string): string {
  let end = url.length;
  while (end > 0 && url[end - 1] === '/') end -= 1;
  return url.slice(0, end);
}
