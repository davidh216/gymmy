import { File, Paths } from 'expo-file-system';
import { Share } from 'react-native';

import { checkInsCsv, exportFileName, fullExport, workoutsCsv } from '@/lib/export';
import { useGymmy } from '@/store/gymmy';

export type ExportKind = 'workouts' | 'check-ins' | 'backup';

/** Builds an export and opens the share sheet (save to Files, AirDrop, mail...). */
export async function shareExport(kind: ExportKind): Promise<void> {
  const now = Date.now();
  const s = useGymmy.getState();
  const units = s.profile?.units ?? 'lb';
  const text =
    kind === 'workouts' ? workoutsCsv(s.workouts, units) : kind === 'check-ins' ? checkInsCsv(s.checkIns) : fullExport(s, now);
  const file = new File(Paths.cache, exportFileName(kind, now));
  if (file.exists) file.delete();
  file.write(text);
  await Share.share({ url: file.uri });
}
