import { applyTarget, heavierLoad, nextTarget, repRange } from "../coach";
import { fromDisplayWeight, toDisplayWeight } from "../format";
import type { SetEntry, Workout } from "../types";

const lb = (v: number) => fromDisplayWeight(v, "lb");
const showLb = (kg: number) => toDisplayWeight(kg, "lb");
let n = 0;
const sets = (
  weight: number,
  reps: number[],
  extra: Partial<SetEntry> = {},
): SetEntry[] =>
  reps.map((r) => ({ id: `s${n++}`, weight, reps: r, done: true, ...extra }));
const workout = (daysAgo: number, exerciseId: string, s: SetEntry[]): Workout =>
  ({
    id: `w${n++}`,
    name: "W",
    startedAt: Date.now() - daysAgo * 86_400_000 - 3_600_000,
    endedAt: Date.now() - daysAgo * 86_400_000,
    exercises: [{ id: `e${n++}`, exerciseId, sets: s }],
  }) as Workout;

describe("repRange", () => {
  it("reads plan rep strings", () => {
    expect(repRange("8–10")).toEqual([8, 10]);
    expect(repRange("8-10")).toEqual([8, 10]);
    expect(repRange("5")).toEqual([5, 5]);
    expect(repRange("2 lengths")).toBeUndefined();
    expect(repRange(undefined)).toBeUndefined();
  });
});

describe("heavierLoad", () => {
  it("adds one plate step on the step grid", () => {
    expect(showLb(heavierLoad(lb(225), "lb"))).toBe(230);
    expect(heavierLoad(100, "kg")).toBe(102.5);
  });
});

describe("nextTarget", () => {
  it("adds weight when every set hit the goal", () => {
    const t = nextTarget(
      "bench_press",
      [workout(2, "bench_press", sets(lb(225), [5, 5, 5]))],
      "lb",
    );
    expect(t).toMatchObject({ call: "up", reps: 5 });
    expect(showLb(t!.weight)).toBe(230);
  });

  it("holds the weight after a max-effort set", () => {
    const s = sets(lb(225), [5, 5, 5]);
    s[2].rpe = 10;
    expect(
      nextTarget("bench_press", [workout(2, "bench_press", s)], "lb"),
    ).toMatchObject({ call: "repeat" });
  });

  it("repeats the weight when reps were missed", () => {
    const t = nextTarget(
      "bench_press",
      [workout(2, "bench_press", sets(lb(225), [5, 5, 3]))],
      "lb",
    );
    expect(t).toMatchObject({ call: "repeat", reps: 5 });
    expect(showLb(t!.weight)).toBe(225);
  });

  it("deloads about 10% after two stalled sessions at the same weight", () => {
    const history = [
      workout(5, "bench_press", sets(lb(225), [5, 5, 4])),
      workout(2, "bench_press", sets(lb(225), [5, 4, 4])),
    ];
    const t = nextTarget("bench_press", history, "lb");
    expect(t?.call).toBe("deload");
    expect(showLb(t!.weight)).toBe(200);
  });

  it("keeps going when the second miss still got more reps", () => {
    const history = [
      workout(5, "bench_press", sets(lb(225), [5, 4, 3])),
      workout(2, "bench_press", sets(lb(225), [5, 5, 4])),
    ];
    expect(nextTarget("bench_press", history, "lb")?.call).toBe("repeat");
  });

  it("climbs reps inside a plan range before adding weight", () => {
    const history = [workout(2, "bench_press", sets(60, [8, 9, 8]))];
    expect(nextTarget("bench_press", history, "kg", [8, 10])).toMatchObject({
      call: "reps",
      weight: 60,
      reps: 9,
    });
    const top = [workout(2, "bench_press", sets(60, [10, 10, 10]))];
    expect(nextTarget("bench_press", top, "kg", [8, 10])).toMatchObject({
      call: "up",
      weight: 62.5,
      reps: 8,
    });
  });

  it("ignores warm-ups and back-off sets", () => {
    const s = [
      ...sets(40, [5], { warmup: true }),
      ...sets(100, [5, 5]),
      ...sets(80, [3]),
    ];
    expect(nextTarget("squat", [workout(1, "squat", s)], "kg")).toMatchObject({
      call: "up",
      weight: 102.5,
    });
  });

  it("has nothing to say without weighted history", () => {
    expect(nextTarget("bench_press", [], "lb")).toBeNull();
    expect(
      nextTarget(
        "plank",
        [workout(1, "plank", [{ id: "p", minutes: 1, done: true }])],
        "lb",
      ),
    ).toBeNull();
  });
});

describe("applyTarget", () => {
  it("moves only the working sets at the top weight", () => {
    const s = [
      ...sets(40, [5], { warmup: true }),
      ...sets(100, [5, 5]),
      ...sets(80, [8]),
    ];
    const out = applyTarget(s, {
      call: "up",
      weight: 102.5,
      reps: 5,
      from: 100,
    });
    expect(out.map((x) => x.weight)).toEqual([40, 102.5, 102.5, 80]);
  });
});
