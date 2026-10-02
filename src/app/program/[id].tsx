import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Screen } from '@/components/screen';
import { Button, Card, Chip, ProgressBar, T, haptic } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { getExercise } from '@/lib/exercises';
import { formatTarget } from '@/lib/format';
import {
  getProgram,
  isCustomProgram,
  isSessionDone,
  lighterReason,
  planProgress,
  type PlanSession,
} from '@/lib/programs';
import { bucket } from '@/lib/analytics';
import { track } from '@/services/analytics';
import { useGymmy } from '@/store/gymmy';
import { usePlanAdvice } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

export default function ProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = getProgram(id);
  const plan = useGymmy((s) => s.plan);
  const workouts = useGymmy((s) => s.workouts);
  const hasActive = useGymmy((s) => s.active !== null);
  const { startPlan, leavePlan, startPlanSession } = useGymmy.getState();

  const enrolled = plan?.programId === id;
  const progress = program ? planProgress(program, workouts, enrolled ? plan!.startedAt : Infinity) : null;
  const [week, setWeek] = useState<number | null>(null);
  const advice = usePlanAdvice(enrolled ? program : undefined, progress);
  const reason = advice ? lighterReason(advice) : undefined;

  if (!program || !progress) {
    return (
      <Screen header={<BackHeader title="Plan not found" />}>
        <T variant="body" color={colors.textDim}>
          This training plan doesn’t exist anymore.
        </T>
      </Screen>
    );
  }

  const shownWeek = week ?? (enrolled ? progress.currentWeek : 1);
  const sessions = program.week(shownWeek);

  const begin = (session: number, light = false) => {
    if (hasActive) {
      confirm('Workout in progress', 'Finish or discard your current workout first.', 'Open it', () =>
        router.push('/workout'),
      );
      return;
    }
    haptic('medium');
    startPlanSession({ programId: program.id, week: shownWeek, session, ...(light ? { light } : {}) });
    router.push('/workout');
  };

  const join = () => {
    const switching = plan && plan.programId !== program.id;
    const go = () => {
      haptic('success');
      startPlan(program.id);
      track({ event: 'plan_start', props: { program: program.id } });
      setWeek(null);
    };
    if (switching) {
      const current = getProgram(plan.programId)?.name ?? 'your current plan';
      confirm(`Switch to ${program.name}?`, `You’ll leave ${current}. Finished workouts stay in your history.`, 'Switch', go);
    } else {
      go();
    }
  };

  return (
    <Screen
      header={
        <BackHeader
          title={program.name}
          subtitle={program.tagline}
          right={
            isCustomProgram(program.id) ? (
              <Button
                title="Edit"
                variant="secondary"
                onPress={() => router.push({ pathname: '/plan-edit', params: { id: program.id } })}
              />
            ) : undefined
          }
        />
      }>
      <Card style={{ gap: space.md }}>
        <View style={styles.hero}>
          <T style={{ fontSize: 44 }}>{program.emoji}</T>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.tags}>
              {[`${program.weeks} weeks`, `${program.daysPerWeek} days/week`, program.level, ...program.tags].map((t) => (
                <View key={t} style={styles.tag}>
                  <T variant="label" color={colors.textDim}>
                    {t}
                  </T>
                </View>
              ))}
            </View>
          </View>
        </View>
        <T variant="body" color={colors.textDim}>
          {program.description}
        </T>
        {enrolled ? (
          <View style={{ gap: space.sm }}>
            <View style={styles.progressRow}>
              <T variant="heading">
                {progress.next ? `Week ${progress.currentWeek} of ${program.weeks}` : 'Plan complete 🎉'}
              </T>
              <T variant="caption" color={colors.textDim}>
                {progress.completed}/{progress.total} sessions
              </T>
            </View>
            <ProgressBar progress={progress.completed / progress.total} />
          </View>
        ) : (
          <Button size="lg" title={plan ? 'Switch to this plan' : 'Start this plan'} onPress={join} />
        )}
      </Card>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weeks}
        contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }}>
        {Array.from({ length: program.weeks }, (_, i) => i + 1).map((w) => {
          const finished =
            enrolled && Array.from({ length: program.daysPerWeek }, (_, s) => s + 1).every((s) => isSessionDone(progress, w, s));
          return (
            <Chip key={w} label={`${finished ? '✓ ' : ''}Week ${w}`} active={w === shownWeek} onPress={() => setWeek(w)} />
          );
        })}
      </ScrollView>

      {sessions.map((session, i) => {
        const n = i + 1;
        const done = enrolled && isSessionDone(progress, shownWeek, n);
        const isNext = enrolled && progress.next?.week === shownWeek && progress.next.session === n;
        return (
          <SessionCard
            key={`${shownWeek}-${n}`}
            index={n}
            session={session}
            done={done}
            highlight={isNext}
            onStart={enrolled ? () => begin(n) : undefined}
            lighter={isNext && reason ? { reason, onStart: () => begin(n, true) } : undefined}
          />
        );
      })}

      {enrolled && (
        <Button
          title="Leave plan"
          variant="ghost"
          style={{ marginTop: space.lg }}
          onPress={() =>
            confirm('Leave this plan?', 'Your finished workouts stay in your history.', 'Leave', () => {
              leavePlan();
              track({ event: 'plan_leave', props: { program: program.id, done: bucket(progress.completed / progress.total * 100, [1, 25, 50, 75, 100]) } });
              setWeek(null);
            })
          }
        />
      )}
    </Screen>
  );
}

