import type { WidgetProps } from '@/lib/widget-data';

/** Widgets are iPhone-only (see gymmy-widget.ios.tsx); elsewhere updates do nothing. */
export const GymmyWidget = {
  updateTimeline(_entries: { date: Date; props: WidgetProps }[]) {},
};
