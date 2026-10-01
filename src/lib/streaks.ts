const DAY = 24 * 60 * 60 * 1000;

/** Local midnight on the Monday of the week containing `ts`. */
export function weekStart(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  return d.getTime();
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function prevWeek(start: number): number {
  const d = new Date(start);
  d.setDate(d.getDate() - 7);
  return d.getTime();
}

function nextWeek(start: number): number {
  const d = new Date(start);
  d.setDate(d.getDate() + 7);
  return d.getTime();
}

/** Calendar days between the latest workout and now; null if none. */
export function daysSince(timestamps: number[], now: number): number | null {
  if (timestamps.length === 0) return null;
  const last = Math.max(...timestamps);
  return Math.round((startOfDay(now) - startOfDay(last)) / DAY);
}

/** Collapse timestamps to one per calendar day, so doubles don't count twice. */
function trainingDays(timestamps: number[]): number[] {
  return [...new Set(timestamps.map(startOfDay))];
}

/** Distinct training days in the week containing `now`. */
export function countInWeek(timestamps: number[], now: number): number {
  const start = weekStart(now);
  return trainingDays(timestamps).filter((t) => weekStart(t) === start).length;
}

/** Days (Mon=0..Sun=6) of the current week with at least one workout. */
export function activeDaysThisWeek(timestamps: number[], now: number): Set<number> {
  const start = weekStart(now);
  const days = new Set<number>();
  for (const t of timestamps) {
    if (weekStart(t) === start) days.add((new Date(t).getDay() + 6) % 7);
  }
  return days;
}

/**
 * Consecutive weeks meeting the goal (in distinct training days). The current week counts once it's met,
 * but an in-progress week never breaks the streak.
 */
export function weekStreak(timestamps: number[], goal: number, now: number): number {
  const counts = new Map<number, number>();
  for (const t of trainingDays(timestamps)) {
    const w = weekStart(t);
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  let week = weekStart(now);
  let streak = (counts.get(week) ?? 0) >= goal ? 1 : 0;
  week = prevWeek(week);
  while ((counts.get(week) ?? 0) >= goal) {
    streak++;
    week = prevWeek(week);
  }
  return streak;
}

/** Distinct training days for each of the last `weeks` weeks, oldest first. */
export function weeklyCounts(timestamps: number[], weeks: number, now: number): number[] {
  const starts: number[] = [];
  let w = weekStart(now);
  for (let i = 0; i < weeks; i++) {
    starts.unshift(w);
    w = prevWeek(w);
  }
  const days = trainingDays(timestamps);
  return starts.map((s) => days.filter((t) => weekStart(t) === s).length);
}

/** Longest run of consecutive weeks meeting the goal, ever. */
export function bestWeekStreak(timestamps: number[], goal: number): number {
  const counts = new Map<number, number>();
  for (const t of trainingDays(timestamps)) {
    const w = weekStart(t);
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const hits = new Set([...counts].filter(([, n]) => n >= goal).map(([w]) => w));
  let best = 0;
  for (const w of hits) {
    if (hits.has(prevWeek(w))) continue;
    let length = 0;
    for (let x = w; hits.has(x); x = nextWeek(x)) length++;
    best = Math.max(best, length);
  }
  return best;
}
