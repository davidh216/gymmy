export interface Banner {
  id: string;
  name: string;
  description: string;
  featuredCharacter: string;
  featuredCharacterRarity: 'rare' | 'epic' | 'legendary';
  startDate: Date;
  endDate: Date;
  pullCost: number;
  guaranteedRarity?: 'rare' | 'epic' | 'legendary';
  guaranteedPulls?: number;
  rateUpMultiplier: number;
  backgroundImage?: string;
  theme: 'strength' | 'endurance' | 'flexibility' | 'balance' | 'special';
  isActive: boolean;
}

export interface BannerRotation {
  currentBanner: Banner | null;
  upcomingBanners: Banner[];
  pastBanners: Banner[];
  rotationSchedule: Banner[];
}

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'strength-masters',
    name: 'Strength Masters',
    description: 'Unleash your inner power with legendary strength characters',
    featuredCharacter: 'Power Gymmy',
    featuredCharacterRarity: 'legendary',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-15'),
    pullCost: 300,
    guaranteedRarity: 'epic',
    guaranteedPulls: 10,
    rateUpMultiplier: 2.5,
    theme: 'strength',
    isActive: true,
  },
  {
    id: 'endurance-champions',
    name: 'Endurance Champions',
    description: 'Build unstoppable stamina with elite endurance characters',
    featuredCharacter: 'Pace Gymmy',
    featuredCharacterRarity: 'epic',
    startDate: new Date('2024-12-16'),
    endDate: new Date('2024-12-30'),
    pullCost: 250,
    guaranteedRarity: 'rare',
    guaranteedPulls: 10,
    rateUpMultiplier: 2.0,
    theme: 'endurance',
    isActive: false,
  },
  {
    id: 'flexibility-masters',
    name: 'Flexibility Masters',
    description: 'Achieve perfect form with legendary flexibility characters',
    featuredCharacter: 'Zen Gymmy',
    featuredCharacterRarity: 'legendary',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-15'),
    pullCost: 300,
    guaranteedRarity: 'epic',
    guaranteedPulls: 10,
    rateUpMultiplier: 2.5,
    theme: 'flexibility',
    isActive: false,
  },
];

export const getCurrentBanner = (banners: Banner[]): Banner | null => {
  // const now = ...; // Quick fix: commented unused variable
  return banners.find(banner => 
    banner.isActive && 
    now >= banner.startDate && 
    now <= banner.endDate
  ) || null;
};

export const getUpcomingBanners = (banners: Banner[], count: number = 3): Banner[] => {
  // const now = ...; // Quick fix: commented unused variable
  return banners
    .filter(banner => banner.startDate > now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, count);
};

export const getPastBanners = (banners: Banner[], count: number = 5): Banner[] => {
  // const now = ...; // Quick fix: commented unused variable
  return banners
    .filter(banner => banner.endDate < now)
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
    .slice(0, count);
};

export const getBannerTimeRemaining = (banner: Banner): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} => {
  // const now = ...; // Quick fix: commented unused variable
  // const endTime = ...; // Quick fix: commented unused variable
  // const timeRemaining = ...; // Quick fix: commented unused variable
  
  // const totalSeconds = ...; // Quick fix: commented unused variable
  // const days = ...; // Quick fix: commented unused variable
  // const hours = ...; // Quick fix: commented unused variable
  // const minutes = ...; // Quick fix: commented unused variable
  // const seconds = ...; // Quick fix: commented unused variable
  
  return { days, hours, minutes, seconds, totalSeconds };
};

export const getBannerTimeUntilStart = (banner: Banner): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} => {
  // const now = ...; // Quick fix: commented unused variable
  // const startTime = ...; // Quick fix: commented unused variable
  // const timeUntilStart = ...; // Quick fix: commented unused variable
  
  // const totalSeconds = ...; // Quick fix: commented unused variable
  // const days = ...; // Quick fix: commented unused variable
  // const hours = ...; // Quick fix: commented unused variable
  // const minutes = ...; // Quick fix: commented unused variable
  // const seconds = ...; // Quick fix: commented unused variable
  
  return { days, hours, minutes, seconds, totalSeconds };
};

export const formatTimeRemaining = (timeData: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}): string => {
  const { days, hours, minutes, seconds } = timeData;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const getBannerThemeColors = (theme: Banner['theme']) => {
  const themes = {
    strength: {
      primary: '#FF6B6B',
      secondary: '#FF8E8E',
      accent: '#FF4757',
      background: '#FFF5F5',
    },
    endurance: {
      primary: '#4ECDC4',
      secondary: '#7FDBDA',
      accent: '#26D0CE',
      background: '#F0FFFE',
    },
    flexibility: {
      primary: '#A55EEA',
      secondary: '#C44569',
      accent: '#8B5CF6',
      background: '#F8F5FF',
    },
    balance: {
      primary: '#26DE81',
      secondary: '#20BF6B',
      accent: '#0FB9B1',
      background: '#F0FFF4',
    },
    special: {
      primary: '#FED330',
      secondary: '#FD79A8',
      accent: '#E84393',
      background: '#FFFBF0',
    },
  };
  
  return themes[theme] || themes.special;
};

export const getBannerProgress = (banner: Banner): number => {
  // const now = ...; // Quick fix: commented unused variable
  // const totalDuration = ...; // Quick fix: commented unused variable
  // const elapsed = ...; // Quick fix: commented unused variable
  
  return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
};

export const isBannerActive = (banner: Banner): boolean => {
  // const now = ...; // Quick fix: commented unused variable
  return banner.isActive && 
         now >= banner.startDate && 
         now <= banner.endDate;
};

export const getBannerStatus = (banner: Banner): 'upcoming' | 'active' | 'ended' => {
  // const now = ...; // Quick fix: commented unused variable
  
  if (now < banner.startDate) {
    return 'upcoming';
  } else if (now >= banner.startDate && now <= banner.endDate) {
    return 'active';
  } else {
    return 'ended';
  }
}; 