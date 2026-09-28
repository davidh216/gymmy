import { Platform } from 'react-native';

export const colors = {
  bg: '#09090B',
  card: '#141418',
  cardHigh: '#1D1D23',
  border: '#27272F',
  text: '#FAFAFA',
  textDim: '#A1A1AA',
  textFaint: '#63636E',
  accent: '#C6FF3D',
  accentInk: '#0B0F00',
  gem: '#A78BFA',
  flame: '#FF8A3D',
  danger: '#F43F5E',
  success: '#34D399',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

export const fonts = {
  rounded: Platform.select({ ios: 'ui-rounded', web: 'ui-rounded, system-ui', default: undefined }),
  mono: Platform.select({ ios: 'ui-monospace', web: 'ui-monospace, monospace', default: 'monospace' }),
};

export const type = {
  hero: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, fontFamily: fonts.rounded },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, fontFamily: fonts.rounded },
  heading: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '500' },
  caption: { fontSize: 13, fontWeight: '600' },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
} as const;
