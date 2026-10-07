import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CompanionHero } from '@/components/companion-hero';
import { FirstWorkoutCard } from '@/components/first-workout-card';
import { MilestoneBanner } from '@/components/milestone-banner';
import { ReadinessCard } from '@/components/readiness-card';
import { CoachPickCard } from '@/components/coach-pick-card';
import { RecapCard } from '@/components/recap-card';
import { Screen } from '@/components/screen';
import { StatsAsk } from '@/components/stats-ask';
import { WeightReviewCard } from '@/components/weight-review-card';
import { WorkoutRow } from '@/components/workout-row';
import { Button, Card, GemCount, ProgressBar, SectionHeader, Stat, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { confirm } from '@/lib/confirm';
import { TEMPLATES, templateBlurb } from '@/lib/exercises';
import { formatDuration, greeting } from '@/lib/format';
import { PROGRAMS, lighterReason, planProgress } from '@/lib/programs';
import { dayKeyTime } from '@/lib/recovery';
import { activeDaysThisWeek } from '@/lib/streaks';
import { useGymmy } from '@/store/gymmy';
import { usePlanAdvice, useProgram, useProgress } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Today() {
  const name = useGymmy((s) => s.profile?.name ?? '');
  const gems = useGymmy((s) => s.gems);
  const workouts = useGymmy((s) => s.workouts);
  const startWorkout = useGymmy((s) => s.startWorkout);
  const saved = useGymmy((s) => s.templates);
  const deleteTemplate = useGymmy((s) => s.deleteTemplate);
  const { streak, thisWeek, goal, activeDays } = useProgress();
  const checkIns = useGymmy((s) => s.checkIns);
  const now = useNow(60_000);
  const restDays = activeDaysThisWeek(
    Object.values(checkIns)
      .filter((c) => c.rest)
      .map((c) => dayKeyTime(c.date)),
    now,
  );
  const today = (new Date(now).getDay() + 6) % 7;

  const start = (opts?: Parameters<typeof startWorkout>[0]) => {
    startWorkout(opts);
    router.push('/workout');
  };

  return (
    <Screen
      header={
        <View style={styles.header} testID="today">
          <View style={{ flex: 1 }}>
            <T variant="caption" color={colors.textDim}>
              {greeting(now)},
            </T>
            <T variant="hero" numberOfLines={1}>
              {name} 👋
            </T>
          </View>
          <GemCount gems={gems} />
        </View>
      }>
      <CompanionHero />

      <FirstWorkoutCard />

      <Card style={styles.weekCard}>
        <View style={styles.statsRow}>
          <Stat value={`🔥 ${streak}w`} label="Streak" color={colors.flame} />
          <Stat
            value={`${thisWeek}/${goal}`}
            label="This week"
            color={thisWeek >= goal ? colors.accent : colors.text}
          />
          <Stat value={`${workouts.length}`} label="Workouts" />
        </View>
        <View style={styles.days}>
          {DAYS.map((d, i) => {
            const done = activeDays.has(i);
            const rest = !done && restDays.has(i);
            return (
              <View key={i} style={styles.dayCol}>
                <View
                  style={[
                    styles.day,
                    done && styles.dayDone,
                    rest && styles.dayRest,
                    i === today && !done && styles.dayToday,
                  ]}>
                  <T variant="caption" color={done ? colors.accentInk : colors.textDim}>
                    {done ? '✓' : rest ? '💤' : d}
                  </T>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <RecapCard />

      <WeightReviewCard />

      <MilestoneBanner />

      <View style={{ marginTop: space.md }}>
        <ReadinessCard compact />
      </View>

      <ActiveOrStart onStart={() => start()} />

      <CoachPickCard />

      <PlanSection />

      <SectionHeader title="Quick start" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.templates}
        contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }}>
        {[...saved.map((t) => ({ ...t, blurb: templateBlurb(t.exerciseIds), mine: true })), ...TEMPLATES].map((t) => (
          <Card
            key={t.id}
            style={styles.template}
            onPress={() => start({ name: t.name, exerciseIds: t.exerciseIds })}
            onLongPress={
              'mine' in t
                ? () =>
                    confirm(`Delete “${t.name}”?`, 'This removes the template. Your workouts stay.', 'Delete', () =>
                      deleteTemplate(t.id),
                    )
                : undefined
            }>
            <T variant="heading" numberOfLines={1}>
              {'mine' in t ? '★ ' : ''}
              {t.name}
            </T>
            <T variant="caption" color={colors.textDim}>
              {t.blurb}
            </T>
            <T variant="caption" color={colors.accent} style={{ marginTop: space.sm }}>
              {t.exerciseIds.length} exercises →
            </T>
          </Card>
        ))}
      </ScrollView>

      {workouts.length > 0 && (
        <>
          <SectionHeader title="Recent" />
          {workouts.slice(0, 3).map((w) => (
            <WorkoutRow key={w.id} workout={w} />
          ))}
        </>
      )}

      <StatsAsk />
    </Screen>
  );
}

/** The plan you're following and its next session, or a way into the plans. */
function PlanSection() {
  const plan = useGymmy((s) => s.plan);
  const workouts = useGymmy((s) => s.workouts);
  const hasActive = useGymmy((s) => s.active !== null);
  const startPlanSession = useGymmy((s) => s.startPlanSession);
  const program = useProgram(plan?.programId);
  const advice = usePlanAdvice(program, program && plan ? planProgress(program, workouts, plan.startedAt) : null);

  if (!plan || !program) {
    return (
      <>
        <SectionHeader
          title="Training plans"
          action={
            <T variant="caption" color={colors.accent} onPress={() => router.push('/programs')}>
              See all
            </T>
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.templates}
          contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }}>
          <Card style={styles.template} onPress={() => router.push('/plan-generator')} testID="today-plan-generate">
            <T style={{ fontSize: 26 }}>✨</T>
            <T variant="heading">Build me a plan</T>
            <T variant="caption" color={colors.textDim} numberOfLines={1}>
              Made for your week
            </T>
            <T variant="caption" color={colors.accent} style={{ marginTop: space.sm }}>
              5 questions →
            </T>
          </Card>
          {PROGRAMS.map((p) => (
            <Card
              key={p.id}
              style={styles.template}
              onPress={() => router.push({ pathname: '/program/[id]', params: { id: p.id } })}>
              <T style={{ fontSize: 26 }}>{p.emoji}</T>
              <T variant="heading">{p.name}</T>
              <T variant="caption" color={colors.textDim} numberOfLines={1}>
                {p.tagline}
              </T>
              <T variant="caption" color={colors.accent} style={{ marginTop: space.sm }}>
                {p.weeks} weeks →
              </T>
            </Card>
          ))}
        </ScrollView>
      </>
    );
  }

  const progress = planProgress(program, workouts, plan.startedAt);
  const next = progress.next;
  const session = next ? program.week(next.week)[next.session - 1] : undefined;
  const reason = advice ? lighterReason(advice) : undefined;
  const begin = (light: boolean) => {
    if (!next) return;
    startPlanSession({ programId: program.id, ...next, ...(light ? { light } : {}) });
    router.push('/workout');
  };
  return (
    <>
      <SectionHeader title="Your plan" />
      <Card
        style={{ gap: space.sm }}
        onPress={() => router.push({ pathname: '/program/[id]', params: { id: program.id } })}>
        <View style={styles.planHead}>
          <T style={{ fontSize: 28 }}>{program.emoji}</T>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T variant="heading" numberOfLines={1}>
              {program.name}
            </T>
            <T variant="caption" color={colors.textDim}>
              {next ? `Week ${next.week} of ${program.weeks}` : 'Complete! 🎉'} · {progress.completed}/{progress.total} sessions
            </T>
          </View>
        </View>
        <ProgressBar progress={progress.completed / progress.total} height={6} />
        {next && session && (
          <View style={styles.planNext}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <T variant="label" color={colors.accent}>
                Up next
              </T>
              <T variant="heading" numberOfLines={1}>
                {session.name}
              </T>
              <T variant="caption" color={colors.textDim} numberOfLines={1}>
                {session.focus}
              </T>
            </View>
            {!hasActive && !reason && <Button title="Start" onPress={() => begin(false)} />}
          </View>
        )}
        {next && !hasActive && reason && (
          <View style={styles.lighter}>
            <T variant="caption" color={colors.textDim}>
              {advice?.lighter === 'readiness' ? '🔋 ' : '👋 '}
              {reason}
            </T>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Button title="Lighter session" style={{ flex: 1 }} onPress={() => begin(true)} testID="plan-start-lighter" />
              <Button title="Full session" variant="secondary" style={{ flex: 1 }} onPress={() => begin(false)} />
            </View>
          </View>
        )}
        {next && advice && advice.weeksBehind > 0 && (
          <T variant="caption" color={colors.textFaint}>
            {advice.weeksBehind === 1 ? '1 week' : `${advice.weeksBehind} weeks`} behind the calendar. No stress: the plan
            picks up where you left off.
          </T>
        )}
      </Card>
    </>
  );
}

function ActiveOrStart({ onStart }: { onStart: () => void }) {
  const active = useGymmy((s) => s.active);
  const now = useNow();
  if (active) {
    return (
      <Button
        size="lg"
        icon={{ ios: 'play.fill', web: 'play_arrow' }}
        title={`Resume · ${formatDuration(now - active.startedAt)}`}
        onPress={() => router.push('/workout')}
        style={styles.cta}
      />
    );
  }
  return (
    <Button
      size="lg"
      icon={{ ios: 'bolt.fill', web: 'bolt' }}
      title="Start empty workout"
      onPress={onStart}
      style={styles.cta}
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: space.lg, gap: space.md },
  weekCard: { marginTop: space.md, gap: space.lg },
  statsRow: { flexDirection: 'row' },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center' },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardHigh,
  },
  dayDone: { backgroundColor: colors.accent },
  dayRest: { backgroundColor: 'rgba(167,139,250,0.18)' },
  dayToday: { borderWidth: 2, borderColor: colors.accent },
  cta: { marginTop: space.lg },
  templates: { marginHorizontal: -space.lg },
  template: { width: 170, gap: 2, borderRadius: radius.md },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  lighter: { gap: space.sm, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  planNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.cardHigh,
  },
});
