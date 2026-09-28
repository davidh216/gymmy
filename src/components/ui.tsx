import * as Haptics from 'expo-haptics';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, radius, space, type } from '@/theme';

export function haptic(kind: 'light' | 'medium' | 'success' | 'heavy' = 'light') {
  if (Platform.OS === 'web') return;
  if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else
    Haptics.impactAsync(
      kind === 'heavy'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : kind === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light,
    );
}

type Variant = keyof typeof type;

export function T({
  variant = 'body',
  color = colors.text,
  style,
  ...props
}: TextProps & { variant?: Variant; color?: string }) {
  return <Text {...props} style={[type[variant] as TextStyle, { color }, style]} />;
}

export function Icon({
  name,
  size = 20,
  color = colors.text,
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
}) {
  return <SymbolView name={name} size={size} tintColor={color} />;
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable
      onPress={() => {
        haptic();
        onPress();
      }}
      style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  icon?: SymbolViewProps['name'];
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gem';
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  icon,
  variant = 'primary',
  size = 'md',
  style,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const palette = {
    primary: { bg: colors.accent, fg: colors.accentInk },
    secondary: { bg: colors.cardHigh, fg: colors.text },
    ghost: { bg: 'transparent', fg: colors.textDim },
    danger: { bg: 'rgba(244,63,94,0.14)', fg: colors.danger },
    gem: { bg: colors.gem, fg: '#12002E' },
  }[variant];
  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      onPress={(e) => {
        haptic(variant === 'primary' ? 'medium' : 'light');
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.button,
        size === 'lg' && styles.buttonLg,
        { backgroundColor: palette.bg },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {icon ? <Icon name={icon} size={size === 'lg' ? 20 : 16} color={palette.fg} /> : null}
      <T variant={size === 'lg' ? 'heading' : 'caption'} color={palette.fg}>
        {title}
      </T>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptic();
        onPress?.();
      }}
      style={[styles.chip, active && styles.chipActive]}>
      <T variant="caption" color={active ? colors.accentInk : colors.textDim}>
        {label}
      </T>
    </Pressable>
  );
}

export function ProgressBar({
  progress,
  color = colors.accent,
  height = 8,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <View style={{ width: `${pct}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <T variant="title" color={color}>
        {value}
      </T>
      <T variant="label" color={colors.textFaint}>
        {label}
      </T>
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <T variant="label" color={colors.textFaint}>
        {title}
      </T>
      {action}
    </View>
  );
}

export function GemCount({ gems, size = 'md' }: { gems: number; size?: 'md' | 'lg' }) {
  return (
    <View style={styles.gemPill}>
      <T variant={size === 'lg' ? 'heading' : 'caption'}>💎</T>
      <T variant={size === 'lg' ? 'heading' : 'caption'} color={colors.gem}>
        {gems.toLocaleString('en-US')}
      </T>
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: space.lg,
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    height: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
  buttonLg: { height: 58 },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.cardHigh,
  },
  chipActive: { backgroundColor: colors.accent },
  track: { backgroundColor: colors.cardHigh, overflow: 'hidden', width: '100%' },
  stat: { flex: 1, gap: 2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  gemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(167,139,250,0.14)',
  },
});
