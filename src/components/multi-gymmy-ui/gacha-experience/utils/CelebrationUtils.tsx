import { Animated, Easing } from 'react-native';

export interface CelebrationConfig {
  duration: number;
  particleCount: number;
  colors: string[];
  scale: number;
  sound?: string;
}

export interface RarePullCelebration {
  rarity: 'rare' | 'epic' | 'legendary';
  characterName: string;
  timestamp: Date;
  celebrationType: 'first_pull' | 'milestone' | 'collection_complete' | 'special_event';
}

export const CELEBRATION_CONFIGS: Record<string, CelebrationConfig> = {
  rare: {
    duration: 2000,
    particleCount: 20,
    colors: ['#4169E1', '#1E90FF', '#00BFFF'],
    scale: 1.1,
  },
  epic: {
    duration: 3000,
    particleCount: 35,
    colors: ['#9932CC', '#8A2BE2', '#7B68EE', '#9370DB'],
    scale: 1.2,
  },
  legendary: {
    duration: 5000,
    particleCount: 50,
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF1493', '#FF69B4'],
    scale: 1.3,
  },
  milestone: {
    duration: 4000,
    particleCount: 40,
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF1493'],
    scale: 1.25,
  },
  collection_complete: {
    duration: 6000,
    particleCount: 60,
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF1493', '#FF69B4', '#9370DB'],
    scale: 1.4,
  },
};

export const createCelebrationAnimation = (
  config: CelebrationConfig,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const scaleAnimation = new Animated.Value(0);
  const opacityAnimation = new Animated.Value(0);
  const rotationAnimation = new Animated.Value(0);
  
  const sequence = Animated.parallel([
    // Scale up with bounce
    Animated.timing(scaleAnimation, {
      toValue: config.scale,
      duration: config.duration * 0.6,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }),
    
    // Fade in
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: config.duration * 0.3,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    
    // Rotation
    Animated.timing(rotationAnimation, {
      toValue: 1,
      duration: config.duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
  
  if (onComplete) {
    sequence.start(onComplete);
  }
  
  return sequence;
};

export const createParticleAnimation = (
  particleCount: number,
  duration: number,
  colors: string[]
): Animated.Value[] => {
  const particles: Animated.Value[] = [];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Animated.Value(0));
  }
  
  return particles;
};

export const animateParticles = (
  particles: Animated.Value[],
  duration: number,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const animations = particles.map((particle, index) => {
    const delay = (index * 50) % 500; // Stagger particles
    
    return Animated.sequence([
      Animated.delay(delay),
      Animated.timing(particle, {
        toValue: 1,
        duration: duration * 0.8,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(particle, {
        toValue: 0,
        duration: duration * 0.2,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
  });
  
  const sequence = Animated.parallel(animations);
  
  if (onComplete) {
    sequence.start(onComplete);
  }
  
  return sequence;
};

export const createScreenFlash = (
  color: string,
  duration: number = 500,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const flashAnimation = new Animated.Value(0);
  
  const sequence = Animated.sequence([
    Animated.timing(flashAnimation, {
      toValue: 1,
      duration: duration * 0.3,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(flashAnimation, {
      toValue: 0,
      duration: duration * 0.7,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
  
  if (onComplete) {
    sequence.start(onComplete);
  }
  
  return sequence;
};

export const createConfettiAnimation = (
  confettiCount: number = 30,
  duration: number = 3000,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const confettiPieces: Animated.Value[] = [];
  
  for (let i = 0; i < confettiCount; i++) {
    confettiPieces.push(new Animated.Value(0));
  }
  
  const animations = confettiPieces.map((piece, index) => {
    const delay = Math.random() * 1000;
    const fallDuration = duration + Math.random() * 1000;
    
    return Animated.sequence([
      Animated.delay(delay),
      Animated.timing(piece, {
        toValue: 1,
        duration: fallDuration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
  });
  
  const sequence = Animated.parallel(animations);
  
  if (onComplete) {
    sequence.start(onComplete);
  }
  
  return sequence;
};

export const createRarityRevealCelebration = (
  rarity: 'rare' | 'epic' | 'legendary',
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const config = CELEBRATION_CONFIGS[rarity];
  
  const scaleAnimation = new Animated.Value(0);
  const glowAnimation = new Animated.Value(0);
  const sparkleAnimation = new Animated.Value(0);
  
  const sequence = Animated.sequence([
    // Initial scale up
    Animated.timing(scaleAnimation, {
      toValue: config.scale,
      duration: config.duration * 0.4,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }),
    
    // Glow effect
    Animated.timing(glowAnimation, {
      toValue: 1,
      duration: config.duration * 0.3,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    
    // Sparkle effect
    Animated.timing(sparkleAnimation, {
      toValue: 1,
      duration: config.duration * 0.3,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
  
  if (onComplete) {
    sequence.start(onComplete);
  }
  
  return sequence;
};

export const getCelebrationMessage = (
  rarity: 'rare' | 'epic' | 'legendary',
  characterName: string,
  celebrationType?: string
): string => {
  const messages = {
    rare: [
      `🎉 Amazing! You got ${characterName}!`,
      `✨ Rare find! ${characterName} joins your team!`,
      `🌟 Excellent pull! ${characterName} is yours!`,
    ],
    epic: [
      `🔥 EPIC! ${characterName} is absolutely incredible!`,
      `⚡ WOW! You pulled the epic ${characterName}!`,
      `💫 Legendary moment! ${characterName} is epic!`,
    ],
    legendary: [
      `👑 LEGENDARY! ${characterName} is absolutely PERFECT!`,
      `🌟 THE ULTIMATE PULL! ${characterName} is legendary!`,
      `💎 INCREDIBLE! You got the legendary ${characterName}!`,
    ],
  };
  
  const rarityMessages = messages[rarity];
  const randomIndex = Math.floor(Math.random() * rarityMessages.length);
  
  return rarityMessages[randomIndex];
};

export const createMilestoneCelebration = (
  milestone: string,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const config = CELEBRATION_CONFIGS.milestone;
  
  const scaleAnimation = new Animated.Value(0);
  const opacityAnimation = new Animated.Value(0);
  
  const sequence = Animated.parallel([
    Animated.timing(scaleAnimation, {
      toValue: config.scale,
      duration: config.duration * 0.6,
      easing: Easing.out(Easing.back(1.3)),
      useNativeDriver: true,
    }),
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: config.duration * 0.4,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
  
  if (onComplete) {
    sequence.start(onComplete);
  }
  
  return sequence;
}; 