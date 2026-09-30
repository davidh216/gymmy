import { supabase } from './supabase';

export type ReviewItem = {
  entryId: string;
  gymName: string;
  challengeId: string;
  username: string;
  value: number;
  bodyweightKg?: number;
  videoPath: string;
  createdAt: number;
  inappropriateReports: number;
  invalidReports: number;
  reasons: string[];
};

type Row = {
  entry_id: string;
  gym_name: string;
  challenge_id: string;
  username: string;
  value: number;
  bodyweight_kg: number | null;
  video_path: string;
  created_at: string;
  inappropriate_reports: number;
  invalid_reports: number;
  reasons: string[] | null;
};

export async function reviewQueue(): Promise<ReviewItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('admin_review_queue');
  if (error) throw new Error(error.message);
  return (data as Row[]).map((r) => ({
    entryId: r.entry_id,
    gymName: r.gym_name,
    challengeId: r.challenge_id,
    username: r.username,
    value: Number(r.value),
    bodyweightKg: r.bodyweight_kg === null ? undefined : Number(r.bodyweight_kg),
    videoPath: r.video_path,
    createdAt: Date.parse(r.created_at),
    inappropriateReports: r.inappropriate_reports,
    invalidReports: r.invalid_reports,
    reasons: r.reasons ?? [],
  }));
}

export async function resolveEntry(entryId: string, decision: 'restore' | 'remove') {
  if (!supabase) return;
  const { error } = await supabase.rpc('admin_resolve', { p_entry: entryId, p_decision: decision });
  if (error) throw new Error(error.message);
}

export async function videoUrl(path: string): Promise<string | undefined> {
  const { data } = (await supabase?.storage.from('attempts').createSignedUrl(path, 3600)) ?? { data: null };
  return data?.signedUrl;
}
