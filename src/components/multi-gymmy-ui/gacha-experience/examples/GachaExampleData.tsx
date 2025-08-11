import { Banner, DEFAULT_BANNERS } from '../utils/BannerUtils';
import { PityStats } from '../utils/PityUtils';

export interface PullResult {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  character: string;
  isNew: boolean;
}

export const mockPityStats: PityStats = {
  totalPulls: 45,
  legendaryPity: 75,
  epicPity: 15,
  rarePity: 5,
  lastLegendaryPull: 75,
  lastEpicPull: 15,
  lastRarePull: 5,
  guaranteedLegendary: false,
  guaranteedEpic: false,
  guaranteedRare: false,
};

export const mockPullResults: PullResult[] = [
  {
    id: '1',
    name: 'Power Gymmy',
    rarity: 'legendary',
    character: '💪',
    isNew: true,
  },
  {
    id: '2',
    name: 'Blaze Gymmy',
    rarity: 'epic',
    character: '🔥',
    isNew: false,
  },
  {
    id: '3',
    name: 'Zen Gymmy',
    rarity: 'rare',
    character: '🧘',
    isNew: true,
  },
];

export const featureButtons = [
  {
    icon: 'calendar' as const,
    iconColor: '#4ECDC4',
    title: 'Banner Rotation',
    subtitle: 'View current & upcoming banners',
  },
  {
    icon: 'trending-up' as const,
    iconColor: '#FF6B6B',
    title: 'Pity System',
    subtitle: 'Check pity progress & guarantees',
  },
  {
    icon: 'document-text' as const,
    iconColor: '#A55EEA',
    title: 'Pull History',
    subtitle: 'View analytics & past pulls',
  },
  {
    icon: 'star' as const,
    iconColor: '#FFD700',
    title: 'Rarity Reveal',
    subtitle: 'Progressive rarity reveal animation',
  },
  {
    icon: 'star' as const,
    iconColor: '#FF1493',
    title: 'Celebration Effects',
    subtitle: 'Screen effects & particle animations',
  },
  {
    icon: 'trophy' as const,
    iconColor: '#FF8C00',
    title: 'Rare Celebration',
    subtitle: 'Special celebrations for rare pulls',
  },
]; 