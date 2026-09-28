import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import type { SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, T } from '@/components/ui';
import { colors, radius, space } from '@/theme';

const TABS: { name: string; href: '/' | '/history' | '/squad' | '/profile'; label: string; icon: SymbolViewProps['name'] }[] = [
  { name: 'index', href: '/', label: 'Today', icon: { ios: 'flame.fill', web: 'local_fire_department' } },
  { name: 'history', href: '/history', label: 'History', icon: { ios: 'calendar', web: 'calendar_month' } },
  { name: 'squad', href: '/squad', label: 'Squad', icon: { ios: 'sparkles', web: 'auto_awesome' } },
  { name: 'profile', href: '/profile', label: 'Profile', icon: { ios: 'person.crop.circle', web: 'account_circle' } },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      {/* Triggers must be direct children of the TabList for expo-router to discover routes. */}
      <TabList asChild>
        <Bar>
          {TABS.map((t) => (
            <TabTrigger key={t.name} name={t.name} href={t.href} asChild>
              <TabButton icon={t.icon}>{t.label}</TabButton>
            </TabTrigger>
          ))}
        </Bar>
      </TabList>
    </Tabs>
  );
}

function Bar({ children, ...props }: TabListProps) {
  return (
    <View {...props} style={styles.bar}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

function TabButton({
  children,
  isFocused,
  icon,
  ...props
}: TabTriggerSlotProps & { icon: SymbolViewProps['name'] }) {
  const color = isFocused ? colors.accent : colors.textFaint;
  return (
    <Pressable {...props} style={styles.tab}>
      <Icon name={icon} size={22} color={color} />
      <T variant="caption" color={color} style={{ fontSize: 11 }}>
        {children}
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: space.md,
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(29,29,35,0.92)',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: space.sm,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
});
