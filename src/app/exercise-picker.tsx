import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Icon, T, haptic } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { MUSCLE_GROUPS, searchExercises, type MuscleGroup } from '@/lib/exercises';
import { formatAgo, formatSet } from '@/lib/format';
import { lastSessions } from '@/lib/records';
import { useExerciseSync } from '@/services/exercises';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

export default function ExercisePicker() {
  const insets = useSafeAreaInsets();
  const addExercises = useGymmy((s) => s.addExercises);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const workouts = useGymmy((s) => s.workouts);
  const custom = useGymmy((s) => s.customExercises);
  const community = useGymmy((s) => s.communityExercises);
  useExerciseSync();
  const now = useNow(60_000);
  const results = searchExercises(query, group, [...custom, ...community]);
  const last = lastSessions(workouts);

  const create = () =>
    router.push({
      pathname: '/exercise-edit',
      params: { name: query.trim(), add: '1', with: selected.join(',') },
    });

  const toggle = (id: string) => {
    haptic();
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    // Keeps the Add button above the keyboard while searching.
    <KeyboardAvoidingView
      style={[styles.root, { paddingBottom: insets.bottom + space.md }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <T variant="title">Add exercises</T>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <T variant="heading" color={colors.textDim}>
            Cancel
          </T>
        </Pressable>
      </View>
      <View style={styles.search}>
        <Icon name={{ ios: 'magnifyingglass', web: 'search' }} size={16} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises"
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }}>
        <Chip label="All" active={!group} onPress={() => setGroup(null)} />
        {MUSCLE_GROUPS.map((g) => (
          <Chip key={g.id} label={g.label} active={group === g.id} onPress={() => setGroup(g.id)} />
        ))}
      </ScrollView>
      <FlatList
        data={results}
        keyExtractor={(e) => e.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: space.lg }}
        renderItem={({ item }) => {
          const index = selected.indexOf(item.id);
          const on = index >= 0;
          const stats = last.get(item.id);
          return (
            <Pressable onPress={() => toggle(item.id)} style={[styles.row, on && styles.rowOn]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <T variant="heading" numberOfLines={1}>
                  {item.name}
                </T>
                <T variant="caption" color={colors.textFaint} numberOfLines={1}>
                  <T variant="caption" color={colors.textFaint} style={{ textTransform: 'capitalize' }}>
                    {item.group}
                  </T>
                  {item.source === 'custom' ? ' · Custom' : ''}
                  {stats && (
                    <T variant="caption" color={colors.textDim}>
                      {` · Last: ${formatSet(stats.top, item.kind, units)} · ${formatAgo(stats.endedAt, now)}`}
                    </T>
                  )}
                </T>
              </View>
              {item.source === 'custom' && (
                <Pressable
                  hitSlop={10}
                  style={styles.edit}
                  accessibilityLabel={`Edit ${item.name}`}
                  onPress={() => router.push({ pathname: '/exercise-edit', params: { id: item.id } })}>
                  <Icon name={{ ios: 'pencil', web: 'edit' }} size={16} color={colors.textFaint} />
                </Pressable>
              )}
              <View style={[styles.badge, on && styles.badgeOn]}>
                {on && (
                  <T variant="caption" color={colors.accentInk}>
                    {index + 1}
                  </T>
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <T variant="body" color={colors.textDim} style={{ textAlign: 'center', marginVertical: space.lg }}>
            No exercises match “{query}”.
          </T>
        }
        ListFooterComponent={
          <Pressable onPress={create} style={styles.create}>
            <Icon name={{ ios: 'plus', web: 'add' }} size={16} color={colors.accent} />
            <T variant="heading" color={colors.accent} numberOfLines={1} style={{ flexShrink: 1 }}>
              {query.trim() ? `Create “${query.trim()}”` : 'Create custom exercise'}
            </T>
          </Pressable>
        }
      />
      <View style={styles.footer}>
        <Button
          size="lg"
          title={selected.length ? `Add ${selected.length} exercise${selected.length > 1 ? 's' : ''}` : 'Select exercises'}
          disabled={!selected.length}
          onPress={() => {
            addExercises(selected);
            router.back();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.lg,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.lg,
    paddingHorizontal: space.md,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 16, height: '100%' },
  // Don't let the list below squeeze the chip row (clipped the chips on iOS).
  chips: { flexGrow: 0, flexShrink: 0, marginVertical: space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.md,
    marginBottom: 4,
  },
  rowOn: { backgroundColor: colors.card },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  edit: { padding: space.sm, marginRight: space.xs },
  create: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    marginTop: space.sm,
    marginBottom: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm },
});
