import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Screen } from '@/components/screen';
import { Button, Card, Chip, ProgressBar, T, haptic } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { getExercise } from '@/lib/exercises';
import { formatTarget } from '@/lib/format';
import { getProgram, isSessionDone, planProgress, type PlanSession } from '@/lib/programs';
import { useGymmy } from '@/store/gymmy';
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

  const begin = (session: number) => {
    if (hasActive) {
      confirm('Workout in progress', 'Finish or discard your current workout first.', 'Open it', () =>
        router.push('/workout'),
      );
      return;
    }
    haptic('medium');
    startPlanSession({ programId: program.id, week: shownWeek, session });
    router.push('/workout');
  };

  const join = () => {
    const switching = plan && plan.programId !== program.id;
    const go = () => {
      haptic('success');
      startPlan(program.id);
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
    <Screen header={<BackHeader title={program.name} subtitle={program.tagline} />}>
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
}: {
  index: number;
  session: PlanSession;
  done: boolean;
  highlight: boolean;
  onStart?: () => void;
}) {
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
          <Button title={done ? 'Redo' : 'Start'} variant={highlight ? 'primary' : 'secondary'} onPress={onStart} />
        )}
      </View>
      {session.exercises.map((e) => (
        <View key={e.exerciseId} style={styles.exercise}>
          <T variant="body" style={{ flex: 1 }} numberOfLines={1}>
            {getExercise(e.exerciseId).name}
          </T>
          <T variant="caption" color={colors.accent}>
            {formatTarget(e)}
          </T>
        </View>
      ))}
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
});
