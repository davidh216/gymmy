import { useRef, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import type { ExerciseKind } from '@/lib/exercises';
import {
  distanceUnit,
  formatClock,
  fromDisplayDistance,
  fromDisplayWeight,
  parseClock,
  toDisplayDistance,
  toDisplayWeight,
} from '@/lib/format';
import type { SetEntry, Units } from '@/lib/types';
import { colors, radius } from '@/theme';

/** The boxes a set has, by exercise kind: weight × reps, reps, time, or distance + time. */
export type Field = 'weight' | 'reps' | 'minutes' | 'distance';

export type Column = {
  field: Field;
  label: string;
  /** Stored value -> text in the box. */
  format: (v: number) => string;
  /** Typed text -> stored value (undefined while incomplete or empty). */
  parse: (text: string) => number | undefined;
  keyboard: 'decimal-pad' | 'number-pad' | 'numbers-and-punctuation';
};

const decimal = (text: string) => {
  const n = parseFloat(text.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function setColumns(kind: ExerciseKind, units: Units): Column[] {
  const reps: Column = {
    field: 'reps',
    label: 'Reps',
    format: String,
    parse: (t) => decimal(t) && Math.round(decimal(t)!),
    keyboard: 'number-pad',
  };
  if (kind === 'weight') {
    return [
      {
        field: 'weight',
        label: units,
        format: (v) => String(toDisplayWeight(v, units)),
        parse: (t) => decimal(t) && fromDisplayWeight(decimal(t)!, units),
        keyboard: 'decimal-pad',
      },
      reps,
    ];
  }
  if (kind === 'reps') return [reps];
  if (kind === 'distance') {
    return [
      {
        field: 'distance',
        label: distanceUnit(units),
        format: (v) => String(toDisplayDistance(v, units)),
        parse: (t) => decimal(t) && fromDisplayDistance(decimal(t)!, units),
        keyboard: 'decimal-pad',
      },
      // Typed like a race clock, e.g. 25:30.
      { field: 'minutes', label: 'Time', format: formatClock, parse: parseClock, keyboard: 'numbers-and-punctuation' },
    ];
  }
  return [
    {
      field: 'minutes',
      label: 'Min',
      format: (v) => String(Math.round(v * 10) / 10),
      parse: decimal,
      keyboard: 'decimal-pad',
    },
  ];
}

/** Whether a set has enough to be checked off. Distance sets need a distance or a time. */
export function isLoggable(kind: ExerciseKind, cols: Column[], set: SetEntry) {
  if (kind === 'distance') return Boolean(set.distance || set.minutes);
  return cols.every((c) => (set[c.field] ?? 0) > 0);
}

export function SetInput({
  label,
  testID,
  column,
  value,
  placeholder,
  done,
  onChange,
}: {
  label: string;
  testID: string;
  column: Column;
  value: number | undefined;
  placeholder: string;
  done: boolean;
  onChange: (value: number | undefined) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const focused = useRef(false);
  const shown = draft ?? (value === undefined ? '' : column.format(value));
  return (
    <TextInput
      value={shown}
      onChangeText={(t) => {
        // iOS can send a stray change (often empty) as the keyboard closes; only typing counts.
        if (!focused.current || t === shown) return;
        setDraft(t);
        onChange(column.parse(t));
      }}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        setDraft(null);
      }}
      keyboardType={column.keyboard}
      selectTextOnFocus
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      accessibilityLabel={label}
      testID={testID}
      style={[styles.colInput, styles.input, done && styles.inputDone]}
    />
  );
}

const styles = StyleSheet.create({
  colInput: { flex: 1, minWidth: 0, textAlign: 'center' },
  input: {
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.cardHigh,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  inputDone: { backgroundColor: 'transparent' },
});
