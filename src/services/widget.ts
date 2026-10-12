import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { widgetTimeline } from '@/lib/widget-data';
import { useGymmy } from '@/store/gymmy';
import { GymmyWidget } from '@/widgets/gymmy-widget';

import { buddyName, nextSession } from './next-session';

/** Sends the widget fresh content: now, and a reset at the start of next week. */
export function syncWidget() {
  if (Platform.OS !== 'ios') return;
  try {
    const s = useGymmy.getState();
    const now = Date.now();
    const next = nextSession(now);
    const entries = widgetTimeline({
      workoutTimes: s.workouts.map((w) => w.endedAt),
      goal: s.profile?.weeklyGoal ?? 3,
      buddy: buddyName(),
      next: next?.name ?? '',
      nextFrom: next?.from ?? '',
      now,
    });
    GymmyWidget.updateTimeline(entries);
  } catch {
    // A build without the widget extension: nothing to update.
  }
}

/** Keeps the widget in step with workouts, plans and goals, and refreshes it when the app comes back. */
export function useWidgetSync(ready: boolean) {
  const workouts = useGymmy((s) => s.workouts);
  const plan = useGymmy((s) => s.plan);
  const goal = useGymmy((s) => s.profile?.weeklyGoal);
  const companionId = useGymmy((s) => s.companionId);
  const collection = useGymmy((s) => s.collection);

  useEffect(() => {
    if (!ready || Platform.OS !== 'ios') return;
    syncWidget();
  }, [ready, workouts, plan, goal, companionId, collection]);

  useEffect(() => {
    if (!ready || Platform.OS !== 'ios') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncWidget();
    });
    return () => sub.remove();
  }, [ready]);
}
