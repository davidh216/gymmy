// Demo history for store screenshots: ~7 weeks of full-body training, then 3½ weeks of a
// generated "Muscle · 4 days" plan. Today is Thu Oct 15 2026; Upper B (week 4) is next.
const LB = 2.20462;
const kg = (lb) => lb / LB;
const e1rm = (w, r) => (r === 1 ? w : w * (1 + r / 30));
const day = (y, m, d, h = 17, min = 30) => new Date(y, m - 1, d, h, min).getTime();
const dkey = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

module.exports = function seed(state, programId, program) {
  let n = 0;
  const id = (p) => `${p}${++n}`;
  const workouts = [];
  const bests = new Map();
  const lift = (exerciseId, lb, reps, extra = {}) => ({
    id: id('e'),
    exerciseId,
    ...extra,
    sets: reps.map((r) => ({ id: id('s'), weight: kg(lb), reps: r, done: true })),
  });
  const body = (exerciseId, reps) => ({
    id: id('e'),
    exerciseId,
    sets: reps.map((r) => ({ id: id('s'), reps: r, done: true })),
  });
  const run = (km, minutes) => ({
    id: id('e'),
    exerciseId: 'run',
    sets: [{ id: id('s'), distance: km, minutes, done: true }],
  });
  const add = (end, name, exercises, mins = 58, plan) => {
    const prs = [];
    for (const e of exercises) {
      const scores = e.sets.filter((s) => s.weight && s.reps).map((s) => e1rm(s.weight, s.reps));
      if (!scores.length) continue;
      const top = Math.max(...scores);
      const prev = bests.get(e.exerciseId);
      if (prev !== undefined && top > prev + 1e-6) prs.push({ exerciseId: e.exerciseId, value: top, previous: prev });
      if (prev === undefined || top > prev) bests.set(e.exerciseId, top);
    }
    const sets = exercises.reduce((a, e) => a + e.sets.length, 0);
    workouts.push({
      id: id('w'),
      name,
      startedAt: end - mins * 60000,
      endedAt: end,
      exercises,
      plan,
      location: { name: 'Iron Temple', area: 'Downtown', gymId: 'iron-temple' },
      companionId: 'kong',
      xp: 40 + sets * 3 + prs.length * 25,
      gems: 5 + prs.length * 5,
      prs,
    });
  };

  // Before the plan: Mon/Wed/Fri lifting, Saturday runs (Aug 3 – Sep 19).
  for (let w = 0; w < 7; w++) {
    const mon = new Date(2026, 7, 3 + w * 7);
    const d = (o, h) => day(mon.getFullYear(), mon.getMonth() + 1, mon.getDate() + o, h);
    add(d(0, 18), 'Full body', [
      lift('squat', 205 + w * 5, [5, 5, 5, 5]),
      lift('bench_press', 165 + w * 5, [5, 5, 5, 5]),
      lift('barbell_row', 135 + w * 5, [8, 8, 8]),
    ]);
    add(d(2, 18), 'Pull day', [
      lift('deadlift', 255 + w * 10, [5, 5, 5]),
      lift('overhead_press', 105 + Math.floor(w / 2) * 5, [6, 6, 6]),
      body('pull_up', [8, 7, 6]),
    ]);
    add(d(4, 18), 'Full body', [
      lift('squat', 205 + w * 5, [5, 5, 5]),
      lift('bench_press', 165 + w * 5, [5, 5, 5]),
      lift('lat_pulldown', 120 + w * 5, [10, 10, 10]),
    ]);
    if (w !== 3) add(d(5, 9), 'Morning run', [run(5 + (w % 3), 27 - w * 0.3 + (w % 3) * 5.4)], 32);
  }

  // The plan: Mon/Tue/Thu/Sat from Sep 21. Weekly load bumps on the main lifts.
  const start = day(2026, 9, 21, 7, 0);
  const main = {
    bench_press: 185,
    barbell_row: 155,
    squat: 245,
    overhead_press: 115,
    lat_pulldown: 150,
    romanian_deadlift: 225,
    leg_press: 360,
  };
  const accessory = {
    overhead_press: 85,
    lat_pulldown: 120,
    barbell_curl: 65,
    leg_curl: 90,
    leg_press: 290,
    calf_raise: 180,
    cable_crunch: 70,
    bench_press: 155,
    barbell_row: 135,
    lateral_raise: 20,
  };
  const offsets = [0, 1, 3, 5];
  const last = new Map();
  for (let week = 1; week <= 4; week++) {
    for (let s = 1; s <= 4; s++) {
      if (week === 4 && s > 2) break;
      const session = program.days[s - 1];
      const t = start + ((week - 1) * 7 + offsets[s - 1]) * 86400000 + (s === 4 ? 2 : 10.5) * 3600000;
      const exercises = session.exercises.map((x, i) => {
        const heavy = i === 0 || (i === 1 && x.reps.startsWith('6'));
        const base = (heavy ? main : accessory)[x.exerciseId] ?? 60;
        const lb = base + (heavy ? (week - 1) * 5 : Math.floor((week - 1) / 2) * 5);
        const lo = parseInt(x.reps, 10),
          hi = parseInt(x.reps.split('–')[1] ?? x.reps, 10);
        const reps = Array.from({ length: x.sets }, (_, k) =>
          Math.max(lo, hi - (k >= x.sets - 1 && week % 2 && i > 1 ? 1 : 0)),
        );
        const key = `${s}:${i}`;
        const prev = last.get(key);
        last.set(key, lb);
        const coach = prev
          ? {
              call: lb > prev ? 'up' : 'reps',
              weight: kg(lb),
              reps: lb > prev ? lo : Math.min(...reps),
              from: kg(prev),
            }
          : undefined;
        return lift(x.exerciseId, lb, reps, { target: { sets: x.sets, reps: x.reps }, ...(coach ? { coach } : {}) });
      });
      add(t, session.name, exercises, 62, { programId, week, session: s });
    }
  }
  workouts.sort((a, b) => b.endedAt - a.endedAt);

  const checkIns = {};
  for (let i = 0; i < 12; i++) {
    const t = day(2026, 10, 15 - i, 7, 10);
    const k = dkey(t);
    checkIns[k] = {
      date: k,
      at: t,
      rest: [2, 4, 9, 11].includes(i),
      activities: i === 4 ? ['stretch'] : [],
      sleepHours: [7.8, 7.2, 8.1, 6.9, 8.4, 7.5, 7.0, 7.9, 8.2, 6.8, 7.6, 8.0][i],
      energy: i === 3 ? 3 : 4,
      soreness: i % 3 === 0 ? 2 : 1,
      stress: 2,
    };
  }
  const weighIns = {};
  for (let w = 0; w < 11; w++) {
    const t = day(2026, 8, 2 + w * 7, 8, 0);
    const k = dkey(t);
    weighIns[k] = { date: k, kg: kg(178 + w * 0.45 + (w % 2 ? 0.4 : 0)), at: t };
  }
  const xp = workouts.reduce((a, w) => a + w.xp, 0);

  Object.assign(state, {
    profile: {
      ...state.profile,
      weeklyGoal: 4,
      units: 'lb',
      weightReview: { enabled: false },
      body: { heightCm: 180, birthYear: 1994, sex: 'male' },
    },
    workouts,
    xp,
    gems: 340,
    collection: {
      kong: { stars: 3, obtainedAt: day(2026, 8, 1) },
      blaze: { stars: 1, obtainedAt: day(2026, 8, 20) },
      mochi: { stars: 2, obtainedAt: day(2026, 9, 5) },
      orca: { stars: 1, obtainedAt: day(2026, 10, 2) },
    },
    companionId: 'kong',
    plan: { programId, startedAt: start },
    checkIns,
    weighIns,
    reminders: { training: { days: [1, 2, 4, 6], hour: 17, minute: 0 }, recap: true },
    nudgesSeen: { reminders: day(2026, 8, 10), health: day(2026, 8, 12), body: day(2026, 8, 14) },
  });
  return state;
};
