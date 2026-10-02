import { friendlyError, isNetworkError } from '../errors';

describe('error messages', () => {
  it('spots connection failures from fetch and supabase-js', () => {
    expect(isNetworkError(new TypeError('Network request failed'))).toBe(true);
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isNetworkError('TypeError: Load failed')).toBe(true);
    expect(isNetworkError(new Error('Request timed out'))).toBe(true);
    expect(isNetworkError(new Error('duplicate key value violates unique constraint'))).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });

  it('says what failed in plain words', () => {
    expect(friendlyError(new TypeError('Network request failed'), 'load this gym')).toBe(
      'Couldn’t load this gym. You might be offline. Check your connection and try again.',
    );
    expect(friendlyError(new Error('permission denied for table gyms'))).toBe('Couldn’t load this. Try again in a moment.');
  });
});
