import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, T } from '@/components/ui';
import { colors, space } from '@/theme';

export function BackHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/gyms'))}
        hitSlop={12}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel="Back">
        <Icon name={{ ios: 'chevron.left', web: 'chevron_left' }} color={colors.text} />
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        {subtitle ? (
          <T variant="caption" color={colors.textDim} numberOfLines={1}>
            {subtitle}
          </T>
        ) : null}
        <T variant="title" numberOfLines={1}>
          {title}
        </T>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