function SessionCard({
  index,
  session,
  done,
  highlight,
  onStart,
  lighter,
}: {
  index: number;
  session: PlanSession;
  done: boolean;
  highlight: boolean;
  onStart?: () => void;
  lighter?: { reason: string; onStart: () => void };
}) {
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  return (
    <Card style={[styles.session, highlight && styles.next, done && { opacity: 0.65 }]}>
      <View style={styles.sessionHead}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T variant="label" color={highlight ? colors.accent : colors.textFaint}>
            {highlight ? 'Up next' : `Day ${index}`}
          </T>
          <T variant="heading">
            {done ? '✓ ' : ''}
            {session.name}
          </T>
          <T variant="caption" color={colors.textDim}>
            {session.focus}
          </T>
        </View>
        {onStart && (
          <Button
            title={done ? 'Redo' : 'Start'}
            variant={highlight ? 'primary' : 'secondary'}
            testID={`plan-day-${index}-start`}
            onPress={onStart}
          />
        )}
      </View>
      {session.exercises.map((e) => (
        <View key={e.exerciseId} style={styles.exercise}>
          <T variant="body" style={{ flex: 1 }} numberOfLines={1}>
            {getExercise(e.exerciseId).name}
          </T>
          <T variant="caption" color={colors.accent}>
            {formatTarget(e, units)}
          </T>
        </View>
      ))}
      {lighter && (
        <View style={styles.lighter}>
          <T variant="caption" color={colors.textDim} style={{ flex: 1 }}>
            {lighter.reason}
          </T>
          <Button title="Lighter" variant="secondary" onPress={lighter.onStart} />
        </View>
      )}
      {session.exercises.some((e) => e.note) && (
        <T variant="caption" color={colors.textFaint}>
          {session.exercises
            .filter((e) => e.note)
            .map((e) => `${getExercise(e.exerciseId).name}: ${e.note}`)
            .join('\n')}
        </T>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.cardHigh },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  weeks: { marginHorizontal: -space.lg, marginVertical: space.lg, flexGrow: 0, flexShrink: 0 },
  session: { gap: space.sm, marginBottom: space.sm },
  next: { borderWidth: 1, borderColor: colors.accent },
  sessionHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  exercise: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  lighter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
  },
});
