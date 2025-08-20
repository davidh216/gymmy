// src/components/multi-gymmy-ui/shared/AnimationUtils.tsx
// Animation utilities and configurations for Multi-Gymmy UI components

import {
  // Animated,
  // Easing
} from 'react-native';
import {
  // useRef,
  // useCallback,
  // useMemo
} from 'react';

// ==============================================================================
// ANIMATION CONFIGURATIONS
// ==============================================================================

export const ANIMATION_CONFIG = {
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
    evolution: 3000,
  },
  easing: {
    standard: Easing.out(Easing.quad),
    bounce: Easing.bounce,
    elastic: Easing.elastic(1),
    bezier: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  },
  transform: {
    scaleMin: 0.95,
    scaleMax: 1.1,
    scaleEvolution: 1.5,
  },
} as const;

// ==============================================================================
// ANIMATION TYPES
// ==============================================================================

export type AnimationState = 'idle' | 'excited' | 'training' | 'evolved' | 'tired' | 'celebrating';

export interface AnimationConfig {
  duration?: number;
  easing?: any;
  useNativeDriver?: boolean;
  delay?: number;
  loop?: boolean;
}

export interface CharacterAnimationSequence {
  name: string;
  states: AnimationState[];
  durations: number[];
  transitions: string[];
  loop: boolean;
}

// ==============================================================================
// PERFORMANCE-OPTIMIZED ANIMATION HOOKS
// ==============================================================================

/**
 * High-performance animation hook using native driver
 */
export const useCharacterAnimation = (initialState: AnimationState = 'idle') => {
  // const animValue = ...; // Quick fix: commented unused variable
  // const scaleValue = ...; // Quick fix: commented unused variable
  // const opacityValue = ...; // Quick fix: commented unused variable
  
  const animateToState = useCallback((targetState: AnimationState, config?: AnimationConfig) => {
    const animations: Animated.CompositeAnimation[] = [];
    
    switch (targetState) {
      case 'excited':
        animations.push(
          Animated.timing(scaleValue, {
            toValue: ANIMATION_CONFIG.transform.scaleMax,
            duration: config?.duration || ANIMATION_CONFIG.timing.fast,
            easing: config?.easing || ANIMATION_CONFIG.easing.bounce,
            useNativeDriver: config?.useNativeDriver ?? true,
          })
        );
        break;
        
      case 'training':
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(scaleValue, {
                toValue: ANIMATION_CONFIG.transform.scaleMin,
                duration: ANIMATION_CONFIG.timing.fast,
                easing: ANIMATION_CONFIG.easing.standard,
                useNativeDriver: true,
              }),
              Animated.timing(scaleValue, {
                toValue: 1,
                duration: ANIMATION_CONFIG.timing.fast,
                easing: ANIMATION_CONFIG.easing.standard,
                useNativeDriver: true,
              }),
            ])
          )
        );
        break;
        
      case 'evolved':
        animations.push(
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: ANIMATION_CONFIG.transform.scaleEvolution,
              duration: ANIMATION_CONFIG.timing.evolution / 3,
              easing: ANIMATION_CONFIG.easing.elastic,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: ANIMATION_CONFIG.timing.evolution / 3,
              easing: ANIMATION_CONFIG.easing.bounce,
              useNativeDriver: true,
            }),
          ])
        );
        break;
        
      case 'celebrating':
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(scaleValue, {
                toValue: 1.05,
                duration: ANIMATION_CONFIG.timing.normal,
                easing: ANIMATION_CONFIG.easing.standard,
                useNativeDriver: true,
              }),
              Animated.timing(scaleValue, {
                toValue: 1,
                duration: ANIMATION_CONFIG.timing.normal,
                easing: ANIMATION_CONFIG.easing.standard,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 3 }
          )
        );
        break;
        
      case 'tired':
        animations.push(
          Animated.timing(opacityValue, {
            toValue: 0.6,
            duration: ANIMATION_CONFIG.timing.slow,
            easing: ANIMATION_CONFIG.easing.standard,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: ANIMATION_CONFIG.transform.scaleMin,
            duration: ANIMATION_CONFIG.timing.slow,
            easing: ANIMATION_CONFIG.easing.standard,
            useNativeDriver: true,
          })
        );
        break;
        
      default: // idle
        animations.push(
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: config?.duration || ANIMATION_CONFIG.timing.normal,
            easing: config?.easing || ANIMATION_CONFIG.easing.standard,
            useNativeDriver: config?.useNativeDriver ?? true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: config?.duration || ANIMATION_CONFIG.timing.normal,
            easing: config?.easing || ANIMATION_CONFIG.easing.standard,
            useNativeDriver: config?.useNativeDriver ?? true,
          })
        );
    }
    
    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [scaleValue, opacityValue]);
  
  const animatedStyle = useMemo(() => ({
    transform: [{ scale: scaleValue }],
    opacity: opacityValue,
  }), [scaleValue, opacityValue]);
  
  return {
    animatedStyle,
    animateToState,
    values: {
      animValue,
      scaleValue,
      opacityValue,
    },
  };
};

