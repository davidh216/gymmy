import { monitoringEnabled, reportError, stripQuery } from '../monitoring';

describe('monitoring', () => {
  it('strips tokens from URLs', () => {
    expect(stripQuery('https://x.supabase.co/storage/v1/object/sign/attempts/a.mp4?token=secret')).toBe(
      'https://x.supabase.co/storage/v1/object/sign/attempts/a.mp4',
    );
    expect(stripQuery('https://example.com/a#frag')).toBe('https://example.com/a');
    expect(stripQuery('https://example.com/a')).toBe('https://example.com/a');
  });

  it('stays off without a DSN and in development', () => {
    expect(monitoringEnabled).toBe(false);
    expect(() => reportError(new Error('x'))).not.toThrow();
  });
});
