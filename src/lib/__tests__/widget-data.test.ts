import { widgetTimeline } from '../widget-data';

// Wednesday 7 Oct 2026; trained Monday and Tuesday this week, and three days in each of the last two weeks.
const day = (y: number, m: number, d: number) => new Date(y, m, d, 18).getTime();
const times = [
  day(2026, 9, 5),
  day(2026, 9, 6),
  ...[22, 24, 26].map((d) => day(2026, 8, d)),
  ...[29, 30].map((d) => day(2026, 8, d)),
  day(2026, 9, 2),
];
const now = new Date(2026, 9, 7, 10).getTime();

describe('widgetTimeline', () => {
  const [today, monday] = widgetTimeline({
    workoutTimes: times,
    goal: 3,
    buddy: 'Kong',
    next: 'Push',
    nextFrom: 'Kong’s pick',
    now,
  });

  it('shows this week and the streak now', () => {
    expect(today.props).toMatchObject({ done: 2, goal: 3, buddy: 'Kong', next: 'Push' });
    expect(today.props.week).toEqual([true, true, false, false, false, false, false]);
    expect(today.props.streak).toBe(2);
  });

  it('resets the week at next Monday midnight', () => {
    expect(monday.date.getDay()).toBe(1);
    expect(monday.date.getHours()).toBe(0);
    expect(monday.props.done).toBe(0);
    expect(monday.props.week.every((d) => !d)).toBe(true);
  });
});
