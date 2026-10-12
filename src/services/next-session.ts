import { coachPick } from '@/lib/coach-review';
import { getCompanion } from '@/lib/companions';
import { TEMPLATES } from '@/lib/exercises';
import { getProgram, planProgress } from '@/lib/programs';
import { muscleRecovery } from '@/lib/recovery';
import { useGymmy } from '@/store/gymmy';

/** Your buddy's name: the nickname you gave it, else the companion's own. */
export function buddyName(): string {
  const s = useGymmy.getState();
  return s.collection[s.companionId]?.nickname || getCompanion(s.companionId).name;
}

/** What to do next: the plan's next day, else the coach's pick from what's recovered. */
export function nextSession(now: number): { name: string; from: string } | undefined {
  const s = useGymmy.getState();
  const program = s.plan ? getProgram(s.plan.programId) : undefined;
  if (program && s.plan) {
    const next = planProgress(program, s.workouts, s.plan.startedAt).next;
    const day = next ? program.week(next.week)[next.session - 1] : undefined;
    if (day) return { name: day.name, from: program.name };
  }
  if (!s.workouts.length) return undefined;
  const pick = coachPick([...TEMPLATES, ...s.templates], muscleRecovery(s.workouts, now));
  return pick?.kind === 'session' ? { name: pick.name, from: `${buddyName()}’s pick` } : undefined;
}
