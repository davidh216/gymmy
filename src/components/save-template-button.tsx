import { Button, haptic } from '@/components/ui';
import { useGymmy } from '@/store/gymmy';

/** Saves a workout's exercises as a Quick start template (once per set of exercises). */
export function SaveTemplateButton({
  name,
  exerciseIds,
  variant = 'secondary',
}: {
  name: string;
  exerciseIds: string[];
  variant?: 'secondary' | 'ghost';
}) {
  const templates = useGymmy((s) => s.templates);
  const saveTemplate = useGymmy((s) => s.saveTemplate);
  const key = [...new Set(exerciseIds)].join(',');
  const saved = templates.some((t) => t.exerciseIds.join(',') === key);
  if (exerciseIds.length === 0) return null;
  return (
    <Button
      title={saved ? 'Saved as template ✓' : 'Save as template'}
      icon={saved ? undefined : { ios: 'square.and.arrow.down', web: 'bookmark_add' }}
      variant={variant}
      disabled={saved}
      testID="save-template"
      onPress={() => {
        haptic('success');
        saveTemplate({ name, exerciseIds });
      }}
    />
  );
}
