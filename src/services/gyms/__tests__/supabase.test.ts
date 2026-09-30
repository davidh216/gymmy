import { searchTerm, toEntry, videoFormat } from '../supabase';

// Storage is never touched by these pure helpers; stub the native module (jest hoists this).
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: {} }));

describe('supabase gyms helpers', () => {
  it('maps entry rows to app entries', () => {
    const entry = toEntry(
      {
        id: 'e1',
        gym_id: 'g1',
        challenge_id: 'bench_1rm',
        user_id: 'u1',
        value: '102.5' as unknown as number,
        bodyweight_kg: null,
        video_path: 'u1/x.mp4',
        status: 'live',
        created_at: '2026-09-30T10:00:00Z',
        profile: { username: 'alex', companion_id: 'rex' },
      },
      'invalid',
    );
    expect(entry).toMatchObject({
      value: 102.5,
      bodyweightKg: undefined,
      hasVideo: true,
      myReport: 'invalid',
      athlete: { id: 'u1', username: 'alex', companionId: 'rex' },
    });
    expect(entry.createdAt).toBe(Date.parse('2026-09-30T10:00:00Z'));
  });

  it('sanitises search input for PostgREST filters', () => {
    expect(searchTerm('Gold’s, (Downtown)*')).toBe('Gold’s   Downtown');
    expect(searchTerm('   ')).toBe('');
  });

  it('picks video type from the blob, then the file name', () => {
    expect(videoFormat('blob:abc', 'video/webm')).toEqual({ ext: 'webm', contentType: 'video/webm' });
    expect(videoFormat('file:///tmp/clip.MOV')).toEqual({ ext: 'mov', contentType: 'video/quicktime' });
    expect(videoFormat('file:///tmp/clip')).toEqual({ ext: 'mp4', contentType: 'video/mp4' });
  });
});
