/**
 * Local reminders, planned fresh each time the app opens: the next two weeks of one-off
 * notifications, so the text can name today's session and days you've trained are skipped.
 */

export type ReminderSettings = {
  /** Training-day nudges: weekdays 0 (Sunday) to 6, at a local time. */
  training?: { days: number[]; hour: number; minute: number };
  /** Sunday-morning weigh-in, when the weekly weigh-in is on. */
  weighIn?: boolean;
  /** Monday-morning recap and coach notes. */
  recap?: boolean;
};

export type PlannedReminder = {
  /** Stable per slot, e.g. "training-2026-10-14". */
  id: string;
  at: number;
  title: string;
  body: string;
  /** Screen to open on tap. */
  url: string;
};

/** How far ahead reminders are planned. */
export const PLAN_DAYS = 14;
export const DEFAULT_TRAINING = { days: [1, 3, 5], hour: 18, minute: 0 };
const WEIGH_IN_HOUR = 8;
const RECAP_HOUR = 9;

const DAY_KEY = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function planReminders(input: {
  settings: ReminderSettings;
  now: number;
  buddy: string;
  /** Days (YYYY-MM-DD) with a finished workout. */
  trainedDays: Set<string>;
  /** What to suggest for the next session, e.g. "Upper A" or "Push". */
  nextSession?: string;
  weighInOn: boolean;
}): PlannedReminder[] {
  const { settings, now, buddy } = input;
  const out: PlannedReminder[] = [];
  for (let i = 0; i < PLAN_DAYS; i++) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + i);
    const key = DAY_KEY(day);
    const at = (hour: number, minute = 0) => {
      const d = new Date(day);
      d.setHours(hour, minute, 0, 0);
      return d.getTime();
    };

    const t = settings.training;
    if (t && t.days.includes(day.getDay()) && !input.trainedDays.has(key)) {
      const when = at(t.hour, t.minute);
      if (when > now) {
        out.push({
          id: `training-${key}`,
          at: when,
          title: `${buddy} is ready when you are`,
          // The suggestion only holds for the next few days; later ones stay general.
          body:
            i < 3 && input.nextSession
              ? `Today’s session: ${input.nextSession}. Your streak is counting on it.`
              : 'It’s a training day. Even a short session keeps the streak going.',
          url: '/',
        });
      }
    }

    if (settings.weighIn && input.weighInOn && day.getDay() === 0) {
      const when = at(WEIGH_IN_HOUR);
      if (when > now) {
        out.push({
          id: `weigh-in-${key}`,
          at: when,
          title: 'Weekly weigh-in',
          body: 'Step on the scale before breakfast and log it to see your trend.',
          url: '/',
        });
      }
    }

    if (settings.recap && day.getDay() === 1) {
      const when = at(RECAP_HOUR);
      if (when > now) {
        out.push({
          id: `recap-${key}`,
          at: when,
          title: 'Your week in review',
          body: `${buddy} looked over last week: totals, records and what to do next.`,
          url: '/recap',
        });
      }
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

export { DAY_KEY as reminderDayKey };
