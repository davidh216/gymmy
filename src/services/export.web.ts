import { checkInsCsv, exportFileName, fullExport, workoutsCsv } from '@/lib/export';
import { useGymmy } from '@/store/gymmy';

export type ExportKind = 'workouts' | 'check-ins' | 'backup';

/** Web preview: downloads the file instead of opening a share sheet. */
export async function shareExport(kind: ExportKind): Promise<void> {
  const now = Date.now();
  const s = useGymmy.getState();
  const units = s.profile?.units ?? 'lb';
  const text =
    kind === 'workouts' ? workoutsCsv(s.workouts, units) : kind === 'check-ins' ? checkInsCsv(s.checkIns) : fullExport(s, now);
  const type = kind === 'backup' ? 'application/json' : 'text/csv';
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = exportFileName(kind, now);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
