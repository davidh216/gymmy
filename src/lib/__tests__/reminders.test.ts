import { planReminders, reminderDayKey } from '../reminders';

// Wednesday 7 Oct 2026, 10:00 local.
const now = new Date(2026, 9, 7, 10).getTime();
const base = { now, buddy: 'Kong', trainedDays: new Set<string>(), weighInOn: true };

describe('planReminders', () => {
  it('plans training days at the chosen time for two weeks', () => {
    const r = planReminders({ ...base, settings: { training: { days: [1, 3, 5], hour: 18, minute: 30 } } });
    expect(r).toHaveLength(6);
    expect(r[0]).toMatchObject({ id: 'training-2026-10-07', url: '/' });
    expect(new Date(r[0].at).getHours()).toBe(18);
    expect(new Date(r[0].at).getMinutes()).toBe(30);
  });

  it('skips days already trained and times already past', () => {
    const trained = new Set([reminderDayKey(new Date(now))]);
    const r = planReminders({
      ...base,
      trainedDays: trained,
      settings: { training: { days: [3], hour: 18, minute: 0 } },
    });
    expect(r.map((x) => x.id)).toEqual(['training-2026-10-14']);
    const morning = planReminders({ ...base, settings: { training: { days: [3], hour: 7, minute: 0 } } });
    expect(morning[0].id).toBe('training-2026-10-14');
  });

  it('names the next session only for the next few days', () => {
    const r = planReminders({
      ...base,
      nextSession: 'Upper A',
      settings: { training: { days: [3], hour: 18, minute: 0 } },
    });
    expect(r[0].body).toMatch(/Upper A/);
    expect(r[1].body).not.toMatch(/Upper A/);
  });

  it('adds Sunday weigh-ins only when the weekly weigh-in is on, and Monday recaps', () => {
    const r = planReminders({ ...base, settings: { weighIn: true, recap: true } });
    expect(r.map((x) => x.id)).toEqual([
      'weigh-in-2026-10-11',
      'recap-2026-10-12',
      'weigh-in-2026-10-18',
      'recap-2026-10-19',
    ]);
    expect(planReminders({ ...base, weighInOn: false, settings: { weighIn: true } })).toEqual([]);
  });

  it('plans nothing when everything is off', () => {
    expect(planReminders({ ...base, settings: {} })).toEqual([]);
  });
});
