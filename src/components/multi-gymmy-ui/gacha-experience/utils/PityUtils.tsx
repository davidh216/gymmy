export interface PityStats {
  totalPulls: number;
  legendaryPity: number;
  epicPity: number;
  rarePity: number;
  lastLegendaryPull: number;
  lastEpicPull: number;
  lastRarePull: number;
  guaranteedLegendary: boolean;
  guaranteedEpic: boolean;
  guaranteedRare: boolean;
}

export interface PityProgress {
  legendary: {
    current: number;
    max: number;
    percentage: number;
    guaranteed: boolean;
  };
  epic: {
    current: number;
    max: number;
    percentage: number;
    guaranteed: boolean;
  };
  rare: {
    current: number;
    max: number;
    percentage: number;
    guaranteed: boolean;
  };
}

export const PITY_THRESHOLDS = {
  legendary: 90,
  epic: 30,
  rare: 10,
} as const;

export const calculatePityProgress = (pityStats: PityStats): PityProgress => {
  const legendaryProgress = Math.min((pityStats.legendaryPity / PITY_THRESHOLDS.legendary) * 100, 100);
  const epicProgress = Math.min((pityStats.epicPity / PITY_THRESHOLDS.epic) * 100, 100);
  const rareProgress = Math.min((pityStats.rarePity / PITY_THRESHOLDS.rare) * 100, 100);

  return {
    legendary: {
      current: pityStats.legendaryPity,
      max: PITY_THRESHOLDS.legendary,
      percentage: legendaryProgress,
      guaranteed: pityStats.guaranteedLegendary,
    },
    epic: {
      current: pityStats.epicPity,
      max: PITY_THRESHOLDS.epic,
      percentage: epicProgress,
      guaranteed: pityStats.guaranteedEpic,
    },
    rare: {
      current: pityStats.rarePity,
      max: PITY_THRESHOLDS.rare,
      percentage: rareProgress,
      guaranteed: pityStats.guaranteedRare,
    },
  };
};

export const getPityColor = (rarity: keyof typeof PITY_THRESHOLDS, progress: number): string => {
  const colors = {
    legendary: {
      low: '#FF6B6B',
      medium: '#FFA500',
      high: '#FFD700',
      guaranteed: '#FF1493',
    },
    epic: {
      low: '#9370DB',
      medium: '#8A2BE2',
      high: '#9932CC',
      guaranteed: '#FF69B4',
    },
    rare: {
      low: '#4169E1',
      medium: '#1E90FF',
      high: '#00BFFF',
      guaranteed: '#FFD700',
    },
  };

  const rarityColors = colors[rarity];
  
  if (progress >= 100) {
    return rarityColors.guaranteed;
  } else if (progress >= 80) {
    return rarityColors.high;
  } else if (progress >= 50) {
    return rarityColors.medium;
  } else {
    return rarityColors.low;
  }
};

export const getPityMessage = (rarity: keyof typeof PITY_THRESHOLDS, progress: number): string => {
  const messages = {
    legendary: {
      low: 'Keep pulling for legendary characters!',
      medium: 'Getting closer to a legendary pull!',
      high: 'Almost guaranteed legendary!',
      guaranteed: 'GUARANTEED LEGENDARY!',
    },
    epic: {
      low: 'Epic characters await!',
      medium: 'Epic pull coming soon!',
      high: 'Epic guaranteed soon!',
      guaranteed: 'GUARANTEED EPIC!',
    },
    rare: {
      low: 'Rare characters within reach!',
      medium: 'Rare pull getting close!',
      high: 'Rare guaranteed soon!',
      guaranteed: 'GUARANTEED RARE!',
    },
  };

  const rarityMessages = messages[rarity];
  
  if (progress >= 100) {
    return rarityMessages.guaranteed;
  } else if (progress >= 80) {
    return rarityMessages.high;
  } else if (progress >= 50) {
    return rarityMessages.medium;
  } else {
    return rarityMessages.low;
  }
};

export const calculatePullsUntilGuaranteed = (pityStats: PityStats): {
  legendary: number;
  epic: number;
  rare: number;
} => {
  return {
    legendary: Math.max(0, PITY_THRESHOLDS.legendary - pityStats.legendaryPity),
    epic: Math.max(0, PITY_THRESHOLDS.epic - pityStats.epicPity),
    rare: Math.max(0, PITY_THRESHOLDS.rare - pityStats.rarePity),
  };
};

export const getPityVisualConfig = (rarity: keyof typeof PITY_THRESHOLDS, progress: number) => {
  const configs = {
    legendary: {
      glowIntensity: progress >= 80 ? 1 : progress / 100,
      pulseSpeed: progress >= 90 ? 0.5 : 1,
      scale: progress >= 100 ? 1.1 : 1,
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
    },
    epic: {
      glowIntensity: progress >= 80 ? 1 : progress / 100,
      pulseSpeed: progress >= 90 ? 0.5 : 1,
      scale: progress >= 100 ? 1.1 : 1,
      colors: ['#9932CC', '#8A2BE2', '#7B68EE'],
    },
    rare: {
      glowIntensity: progress >= 80 ? 1 : progress / 100,
      pulseSpeed: progress >= 90 ? 0.5 : 1,
      scale: progress >= 100 ? 1.1 : 1,
      colors: ['#4169E1', '#1E90FF', '#00BFFF'],
    },
  };

  return configs[rarity];
};

export const formatPityProgress = (current: number, max: number): string => {
  return `${current}/${max}`;
};

export const getPityEmoji = (rarity: keyof typeof PITY_THRESHOLDS, progress: number): string => {
  const emojis = {
    legendary: {
      low: '💎',
      medium: '💎',
      high: '💎',
      guaranteed: '👑',
    },
    epic: {
      low: '🟣',
      medium: '🟣',
      high: '🟣',
      guaranteed: '⭐',
    },
    rare: {
      low: '🔵',
      medium: '🔵',
      high: '🔵',
      guaranteed: '✨',
    },
  };

  const rarityEmojis = emojis[rarity];
  
  if (progress >= 100) {
    return rarityEmojis.guaranteed;
  } else if (progress >= 80) {
    return rarityEmojis.high;
  } else if (progress >= 50) {
    return rarityEmojis.medium;
  } else {
    return rarityEmojis.low;
  }
};

export const calculatePityEfficiency = (pityStats: PityStats): number => {
  const totalPulls = pityStats.totalPulls;
  const legendaryPulls = Math.floor(totalPulls / PITY_THRESHOLDS.legendary);
  const epicPulls = Math.floor(totalPulls / PITY_THRESHOLDS.epic);
  const rarePulls = Math.floor(totalPulls / PITY_THRESHOLDS.rare);
  
  const expectedPulls = legendaryPulls + epicPulls + rarePulls;
  const actualPulls = totalPulls;
  
  return expectedPulls > 0 ? (actualPulls / expectedPulls) * 100 : 100;
};

export const getPityRecommendation = (pityStats: PityStats): string => {
  const pullsUntilGuaranteed = calculatePullsUntilGuaranteed(pityStats);
  
  if (pullsUntilGuaranteed.legendary <= 5) {
    return 'Legendary guaranteed soon! Keep pulling!';
  } else if (pullsUntilGuaranteed.epic <= 3) {
    return 'Epic guaranteed soon! Worth continuing!';
  } else if (pullsUntilGuaranteed.rare <= 2) {
    return 'Rare guaranteed soon!';
  } else {
    return 'Save gems for better banners!';
  }
}; 