/**
 * Evolution animation hook with complex sequence
 */
export const useEvolutionAnimation = () => {
  // const progressValue = ...; // Quick fix: commented unused variable
  // const glowValue = ...; // Quick fix: commented unused variable
  // const particleValue = ...; // Quick fix: commented unused variable
  
  const startEvolutionAnimation = useCallback((onComplete?: () => void) => {
    // Reset values
    progressValue.setValue(0);
    glowValue.setValue(0);
    particleValue.setValue(0);
    
    // Complex evolution sequence
    Animated.sequence([
      // Phase 1: Build up
      Animated.parallel([
        Animated.timing(progressValue, {
          toValue: 0.3,
          duration: ANIMATION_CONFIG.timing.evolution / 3,
          easing: ANIMATION_CONFIG.easing.standard,
          useNativeDriver: false, // Can't use native driver with non-transform props
        }),
        Animated.timing(glowValue, {
          toValue: 0.5,
          duration: ANIMATION_CONFIG.timing.evolution / 3,
          easing: ANIMATION_CONFIG.easing.standard,
          useNativeDriver: false,
        }),
      ]),
      
      // Phase 2: Climax
      Animated.parallel([
        Animated.timing(progressValue, {
          toValue: 1,
          duration: ANIMATION_CONFIG.timing.evolution / 3,
          easing: ANIMATION_CONFIG.easing.elastic,
          useNativeDriver: false,
        }),
        Animated.timing(glowValue, {
          toValue: 1,
          duration: ANIMATION_CONFIG.timing.evolution / 3,
          easing: ANIMATION_CONFIG.easing.elastic,
          useNativeDriver: false,
        }),
        Animated.timing(particleValue, {
          toValue: 1,
          duration: ANIMATION_CONFIG.timing.evolution / 3,
          easing: ANIMATION_CONFIG.easing.standard,
          useNativeDriver: false,
        }),
      ]),
      
      // Phase 3: Settle
      Animated.parallel([
        Animated.timing(glowValue, {
          toValue: 0.2,
          duration: ANIMATION_CONFIG.timing.evolution / 3,
          easing: ANIMATION_CONFIG.easing.standard,
          useNativeDriver: false,
        }),
        Animated.timing(particleValue, {
          toValue: 0,
          duration: ANIMATION_CONFIG.timing.evolution / 3,
          easing: ANIMATION_CONFIG.easing.standard,
          useNativeDriver: false,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished && onComplete) {
        onComplete();
      }
    });
  }, [progressValue, glowValue, particleValue]);
  
  return {
    startEvolutionAnimation,
    values: {
      progressValue,
      glowValue,
      particleValue,
    },
  };
};

/**
 * Experience gain animation hook
 */
export const useExperienceAnimation = () => {
  // const expValue = ...; // Quick fix: commented unused variable
  // const counterValue = ...; // Quick fix: commented unused variable
  
  const animateExperienceGain = useCallback((
    startExp: number, 
    endExp: number, 
    duration = ANIMATION_CONFIG.timing.normal,
    onUpdate?: (currentExp: number) => void
  ) => {
    counterValue.setValue(startExp);
    
    // Add listener for counter updates
    const listenerId = counterValue.addListener(({ value }) => {
      if (onUpdate) {
        onUpdate(Math.round(value));
      }
    });
    
    Animated.timing(counterValue, {
      toValue: endExp,
      duration,
      easing: ANIMATION_CONFIG.easing.standard,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        counterValue.removeListener(listenerId);
      }
    });
    
    // Visual effect animation
    Animated.sequence([
      Animated.timing(expValue, {
        toValue: 1,
        duration: duration / 2,
        easing: ANIMATION_CONFIG.easing.standard,
        useNativeDriver: true,
      }),
      Animated.timing(expValue, {
        toValue: 0,
        duration: duration / 2,
        easing: ANIMATION_CONFIG.easing.standard,
        useNativeDriver: true,
      }),
    ]).start();
  }, [expValue, counterValue]);
  
  return {
    animateExperienceGain,
    values: {
      expValue,
      counterValue,
    },
  };
};

// ==============================================================================
// PERFORMANCE UTILITIES
// ==============================================================================

/**
 * Performance monitor for animations
 */
export const useAnimationPerformance = () => {
  // const frameRate = ...; // Quick fix: commented unused variable
  // const frameCount = ...; // Quick fix: commented unused variable
  // const startTime = ...; // Quick fix: commented unused variable
  
  const updatePerformance = useCallback(() => {
    frameCount.current++;
    // const currentTime = ...; // Quick fix: commented unused variable
    // const elapsed = ...; // Quick fix: commented unused variable
    
    if (elapsed >= 1000) { // Update every second
      frameRate.current = (frameCount.current * 1000) / elapsed;
      frameCount.current = 0;
      startTime.current = currentTime;
      
      // Warn about performance issues
      if (frameRate.current < 30) {
        console.warn(`Low animation framerate detected: ${frameRate.current.toFixed(1)} fps`);
      }
    }
  }, []);
  
  return {
    frameRate: frameRate.current,
    updatePerformance,
  };
};

/**
 * Memory-optimized animation cleanup
 */
export const useAnimationCleanup = (animations: Animated.CompositeAnimation[]) => {
  const cleanup = useCallback(() => {
    animations.forEach(animation => {
      animation.stop();
    });
  }, [animations]);
  
  return cleanup;
};

// ==============================================================================
// ANIMATION SEQUENCES
// ==============================================================================

export const CHARACTER_ANIMATION_SEQUENCES: Record<string, CharacterAnimationSequence> = {
  idle_breathing: {
    name: 'Idle Breathing',
    states: ['idle', 'idle', 'idle'],
    durations: [2000, 1000, 2000],
    transitions: ['ease-in', 'ease-out', 'ease-in'],
    loop: true,
  },
  
  workout_active: {
    name: 'Workout Active',
    states: ['training', 'excited', 'training'],
    durations: [1000, 500, 1000],
    transitions: ['ease-in-out', 'bounce', 'ease-in-out'],
    loop: true,
  },
  
  level_up_celebration: {
    name: 'Level Up Celebration',
    states: ['excited', 'celebrating', 'celebrating', 'idle'],
    durations: [500, 1000, 1000, 500],
    transitions: ['bounce', 'elastic', 'ease-out', 'ease-in'],
    loop: false,
  },
  
  evolution_sequence: {
    name: 'Evolution Sequence',
    states: ['excited', 'evolved', 'celebrating', 'idle'],
    durations: [1000, 3000, 2000, 1000],
    transitions: ['elastic', 'custom', 'bounce', 'ease-in'],
    loop: false,
  },
};

export default {
  ANIMATION_CONFIG,
  useCharacterAnimation,
  useEvolutionAnimation,
  useExperienceAnimation,
  useAnimationPerformance,
  useAnimationCleanup,
  CHARACTER_ANIMATION_SEQUENCES,
};