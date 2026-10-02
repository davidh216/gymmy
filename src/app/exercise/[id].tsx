import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Screen } from '@/components/screen';
import { Card, Chip, SectionHeader, T } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { getExercise, type ExerciseKind } from '@/lib/exercises';
import { formatClock, formatDate, formatDistanceKm, formatSet, toDisplayWeight } from '@/lib/format';
import { RANGES, inRange, progressMetric, progressSeries, progressSummary, type ProgressRange } from '@/lib/progress';
import type { Units } from '@/lib/types';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

const CHART_H = 180;
const DOT = 10;
const MAX_POINTS = 40;

/** A metric value in the person's units. */
function formatValue(kind: ExerciseKind, v: number, units: Units): string {
  if (kind === 'weight') return `${Math.round(toDisplayWeight(v, units))} ${units}`;
  if (kind === 'reps') return `${Math.round(v)} reps`;
  if (kind === 'duration') return formatClock(v);
  return formatDistanceKm(v, units);
}

/** Three tidy gridline values spanning the data, with some headroom. */
function scale(values: number[]): { lo: number; hi: number } {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.15, max * 0.05, 1e-6);
  return { lo: Math.max(0, min - pad), hi: max + pad };
}

export default function ExerciseProgress() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = getExercise(id);
  const workouts = useGymmy((s) => s.workouts);
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const now = useNow(60_000);
  const [range, setRange] = useState<ProgressRange>('3m');
  const [selected, setSelected] = useState<number | null>(null);

  const all = progressSeries(id, workouts);
  const points = inRange(all, range, now).slice(-MAX_POINTS);
  const summary = progressSummary(points);
  const metric = progressMetric(exercise.kind);
  const fmt = (v: number) => formatValue(exercise.kind, v, units);
  const pick = selected !== null ? points[selected] : undefined;

  return (
    <Screen header={<BackHeader title={exercise.name} subtitle={metric.label} />}>
      <View style={styles.ranges}>
        {RANGES.map((r) => (
          <Chip
            key={r.id}
            label={r.label}
            active={range === r.id}
            onPress={() => {
              setRange(r.id);
              setSelected(null);
            }}
          />
        ))}
      </View>

      {!summary ? (
        <Card style={styles.empty}>
          <T style={{ fontSize: 36 }}>📈</T>
          <T variant="heading">{all.length ? 'Nothing in this range' : 'No sessions yet'}</T>
          <T variant="caption" color={colors.textDim} style={{ textAlign: 'center' }}>
            {all.length ? 'Pick a longer range to see your history.' : `Log ${exercise.name} and your progress shows up here.`}
          </T>
        </Card>
      ) : (
        <Card style={{ gap: space.lg }}>
          <View style={{ gap: 2 }}>
            <T variant="label" color={colors.textFaint}>
              {pick ? formatDate(pick.endedAt) : `Best · ${metric.short}`}
            </T>
            <T style={styles.hero}>{fmt((pick ?? summary.best).value)}</T>
            <T variant="caption" color={colors.textDim}>
              {pick
                ? `${formatSet(pick.set, exercise.kind, units, { pace: true })}${pick.pr ? ' · New best 🏆' : ''}`
                : summary.sessions > 1
                  ? `${summary.change > 0 ? '+' : ''}${fmt(summary.change).replace(/^-?/, summary.change < 0 ? '−' : '')} since ${formatDate(points[0].endedAt)} · ${summary.sessions} sessions`
                  : '1 session so far'}
            </T>
          </View>
          <DotPlot points={points} fmt={fmt} selected={selected} onSelect={setSelected} />
          <T variant="caption" color={colors.textFaint}>
            {all.length > points.length && range === 'all' ? `Latest ${MAX_POINTS} sessions. ` : ''}Bigger dots are new bests. Tap a dot for that session.
          </T>
        </Card>
      )}

      {summary && (
        <>
          <SectionHeader title="Sessions" />
          {[...points].reverse().map((p) => (
            <Card key={p.workoutId} style={styles.row}>
              <T variant="body" style={{ flex: 1 }}>
                {formatDate(p.endedAt)}
              </T>
              <T variant="caption" color={colors.textDim}>
                {formatSet(p.set, exercise.kind, units)}
              </T>
              <T variant="heading" style={styles.rowValue}>
                {fmt(p.value)}
                {p.pr ? ' 🏆' : ''}
              </T>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

function DotPlot({
  points,
  fmt,
  selected,
  onSelect,
}: {
  points: { value: number; pr: boolean; workoutId: string }[];
  fmt: (v: number) => string;
  selected: number | null;
  onSelect: (i: number | null) => void;
}) {
  const { lo, hi } = scale(points.map((p) => p.value));
  const y = (v: number) => ((v - lo) / (hi - lo || 1)) * (CHART_H - DOT) + DOT / 2;
  const grid = [lo, (lo + hi) / 2, hi];

  return (
    <View>
      <View style={{ height: CHART_H }}>
        {grid.map((g, i) => (
          <View key={i} style={[styles.grid, { bottom: y(g) }]}>
            <T variant="caption" color={colors.textFaint} style={styles.gridLabel}>
              {fmt(g)}
            </T>
          </View>
        ))}
        <View style={styles.plot}>
          {points.map((p, i) => {
            const on = selected === i;
            return (
              <Pressable
                key={p.workoutId}
                style={styles.col}
                onPress={() => onSelect(on ? null : i)}
                accessibilityRole="button"
                accessibilityLabel={`${fmt(p.value)}${p.pr ? ', new best' : ''}`}>
                {on && <View style={styles.crosshair} />}
                <View
                  style={[
                    styles.dot,
                    { bottom: y(p.value) - DOT / 2 },
                    p.pr && styles.dotPr,
                    on && styles.dotOn,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ranges: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  empty: { alignItems: 'center', gap: space.xs, paddingVertical: space.xl },
  hero: { fontSize: 44, lineHeight: 52, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  gridLabel: { position: 'absolute', left: 0, top: 2 },
  plot: { position: 'absolute', top: 0, bottom: 0, left: 64, right: 0, flexDirection: 'row' },
  col: { flex: 1, alignItems: 'center' },
  crosshair: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: colors.textFaint },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.card,
  },
  dotPr: { width: DOT + 4, height: DOT + 4, borderRadius: (DOT + 4) / 2, marginBottom: -2 },
  dotOn: { borderColor: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm, borderRadius: radius.md },
  rowValue: { minWidth: 84, textAlign: 'right' },
});
