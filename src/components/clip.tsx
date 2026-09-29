import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { T } from '@/components/ui';
import { colors, radius } from '@/theme';

/** Plays an attempt video, or shows why there isn't one. */
export function Clip({ uri, emptyLabel }: { uri?: string; emptyLabel: string }) {
  if (!uri) {
    return (
      <View style={[styles.frame, styles.empty, { aspectRatio: 16 / 9 }]}>
        <T style={{ fontSize: 32 }}>🎬</T>
        <T variant="caption" color={colors.textFaint}>
          {emptyLabel}
        </T>
      </View>
    );
  }
  return <Player uri={uri} />;
}

function Player({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });
  return (
    <View style={styles.frame}>
      <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 9 / 12,
    maxHeight: 460,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.card },
});
