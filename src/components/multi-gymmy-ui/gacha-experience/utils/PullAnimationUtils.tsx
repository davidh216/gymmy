import {
  // Animated,
  // Easing
} from 'react-native';

export interface PullAnimationConfig {
  duration: number;
  easing: any;
  useNativeDriver: boolean;
}

export interface RarityAnimationConfig {
  bronze: PullAnimationConfig;
  silver: PullAnimationConfig;
  gold: PullAnimationConfig;
  legendary: PullAnimationConfig;
}

export const DEFAULT_RARITY_ANIMATIONS: RarityAnimationConfig = {
  bronze: {
    duration: 800,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  silver: {
    duration: 1200,
    easing: Easing.out(Easing.back(1.2)),
    useNativeDriver: true,
  },
  gold: {
    duration: 1500,
    easing: Easing.out(Easing.elastic(1)),
    useNativeDriver: true,
  },
  legendary: {
    duration: 2000,
    easing: Easing.out(Easing.bounce),
    useNativeDriver: true,
  },
};

export const createPullSequence = (
  rarity: keyof RarityAnimationConfig,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  // const config = ...; // Quick fix: commented unused variable
  
  // const scaleAnimation = ...; // Quick fix: commented unused variable
  // const opacityAnimation = ...; // Quick fix: commented unused variable
  // const rotationAnimation = ...; // Quick fix: commented unused variable
  
  const sequence = Animated.parallel([
    // Scale up with bounce effect
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: config.duration,
      easing: config.easing,
      useNativeDriver: config.useNativeDriver,
    }),
    
    // Fade in
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: config.duration * 0.6,
      easing: Easing.out(Easing.quad),
      useNativeDriver: config.useNativeDriver,
    }),
    
    // Rotation for extra flair
    Animated.timing(rotationAnimation, {
      toValue: 1,
      duration: config.duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: config.useNativeDriver,
    }),
  ]);
  
  if (onComplete) {
    sequence.start(onComplete);
  }
  
  return sequence;
};

export const createAnticipationAnimation = (
  duration: number = 2000,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  // const pulseAnimation = ...; // Quick fix: commented unused variable
  // const glowAnimation = ...; // Quick fix: commented unused variable
  
  const sequence = Animated.parallel([
    // Pulsing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: duration * 0.3,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: duration * 0.3,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ),
    
    // Glow effect
    Animated.timing(glowAnimation, {
      toValue: 1,
      duration: duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
  
  if (onComplete) {
    sequence.start(onComplete);
  }
  
  return sequence;
};

export const createRarityRevealSequence = (
  rarity: keyof RarityAnimationConfig,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  // const config = ...; // Quick fix: commented unused variable
  
  // const revealAnimation = ...; // Quick fix: commented unused variable
  // const sparkleAnimation = ...; // Quick fix: commented unused variable
  
  const sequence = Animated.sequence([
    // Initial reveal
    Animated.timing(revealAnimation, {
      toValue: 1,
      duration: config.duration * 0.7,
      easing: config.easing,
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

export const getRarityVisualConfig = (rarity: string) => {
  const configs = {
    bronze: {
      colors: ['#CD7F32', '#B8860B', '#DAA520'],
      glowColor: '#CD7F32',
      particleCount: 10,
      scale: 1.0,
    },
    silver: {
      colors: ['#C0C0C0', '#E5E4E2', '#F5F5F5'],
      glowColor: '#C0C0C0',
      particleCount: 20,
      scale: 1.1,
    },
    gold: {
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
      glowColor: '#FFD700',
      particleCount: 30,
      scale: 1.2,
    },
    legendary: {
      colors: ['#FF1493', '#FF69B4', '#FFB6C1'],
      glowColor: '#FF1493',
      particleCount: 50,
      scale: 1.3,
    },
  };
  
  return configs[rarity as keyof typeof configs] || configs.bronze;
};

export const createSkipAnimation = (
  onComplete?: () => void
): Animated.CompositeAnimation => {
  // const skipAnimation = ...; // Quick fix: commented unused variable
  
  const sequence = Animated.timing(skipAnimation, {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });
  
  if (onComplete) {
    sequence.start(onComplete);
  }
  
  return sequence;
}; 