import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Clip } from '@/components/clip';
import { Button, Card, Icon, T, haptic } from '@/components/ui';
import { formatResult, getChallenge, parseSeconds } from '@/lib/challenges';
import { fromDisplayWeight } from '@/lib/format';
import { medalFor } from '@/lib/leaderboard';
import type { PostEntryResult } from '@/services/gyms';
import { useGym, usePostEntry } from '@/services/gyms/queries';
import { useGymmy } from '@/store/gymmy';
import { colors, radius, space } from '@/theme';

const MAX_CLIP_SECONDS = 60;

export default function PostEntry() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ gymId: string; challengeId: string }>();
  const challenge = getChallenge(params.challengeId);
  const { data: gym } = useGym(params.gymId);
  const units = useGymmy((s) => s.profile?.units ?? 'lb');
  const username = useGymmy((s) => s.profile?.username ?? 'lifter');
  const companionId = useGymmy((s) => s.companionId);
  const post = usePostEntry();

  const [result, setResult] = useState('');
  const [bodyweight, setBodyweight] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<PostEntryResult | null>(null);

  const isWeight = challenge.metric === 'weight';
  const value = parseValue(result);
  const bw = parseFloat(bodyweight.replace(',', '.'));
  const bodyweightKg = Number.isFinite(bw) && bw > 0 ? fromDisplayWeight(bw, units) : undefined;
  const allChecked = checked.length === challenge.standards.length;
  const ready = value !== null && videoUri && allChecked && (!isWeight || bodyweightKg);

  function parseValue(text: string): number | null {
    if (challenge.metric === 'seconds') return parseSeconds(text);
    const n = parseFloat(text.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return null;
    return challenge.metric === 'weight' ? fromDisplayWeight(n, units) : Math.round(n);
  }

  const record = async () => {
    setError(null);
    try {
      let picked: ImagePicker.ImagePickerResult;
      if (Platform.OS === 'web') {
        // Browsers (and the preview frame) can't reliably open the camera; pick a file instead.
        picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] });
      } else {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError('Camera access is off. Turn it on in Settings to record your attempt.');
          return;
        }
        picked = await ImagePicker.launchCameraAsync({
          mediaTypes: ['videos'],
          videoMaxDuration: MAX_CLIP_SECONDS,
        });
      }
      if (picked.canceled) return;
      const asset = picked.assets[0];
      if (asset.duration && asset.duration / 1000 > MAX_CLIP_SECONDS + 1) {
        setError(`Clips can be up to ${MAX_CLIP_SECONDS} seconds.`);
        return;
      }
      setVideoUri(asset.uri);
    } catch {
      setError('Couldn’t open the camera. Try again.');
    }
  };

  const submit = async () => {
    if (!ready || value === null || !videoUri) return;
    try {
      const res = await post.mutateAsync({
        gymId: params.gymId,
        challengeId: challenge.id,
        value,
        bodyweightKg: isWeight ? bodyweightKg : undefined,
        videoUri,
        athlete: { username, companionId },
      });
      haptic(res.rank <= 3 ? 'success' : 'medium');
      setDone(res);
    } catch {
      setError('Posting failed. Check your connection and try again.');
    }
  };

  if (done) {
    const medal = medalFor(done.rank);
    return (
      <View style={[styles.root, styles.doneWrap, { paddingBottom: insets.bottom + space.lg }]}>
        <Animated.View entering={ZoomIn.springify().damping(9)} style={{ alignItems: 'center', gap: space.sm }}>
          <T style={{ fontSize: 88 }}>{medal ?? '💪'}</T>
          <T variant="label" color={colors.accent}>
            {gym?.name}
          </T>
          <T variant="hero" style={{ textAlign: 'center' }}>
            {done.rank === 1 ? 'You took the crown!' : medal ? `You made the podium` : `Ranked #${done.rank}`}
          </T>
          <T variant="heading" color={colors.textDim}>
            {challenge.name} · {formatResult(challenge, done.entry.value, units)}
          </T>
          {done.dethroned.length > 0 && (
            <T variant="body" color={colors.flame} style={{ textAlign: 'center', marginTop: space.sm }}>
              You knocked {done.dethroned.map((a) => `@${a.username}`).join(' and ')} off the podium.
            </T>
          )}
        </Animated.View>
        <Button size="lg" title="See the board" onPress={() => router.back()} style={styles.doneButton} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <T variant="caption" color={colors.textDim}>
            {gym?.name ?? ''}
          </T>
          <T variant="title">{challenge.name}</T>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <T variant="heading" color={colors.textDim}>
            Cancel
          </T>
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}>
        <T variant="label" color={colors.textFaint}>
          1 · Video
        </T>
        {videoUri ? (
          <View style={{ gap: space.sm }}>
            <Clip uri={videoUri} emptyLabel="" />
            <Button title="Retake" variant="secondary" onPress={record} />
          </View>
        ) : (
          <Pressable onPress={record} style={styles.recordBox} accessibilityRole="button">
            <View style={styles.recordDot} />
            <T variant="heading">{Platform.OS === 'web' ? 'Choose your video' : 'Record your attempt'}</T>
            <T variant="caption" color={colors.textDim} style={{ textAlign: 'center' }}>
              Up to {MAX_CLIP_SECONDS} seconds, one continuous take.
            </T>
          </Pressable>
        )}

        <T variant="label" color={colors.textFaint} style={styles.step}>
          2 · Result
        </T>
        <View style={styles.inputRow}>
          <TextInput
            value={result}
            onChangeText={setResult}
            keyboardType={challenge.metric === 'seconds' ? 'numbers-and-punctuation' : 'decimal-pad'}
            placeholder={challenge.metric === 'seconds' ? (challenge.higherIsBetter ? '2:30' : '1:42.5') : '0'}
            placeholderTextColor={colors.textFaint}
            style={styles.bigInput}
            accessibilityLabel="Result"
          />
          <T variant="heading" color={colors.textDim}>
            {challenge.metric === 'weight' ? units : challenge.metric === 'reps' ? 'reps' : 'm:ss'}
          </T>
        </View>
        {isWeight && (
          <View style={styles.inputRow}>
            <T variant="body" color={colors.textDim} style={{ flex: 1 }}>
              Your bodyweight (for pound-for-pound)
            </T>
            <TextInput
              value={bodyweight}
              onChangeText={setBodyweight}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              style={styles.smallInput}
              accessibilityLabel="Bodyweight"
            />
            <T variant="caption" color={colors.textDim}>
              {units}
            </T>
          </View>
        )}

        <T variant="label" color={colors.textFaint} style={styles.step}>
          3 · Standards
        </T>
        <Card style={{ gap: space.xs, padding: space.sm }}>
          {challenge.standards.map((s) => {
            const on = checked.includes(s);
            return (
              <Pressable
                key={s}
                onPress={() => {
                  haptic();
                  setChecked(on ? checked.filter((x) => x !== s) : [...checked, s]);
                }}
                style={styles.standard}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}>
                <View style={[styles.box, on && styles.boxOn]}>
                  {on && <Icon name={{ ios: 'checkmark', web: 'check' }} size={14} color={colors.accentInk} />}
                </View>
                <T variant="body" style={{ flex: 1 }}>
                  {s}
                </T>
              </Pressable>
            );
          })}
        </Card>
        <T variant="caption" color={colors.textFaint} style={{ marginTop: space.sm, lineHeight: 18 }}>
          Your entry goes live right away. Other lifters can report it if the video doesn’t meet these
          standards.
        </T>

        {error && (
          <T variant="body" color={colors.danger} style={{ marginTop: space.md }}>
            {error}
          </T>
        )}

        <Button
          size="lg"
          title={post.isPending ? 'Posting…' : 'Post to the board'}
          disabled={!ready || post.isPending}
          onPress={submit}
          style={{ marginTop: space.xl }}
        />
        {!ready && (
          <T variant="caption" color={colors.textFaint} style={{ textAlign: 'center', marginTop: space.sm }}>
            {!videoUri
              ? 'Add your video to continue.'
              : value === null
                ? 'Enter your result.'
                : isWeight && !bodyweightKg
                  ? 'Enter your bodyweight.'
                  : 'Confirm each standard.'}
          </T>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: space.lg, gap: space.md },
  content: { paddingHorizontal: space.lg, gap: space.sm, maxWidth: 640, width: '100%', alignSelf: 'center' },
  step: { marginTop: space.lg },
  recordBox: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xxl,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  recordDot: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.danger, borderWidth: 4, borderColor: colors.cardHigh },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  bigInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  smallInput: {
    width: 90,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
  },
  standard: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  doneWrap: { justifyContent: 'center', paddingHorizontal: space.xl, gap: space.xxl },
  doneButton: { width: '100%', maxWidth: 480, alignSelf: 'center' },
});
