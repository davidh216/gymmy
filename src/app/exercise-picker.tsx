import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Icon, T, haptic } from '@/components/ui';
import { MUSCLE_GROUPS, searchExercises, type MuscleGroup } from '@/lib/exercises';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

export default function ExercisePicker() {
  const insets = useSafeAreaInsets();
  const addExercises = useGymmy((s) => s.addExercises);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const results = searchExercises(query, group);

  const toggle = (id: string) => {
    haptic();
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + space.md }]}>
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
        contentContainerStyle={{ paddingHorizontal: space.lg }}
        renderItem={({ item }) => {
          const index = selected.indexOf(item.id);
          const on = index >= 0;
          return (
            <Pressable onPress={() => toggle(item.id)} style={[styles.row, on && styles.rowOn]}>
              <View style={{ flex: 1 }}>
                <T variant="heading">{item.name}</T>
                <T variant="caption" color={colors.textFaint} style={{ textTransform: 'capitalize' }}>
                  {item.group}
                </T>
              </View>
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
          <T variant="body" color={colors.textDim} style={{ textAlign: 'center', marginTop: space.xl }}>
            No exercises match “{query}”.
          </T>
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
    </View>
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
  chips: { flexGrow: 0, marginVertical: space.md },
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
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm },
});
