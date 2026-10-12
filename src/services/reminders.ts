import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { planReminders, reminderDayKey } from '@/lib/reminders';
import { useGymmy } from '@/store/gymmy';

import { buddyName, nextSession } from './next-session';

/** Notifications exist on iPhone builds that include them; elsewhere these are no-ops. */
const supported = Platform.OS === 'ios';

/** Asks for permission to send reminders. Resolves whether they're allowed. */
export async function allowReminders(): Promise<boolean> {
  if (!supported) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return asked.granted;
  } catch {
    return false;
  }
}

/** Whether reminders are currently allowed in iOS Settings. */
export async function remindersAllowed(): Promise<boolean> {
  if (!supported) return false;
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

let running: Promise<void> | null = null;

/** Replaces the scheduled reminders with a fresh two-week plan. */
export function syncReminders(): Promise<void> {
  if (!supported) return Promise.resolve();
  // One at a time, so quick successive changes don't interleave cancel and schedule.
  running = (running ?? Promise.resolve()).then(run, run);
  return running;
}

async function run() {
  try {
    const s = useGymmy.getState();
    const any = s.reminders.training || s.reminders.weighIn || s.reminders.recap;
    if (!any || !(await remindersAllowed())) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }
    const now = Date.now();
    const planned = planReminders({
      settings: s.reminders,
      now,
      buddy: buddyName(),
      trainedDays: new Set(s.workouts.map((w) => reminderDayKey(new Date(w.endedAt)))),
      nextSession: nextSession(now)?.name,
      weighInOn: Boolean(s.profile?.weightReview?.enabled),
    });
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const r of planned) {
      await Notifications.scheduleNotificationAsync({
        identifier: r.id,
        content: { title: r.title, body: r.body, data: { url: r.url } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at },
      });
    }
  } catch {
    // A build without notifications, or permission withdrawn mid-way: try again next time.
  }
}

/**
 * Keeps reminders current: replans when the app opens or comes back, after a workout, and when
 * reminder settings change. Also opens the right screen when a reminder is tapped.
 */
export function useReminders(ready: boolean) {
  const workouts = useGymmy((s) => s.workouts.length);
  const reminders = useGymmy((s) => s.reminders);
  const weighInOn = useGymmy((s) => Boolean(s.profile?.weightReview?.enabled));

  useEffect(() => {
    if (!ready || !supported) return;
    syncReminders();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncReminders();
    });
    return () => sub.remove();
  }, [ready, workouts, reminders, weighInOn]);

  useEffect(() => {
    if (!ready || !supported) return;
    const open = (response: Notifications.NotificationResponse | null) => {
      const url = response?.notification.request.content.data?.url;
      if (typeof url === 'string' && url !== '/') router.push(url as Href);
    };
    let sub: { remove: () => void } | undefined;
    try {
      Notifications.getLastNotificationResponseAsync().then(open, () => {});
      sub = Notifications.addNotificationResponseReceivedListener(open);
    } catch {
      sub = undefined;
    }
    return () => sub?.remove();
  }, [ready]);
}
