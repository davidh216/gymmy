import { StyleSheet, View } from 'react-native';

import { T } from '@/components/ui';
import type { MuscleState } from '@/lib/recovery';
import { colors, space } from '@/theme';

type Group = MuscleState['group'];
/** x, y, width, height on a 100 × 196 body, plus the muscle group it shows (none for head/neck). */
type Part = [x: number, y: number, w: number, h: number, group?: Group];

const FRONT: Part[] = [
  [40, 0, 20, 22],
  [46, 20, 8, 7],
  [22, 27, 16, 14, 'shoulders'],
  [62, 27, 16, 14, 'shoulders'],
  [38, 28, 11.5, 20, 'chest'],
  [50.5, 28, 11.5, 20, 'chest'],
  [19, 42, 11, 30, 'biceps'],
  [70, 42, 11, 30, 'biceps'],
  [15, 74, 10, 30, 'biceps'],
  [75, 74, 10, 30, 'biceps'],
  [38, 50, 24, 38, 'core'],
  [35, 90, 14.5, 56, 'legs'],
  [50.5, 90, 14.5, 56, 'legs'],
  [36, 150, 12, 44, 'legs'],
  [52, 150, 12, 44, 'legs'],
];

const BACK: Part[] = [
  [40, 0, 20, 22],
  [36, 20, 28, 10, 'back'],
  [22, 27, 14, 14, 'shoulders'],
  [64, 27, 14, 14, 'shoulders'],
  [36, 32, 13.5, 30, 'back'],
  [50.5, 32, 13.5, 30, 'back'],
  [19, 42, 11, 30, 'triceps'],
  [70, 42, 11, 30, 'triceps'],
  [15, 74, 10, 30, 'triceps'],
  [75, 74, 10, 30, 'triceps'],
  [40, 64, 20, 24, 'core'],
  [35, 90, 14.5, 18, 'legs'],
  [50.5, 90, 14.5, 18, 'legs'],
  [35, 110, 14.5, 36, 'legs'],
  [50.5, 110, 14.5, 36, 'legs'],
  [36, 150, 12, 44, 'legs'],
  [52, 150, 12, 44, 'legs'],
];

const BODY_H = 196;

export function recoveryColor(recovered: number) {
  return recovered >= 0.9 ? colors.accent : recovered >= 0.6 ? colors.flame : colors.danger;
}

export function recoveryLabel(recovered: number) {
  return recovered >= 0.9 ? 'Fresh' : recovered >= 0.6 ? 'Recovering' : 'Fatigued';
}

/** Front and back body figures, each muscle group colored by how recovered it is. */
export function MuscleMap({ muscles, width = 120 }: { muscles: MuscleState[]; width?: number }) {
  const byGroup = new Map(muscles.map((m) => [m.group, m.recovered]));
  const summary = muscles.map((m) => `${m.group} ${recoveryLabel(m.recovered).toLowerCase()}`).join(', ');
  return (
    <View accessible accessibilityLabel={`Muscle recovery: ${summary}`} style={{ gap: space.md }}>
      <View style={styles.figures}>
        <Figure parts={FRONT} byGroup={byGroup} width={width} label="Front" />
        <Figure parts={BACK} byGroup={byGroup} width={width} label="Back" />
      </View>
      <View style={styles.legend}>
        {[
          ['Fresh', colors.accent],
          ['Recovering', colors.flame],
          ['Fatigued', colors.danger],
        ].map(([label, color]) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: color }]} />
            <T variant="caption" color={colors.textDim}>
              {label}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

function Figure({
  parts,
  byGroup,
  width,
  label,
}: {
  parts: Part[];
  byGroup: Map<Group, number>;
  width: number;
  label: string;
}) {
  const s = width / 100;
  return (
    <View style={{ alignItems: 'center', gap: space.xs }}>
      <View style={{ width, height: BODY_H * s }}>
        {parts.map(([x, y, w, h, group], i) => {
          const recovered = group ? byGroup.get(group) : undefined;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: x * s,
                top: y * s,
                width: w * s,
                height: h * s,
                borderRadius: (Math.min(w, h) * s) / 2.2,
                backgroundColor: recovered === undefined ? colors.cardHigh : recoveryColor(recovered),
                // Fresh muscles fade back so the tired ones stand out.
                opacity: recovered === undefined ? 1 : recovered >= 0.9 ? 0.35 : 0.9,
              }}
            />
          );
        })}
      </View>
      <T variant="label" color={colors.textFaint}>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  figures: { flexDirection: 'row', justifyContent: 'space-evenly' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: space.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
});
