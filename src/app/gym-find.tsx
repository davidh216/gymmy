import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Chip, Icon, T, haptic } from '@/components/ui';
import type { Gym } from '@/services/gyms';
import { useCreateGym, useGymSearch, useJoinByInvite, useJoinGym } from '@/services/gyms/queries';
import { colors, radius, space } from '@/theme';

type Tab = 'find' | 'home' | 'invite';

export default function GymFind() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('find');

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <T variant="title">Add a gym</T>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <T variant="heading" color={colors.textDim}>
            Done
          </T>
        </Pressable>
      </View>
      <View style={styles.tabs}>
        <Chip label="Find a gym" active={tab === 'find'} onPress={() => setTab('find')} />
        <Chip label="Home gym" active={tab === 'home'} onPress={() => setTab('home')} />
        <Chip label="Invite code" active={tab === 'invite'} onPress={() => setTab('invite')} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}>
        {tab === 'find' && <FindTab />}
        {tab === 'home' && <CreateTab kind="private" />}
        {tab === 'invite' && <InviteTab />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function openGym(gym: Gym) {
  router.back();
  router.push({ pathname: '/gym/[id]', params: { id: gym.id } });
}

function FindTab() {
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const { data: results = [] } = useGymSearch(query);
  const join = useJoinGym();

  if (adding) return <CreateTab kind="public" initialName={query} onCancel={() => setAdding(false)} />;

  return (
    <>
      <View style={styles.search}>
        <Icon name={{ ios: 'magnifyingglass', web: 'search' }} size={16} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Gym name or area"
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
          autoCorrect={false}
          accessibilityLabel="Search gyms"
        />
      </View>
      {results.map((g) => (
        <Card key={g.id} style={styles.result}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T variant="heading" numberOfLines={1}>
              {g.name}
            </T>
            <T variant="caption" color={colors.textFaint}>
              {g.area ?? 'Public gym'} · {g.memberCount} members{g.sample ? ' · Sample' : ''}
            </T>
          </View>
          {g.isMember ? (
            <Button title="Open" variant="secondary" onPress={() => openGym(g)} />
          ) : (
            <Button
              title="Join"
              onPress={async () => {
                haptic('success');
                await join.mutateAsync(g.id);
                openGym(g);
              }}
            />
          )}
        </Card>
      ))}
      {results.length === 0 && (
        <T variant="body" color={colors.textDim} style={{ textAlign: 'center', marginVertical: space.lg }}>
          No gyms match “{query}” yet.
        </T>
      )}
      <Card style={{ gap: space.sm, marginTop: space.md }}>
        <T variant="heading">Can’t find your gym?</T>
        <T variant="caption" color={colors.textDim}>
          Add it and its boards start empty, so every title is up for grabs.
        </T>
        <Button title="Add a public gym" variant="secondary" onPress={() => setAdding(true)} />
      </Card>
    </>
  );
}

function CreateTab({
  kind,
  initialName = '',
  onCancel,
}: {
  kind: 'public' | 'private';
  initialName?: string;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [area, setArea] = useState('');
  const create = useCreateGym();
  const valid = name.trim().length >= 3;

  return (
    <View style={{ gap: space.md }}>
      <T variant="body" color={colors.textDim} style={{ lineHeight: 21 }}>
        {kind === 'private'
          ? 'A private board for your garage or home gym. Share the invite code so friends can compete.'
          : 'Anyone can find and join a public gym.'}
      </T>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={kind === 'private' ? 'e.g. The Garage' : 'Gym name'}
        placeholderTextColor={colors.textFaint}
        style={styles.field}
        maxLength={40}
        accessibilityLabel="Gym name"
      />
      {kind === 'public' && (
        <TextInput
          value={area}
          onChangeText={setArea}
          placeholder="Neighbourhood or city"
          placeholderTextColor={colors.textFaint}
          style={styles.field}
          maxLength={40}
          accessibilityLabel="Area"
        />
      )}
      <Button
        size="lg"
        title={kind === 'private' ? 'Create home gym' : 'Add gym'}
        disabled={!valid || create.isPending}
        onPress={async () => {
          haptic('success');
          const gym = await create.mutateAsync({ kind, name, area });
          openGym(gym);
        }}
      />
      {onCancel && <Button title="Back to search" variant="ghost" onPress={onCancel} />}
    </View>
  );
}

function InviteTab() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const join = useJoinByInvite();

  return (
    <View style={{ gap: space.md }}>
      <T variant="body" color={colors.textDim}>
        Enter the 6-character code a friend shared from their home gym.
      </T>
      <TextInput
        value={code}
        onChangeText={(t) => {
          setCode(t.toUpperCase());
          setError(null);
        }}
        placeholder="ABC123"
        placeholderTextColor={colors.textFaint}
        style={[styles.field, styles.code]}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        accessibilityLabel="Invite code"
      />
      {error && (
        <T variant="body" color={colors.danger}>
          {error}
        </T>
      )}
      <Button
        size="lg"
        title="Join gym"
        disabled={code.length !== 6 || join.isPending}
        onPress={async () => {
          const gym = await join.mutateAsync(code);
          if (gym) {
            haptic('success');
            openGym(gym);
          } else {
            setError('No gym uses that code. Check it with your friend.');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg },
  tabs: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, marginBottom: space.md, flexWrap: 'wrap' },
  content: { paddingHorizontal: space.lg, gap: space.sm, maxWidth: 640, width: '100%', alignSelf: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    marginBottom: space.sm,
  },
  searchInput: { flex: 1, minWidth: 0, color: colors.text, fontSize: 16, height: '100%' },
  result: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  field: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  code: { fontSize: 26, fontWeight: '800', letterSpacing: 6, textAlign: 'center' },
});
