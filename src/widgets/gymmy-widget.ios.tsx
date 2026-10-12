import { Circle, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, padding, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { WidgetProps } from '@/lib/widget-data';

/**
 * The home and lock screen widget: streak, this week and the next session.
 *
 * The `'widget'` directive turns this function into a string that runs inside the widget,
 * so it can only use its arguments and the SwiftUI components; no app imports, theme or helpers.
 */
const layout = (props: WidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const accent = '#C6FF3D';
  const dim = '#A1A1AA';
  const faint = '#85858F';
  const background = '#09090B';
  const family = environment.widgetFamily;
  const weekText = `${props.done}/${props.goal} this week`;
  const streakText = `🔥 ${props.streak}w`;
  const nextText = props.next ? `Next: ${props.next}` : 'Log a workout';

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={2} modifiers={[widgetURL('gymmy://')]}>
        <Text modifiers={[font({ size: 15, weight: 'bold' })]}>{`${streakText} · ${weekText}`}</Text>
        <Text modifiers={[font({ size: 13 })]}>{nextText}</Text>
      </VStack>
    );
  }

  if (family === 'accessoryInline') {
    return <Text>{`${streakText} · ${props.done}/${props.goal}`}</Text>;
  }

  const dots = (
    <HStack spacing={5}>
      {props.week.map((on, i) => (
        <Circle key={i} modifiers={[frame({ width: 9, height: 9 }), foregroundStyle(on ? accent : '#2A2A31')]} />
      ))}
    </HStack>
  );

  if (family === 'systemMedium') {
    return (
      <HStack
        spacing={16}
        modifiers={[padding({ all: 4 }), containerBackground(background, 'widget'), widgetURL('gymmy://')]}>
        <VStack alignment="leading" spacing={6}>
          <Text modifiers={[font({ size: 30, weight: 'heavy', design: 'rounded' }), foregroundStyle('#FAFAFA')]}>
            {streakText}
          </Text>
          <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(dim)]}>{weekText}</Text>
          {dots}
        </VStack>
        <Spacer />
        <VStack alignment="leading" spacing={4}>
          <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(accent)]}>
            {props.nextFrom || props.buddy}
          </Text>
          <Text modifiers={[font({ size: 18, weight: 'bold' }), foregroundStyle('#FAFAFA')]}>
            {props.next || 'Start a workout'}
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(faint)]}>{`${props.buddy} is ready`}</Text>
        </VStack>
      </HStack>
    );
  }

  return (
    <VStack
      alignment="leading"
      spacing={6}
      modifiers={[containerBackground(background, 'widget'), widgetURL('gymmy://')]}>
      <Text modifiers={[font({ size: 28, weight: 'heavy', design: 'rounded' }), foregroundStyle('#FAFAFA')]}>
        {streakText}
      </Text>
      <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(dim)]}>{weekText}</Text>
      {dots}
      <Spacer />
      <Text modifiers={[font({ size: 13, weight: 'bold' }), foregroundStyle(accent)]}>{nextText}</Text>
    </VStack>
  );
};

export const GymmyWidget = createWidget<WidgetProps>('GymmyWidget', layout);
