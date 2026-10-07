import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Screen } from '@/components/screen';
import { CompanionAvatar } from '@/components/companion-avatar';
import { Button, Card, Icon, SectionHeader, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { coachReview, type CoachNote } from '@/lib/coach-review';
import { getCompanion } from '@/lib/companions';
import { MUSCLE_GROUPS, getExercise } from '@/lib/exercises';
import { formatDistanceKm, formatMinutes, formatScore, formatVolume } from '@/lib/format';
import { change, hasActivity, recapHeadline, recapShareText, shiftWeek, weekLabel, weekRecap } from '@/lib/recap';
import { dayKeyTime } from '@/lib/recovery';
import { activeDaysThisWeek, weekStart } from '@/lib/streaks';
import { track } from '@/services/analytics';
import { useCompanionName, useGymmy } from '@/store/gymmy';
import { useProgram } from '@/store/selectors';
import { colors, radius, space } from '@/theme';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function RecapScreen() {
  const params = useLocalSearchParams<{ week?: string }>();
  const now = useNow(60_000);
  const workouts = useGymmy((s) => s.workouts);
  const checkIns = useGymmy((s) => s.checkIns);
  const claimedMilestones = useGymmy((s) => s.claimedMilestones);
  const goal = useGymmy((s) => s.profile?.weeklyGoal ?? 3);
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const plan = useGymmy((s) => s.plan);
  const program = useProgram(plan?.programId);

  const thisWeek = weekStart(now);
  const [start, setStart] = useState(() => {
    const w = Number(params.week);
    return Number.isFinite(w) && w > 0 ? weekStart(w + 12 * 3_600_000) : shiftWeek(thisWeek, -1);
  });
  const r = weekRecap({
    start,
    workouts,
    checkIns,
    claimedMilestones,
    weeklyGoal: goal,
  });
  const coach = coachReview({
    start,
    workouts,
    checkIns,
    plan: program && plan && plan.startedAt < r.end ? { programId: program.id, daysPerWeek: program.daysPerWeek, name: program.name } : null,
  });
  const current = start === thisWeek;
  const earliest = workouts.length ? weekStart(Math.min(...workouts.map((w) => w.endedAt))) : thisWeek;

  const trained = activeDaysThisWeek(
    workouts.map((w) => w.endedAt),
    start,
  );
  const rested = activeDaysThisWeek(
    Object.values(checkIns)
      .filter((c) => c.rest)
      .map((c) => dayKeyTime(c.date)),
    start,
  );

  const share = async () => {
    const result = await Share.share({ message: recapShareText(r, units) });
    if (result.action === Share.sharedAction) track({ event: 'recap_share' });
  };

  const stats: { label: string; value: string; change?: string }[] = [
    {
      label: 'Workouts',
      value: String(r.workouts),
      change: change(r.workouts, r.previous.workouts),
    },
    {
      label: 'Sets',
      value: String(r.sets),
      change: change(r.sets, r.previous.sets),
    },
    {
      label: 'Time',
      value: r.minutes ? formatMinutes(r.minutes * 60_000) : '0m',
      change: change(r.minutes, r.previous.minutes),
    },
  ];
  if (r.volumeKg || r.previous.volumeKg) {
    stats.push({
      label: 'Volume',
      value: formatVolume(r.volumeKg, units),
      change: change(r.volumeKg, r.previous.volumeKg),
    });
  }
  if (r.distanceKm || r.previous.distanceKm) {
    stats.push({
      label: 'Distance',
      value: formatDistanceKm(r.distanceKm, units),
      change: change(r.distanceKm, r.previous.distanceKm),
    });
  }

  return (
    <Screen header={<BackHeader title="Weekly recap" />}>
      <View style={styles.nav}>
        <WeekArrow dir="back" disabled={start <= earliest} onPress={() => setStart(shiftWeek(start, -1))} />
        <T variant="heading">{current ? 'This week so far' : weekLabel(start)}</T>
        <WeekArrow dir="forward" disabled={current} onPress={() => setStart(shiftWeek(start, 1))} />
      </View>

      <Card style={[styles.hero, r.goalHit && styles.heroHit]}>
        <T style={{ fontSize: 44 }}>{r.workouts === 0 ? '💤' : r.goalHit ? '🏅' : '💪'}</T>
        <T variant="title" style={{ textAlign: 'center' }}>
          {recapHeadline(r)}
        </T>
        <T variant="caption" color={colors.textDim}>
          {r.days}/{r.goal} training days{r.goalHit ? ' · goal hit ✅' : ''}
        </T>
        <View style={styles.days}>
          {DAYS.map((d, i) => {
            const done = trained.has(i);
            const rest = !done && rested.has(i);
            return (
              <View key={i} style={[styles.day, done && styles.dayDone, rest && styles.dayRest]}>
                <T variant="caption" color={done ? colors.accentInk : colors.textDim}>
                  {done ? '✓' : rest ? '💤' : d}
                </T>
              </View>
            );
          })}
        </View>
      </Card>

      {!hasActivity(r) ? (
        <T variant="caption" color={colors.textFaint} style={styles.empty}>
          Nothing logged this week.
        </T>
      ) : (
        <>
          <View style={styles.grid}>
            {stats.map((s) => (
              <Card key={s.label} style={styles.stat}>
                <T variant="label" color={colors.textFaint}>
                  {s.label}
                </T>
                <T variant="title">{s.value}</T>
                {s.change ? (
                  <T variant="caption" color={s.change.startsWith('+') ? colors.accent : colors.textDim}>
                    {s.change} vs week before
                  </T>
                ) : null}
              </Card>
            ))}
          </View>

          <CoachNotes notes={coach.notes} setsByGroup={coach.setsByGroup} />

          {r.prs.length > 0 && (
            <>
              <SectionHeader title={`New bests · ${r.prs.length}`} />
              {r.prs.map((p) => {
                const ex = getExercise(p.exerciseId);
                return (
                  <Card key={p.exerciseId} style={styles.row}>
                    <T style={{ fontSize: 20 }}>🏆</T>
                    <T variant="body" style={{ flex: 1 }} numberOfLines={1}>
                      {ex.name}
                    </T>
                    <View style={{ alignItems: 'flex-end' }}>
                      <T variant="heading">{formatScore(ex.kind, p.value, units)}</T>
                      <T variant="caption" color={colors.textFaint}>
                        {[
                          ex.kind === 'weight' ? 'est. 1RM' : undefined,
                          p.previous > 0 ? `was ${formatScore(ex.kind, p.previous, units)}` : undefined,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </T>
                    </View>
                  </Card>
                );
              })}
            </>
          )}

          {(r.topExercise || r.milestones > 0) && <SectionHeader title="Highlights" />}
          {r.topExercise && (
            <Card style={styles.row}>
              <T style={{ fontSize: 20 }}>⭐</T>
              <T variant="body" style={{ flex: 1 }}>
                Most trained: {getExercise(r.topExercise.exerciseId).name}
              </T>
              <T variant="caption" color={colors.textDim}>
                {r.topExercise.sets} sets
              </T>
            </Card>
          )}
          {r.milestones > 0 && (
            <Card style={styles.row}>
              <T style={{ fontSize: 20 }}>💎</T>
              <T variant="body" style={{ flex: 1 }}>
                {r.milestones} milestone{r.milestones === 1 ? '' : 's'} earned
              </T>
            </Card>
          )}

          {r.checkIns > 0 && (
            <>
              <SectionHeader title="Recovery" />
              <Card style={styles.recovery}>
                <MiniStat label="Check-ins" value={`${r.checkIns}/7`} />
                <MiniStat label="Rest days" value={String(r.restDays)} />
                {r.sleepAvg !== undefined && (
                  <MiniStat label="Avg sleep" value={`${Math.round(r.sleepAvg * 10) / 10}h`} />
                )}
                {r.energyAvg !== undefined && (
                  <MiniStat label="Avg energy" value={`${Math.round(r.energyAvg * 10) / 10}/5`} />
                )}
              </Card>
            </>
          )}

          <Button
            title="Share my week"
            icon={{ ios: 'square.and.arrow.up', web: 'ios_share' }}
            size="lg"
            style={{ marginTop: space.lg }}
            onPress={share}
          />
          <T variant="caption" color={colors.textFaint} style={styles.empty}>
            Sharing sends your totals and new bests only, never sleep or recovery.
          </T>
        </>
      )}
    </Screen>
  );
}

function WeekArrow({ dir, disabled, onPress }: { dir: 'back' | 'forward'; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={dir === 'back' ? 'Previous week' : 'Next week'}
      style={[styles.arrow, disabled && { opacity: 0.3 }]}>
      <Icon
        name={
          dir === 'back' ? { ios: 'chevron.left', web: 'chevron_left' } : { ios: 'chevron.right', web: 'chevron_right' }
        }
        size={16}
      />
    </Pressable>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, minWidth: 64, gap: 2 }}>
      <T variant="heading">{value}</T>
      <T variant="label" color={colors.textFaint}>
        {label}
      </T>
    </View>
  );
}

const NOTE_COLOR: Record<CoachNote['tone'], string> = { good: colors.accent, tip: colors.text, warn: colors.flame };

/** The buddy's read on the week: plan, targets, muscles left out, when to ease off. */
function CoachNotes({
  notes,
  setsByGroup,
}: {
  notes: CoachNote[];
  setsByGroup: ReturnType<typeof coachReview>['setsByGroup'];
}) {
  const companionId = useGymmy((s) => s.companionId);
  const buddy = useCompanionName(companionId);
  const groups = MUSCLE_GROUPS.filter((g) => g.id !== 'cardio' && setsByGroup[g.id]);
  if (!notes.length && !groups.length) return null;
  return (
    <>
      <SectionHeader title={`${buddy}’s notes`} />
      <Card style={styles.coach} testID="coach-review">
        <View style={styles.coachTop}>
          <CompanionAvatar companion={getCompanion(companionId)} size={36} ring={false} />
          <View style={{ flex: 1, gap: space.xs }}>
            {notes.map((n) => (
              <T key={n.id} variant="body" color={NOTE_COLOR[n.tone]}>
                {n.emoji} {n.text}
              </T>
            ))}
            {!notes.length && (
              <T variant="body" color={colors.textDim}>
                Keep logging and I’ll keep moving the weights.
              </T>
            )}
          </View>
        </View>
        {groups.length > 0 && (
          <T variant="caption" color={colors.textDim}>
            Sets by muscle: {groups.map((g) => `${g.label} ${setsByGroup[g.id]}`).join(' · ')}
          </T>
        )}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  coach: { gap: space.sm },
  coachTop: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardHigh,
  },
  hero: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  heroHit: { borderWidth: 1, borderColor: colors.accent },
  days: { flexDirection: 'row', gap: 6, marginTop: space.sm },
  day: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardHigh,
  },
  dayDone: { backgroundColor: colors.accent },
  dayRest: { backgroundColor: 'rgba(167,139,250,0.18)' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.md,
  },
  stat: { flexBasis: '47%', flexGrow: 1, gap: 2, borderRadius: radius.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.sm,
    borderRadius: radius.md,
  },
  recovery: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  empty: { textAlign: 'center', marginTop: space.md },
});
