/** True for errors that mean "couldn't reach the server" rather than "the server said no". */
export function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  return /network request failed|failed to fetch|networkerror|timed? ?out|offline|load failed|fetch failed/i.test(message);
}

/** A short, human message for an error shown in the app. */
export function friendlyError(error: unknown, action = 'load this'): string {
  if (isNetworkError(error)) return `Couldn’t ${action}. You might be offline. Check your connection and try again.`;
  return `Couldn’t ${action}. Try again in a moment.`;
}
