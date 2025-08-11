// src/components/multi-gymmy-ui/character-visual/AnimationController.tsx
// Centralized animation controller for complex character animation sequences

import React, { useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Animated } from 'react-native';
import { GymmyCharacter } from '../../../context/types/MultiGymmyTypes';
import { 
  AnimationState, 
  ANIMATION_CONFIG, 
  CHARACTER_ANIMATION_SEQUENCES,
  CharacterAnimationSequence,
} from '../shared/AnimationUtils';

// ==============================================================================
// TYPES AND INTERFACES
// ==============================================================================

export interface AnimationControllerProps {
  character: GymmyCharacter;
  children: (animatedValues: AnimatedValues, controls: AnimationControls) => React.ReactNode;
  initialState?: AnimationState;
  autoPlay?: boolean;
  loop?: boolean;
  onStateChange?: (state: AnimationState) => void;
  onSequenceComplete?: (sequence: string) => void;
  performanceMode?: 'high' | 'medium' | 'low';
}

export interface AnimatedValues {
  scale: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
  translateX: Animated.Value;
  translateY: Animated.Value;
  color: Animated.Value;
  glow: Animated.Value;
}

export interface AnimationControls {
  playState: (state: AnimationState, options?: AnimationOptions) => Promise<void>;
  playSequence: (sequenceName: string, options?: SequenceOptions) => Promise<void>;
  stopAll: () => void;
  pauseAll: () => void;
  resumeAll: () => void;
  getCurrentState: () => AnimationState;
  isPlaying: () => boolean;
}

export interface AnimationOptions {
  duration?: number;
  easing?: any;
  delay?: number;
  useNativeDriver?: boolean;
}

export interface SequenceOptions extends AnimationOptions {
  loop?: boolean;
  iterations?: number;
  onStepComplete?: (step: number) => void;
}

export interface AnimationControllerRef extends AnimationControls {}

// ==============================================================================
// ANIMATION CONTROLLER COMPONENT
// ==============================================================================

export const AnimationController = forwardRef<AnimationControllerRef, AnimationControllerProps>(({
  character,
  children,
  initialState = 'idle',
  autoPlay = false,
  loop = false,
  onStateChange,
  onSequenceComplete,
  performanceMode = 'high',
}, ref) => {
  // ==============================================================================
  // ANIMATION VALUES
  // ==============================================================================
  
  const animatedValues: AnimatedValues = useMemo(() => ({
    scale: useRef(new Animated.Value(1)).current,
    opacity: useRef(new Animated.Value(1)).current,
    rotation: useRef(new Animated.Value(0)).current,
    translateX: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(0)).current,
    color: useRef(new Animated.Value(0)).current,
    glow: useRef(new Animated.Value(0)).current,
  }), []);
  
  // ==============================================================================
  // STATE MANAGEMENT
  // ==============================================================================
  
  const currentState = useRef<AnimationState>(initialState);
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const isPlaying = useRef(false);
  const isPaused = useRef(false);
  
  // ==============================================================================
  // PERFORMANCE CONFIGURATIONS
  // ==============================================================================
  
  const performanceConfig = useMemo(() => {
    switch (performanceMode) {
      case 'low':
        return {
          useNativeDriver: false,
          maxDuration: 1000,
          reducedEffects: true,
          skipComplexAnimations: true,
        };
      case 'medium':
        return {
          useNativeDriver: true,
          maxDuration: 2000,
          reducedEffects: false,
          skipComplexAnimations: false,
        };
      default: // high
        return {
          useNativeDriver: true,
          maxDuration: 5000,
          reducedEffects: false,
          skipComplexAnimations: false,
        };
    }
  }, [performanceMode]);
  
  // ==============================================================================
  // ANIMATION METHODS
  // ==============================================================================
  
  const stopAll = useCallback(() => {
    if (currentAnimation.current) {
      currentAnimation.current.stop();
      currentAnimation.current = null;
    }
    isPlaying.current = false;
    isPaused.current = false;
  }, []);
  
  const pauseAll = useCallback(() => {
    if (currentAnimation.current && isPlaying.current) {
      currentAnimation.current.stop();
      isPaused.current = true;
    }
  }, []);
  
  const resumeAll = useCallback(() => {
    if (isPaused.current) {
      isPaused.current = false;
      // Resume with current state
      playState(currentState.current);
    }
  }, []);
  
  const playState = useCallback(async (
    state: AnimationState, 
    options: AnimationOptions = {}
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      stopAll(); // Stop any current animation
      
      currentState.current = state;
      isPlaying.current = true;
      
      if (onStateChange) {
        onStateChange(state);
      }
      
      const config = {
        duration: Math.min(options.duration || ANIMATION_CONFIG.timing.normal, performanceConfig.maxDuration),
        easing: options.easing || ANIMATION_CONFIG.easing.standard,
        useNativeDriver: options.useNativeDriver ?? performanceConfig.useNativeDriver,
        delay: options.delay || 0,
      };
      
      const animations: Animated.CompositeAnimation[] = [];
      
      // Create animations based on state
      switch (state) {
        case 'excited':
          animations.push(
            Animated.timing(animatedValues.scale, {
              toValue: 1.1,
              ...config,
            }),
            Animated.timing(animatedValues.glow, {
              toValue: 0.8,
              ...config,
              useNativeDriver: false, // Glow effects can't use native driver
            })
          );
          
          if (!performanceConfig.reducedEffects) {
            animations.push(
              Animated.timing(animatedValues.rotation, {
                toValue: 5, // 5 degree rotation
                ...config,
              })
            );
          }
          break;
          
        case 'training':
          animations.push(
            Animated.loop(
              Animated.sequence([
                Animated.timing(animatedValues.scale, {
                  toValue: 0.95,
                  duration: config.duration / 2,
                  easing: config.easing,
                  useNativeDriver: config.useNativeDriver,
                }),
                Animated.timing(animatedValues.scale, {
                  toValue: 1,
                  duration: config.duration / 2,
                  easing: config.easing,
                  useNativeDriver: config.useNativeDriver,
                }),
              ]),
              { iterations: loop ? -1 : 3 }
            )
          );
          break;
          
        case 'evolved':
          if (!performanceConfig.skipComplexAnimations) {
            animations.push(
              Animated.sequence([
                Animated.timing(animatedValues.scale, {
                  toValue: 1.5,
                  duration: config.duration * 0.3,
                  easing: ANIMATION_CONFIG.easing.elastic,
                  useNativeDriver: config.useNativeDriver,
                }),
                Animated.timing(animatedValues.glow, {
                  toValue: 1,
                  duration: config.duration * 0.4,
                  useNativeDriver: false,
                }),
                Animated.timing(animatedValues.scale, {
                  toValue: 1,
                  duration: config.duration * 0.3,
                  easing: ANIMATION_CONFIG.easing.bounce,
                  useNativeDriver: config.useNativeDriver,
                }),
              ])
            );
          }
          break;
          
        case 'celebrating':
          animations.push(
            Animated.loop(
              Animated.sequence([
                Animated.timing(animatedValues.scale, {
                  toValue: 1.05,
                  duration: config.duration / 4,
                  useNativeDriver: config.useNativeDriver,
                }),
                Animated.timing(animatedValues.rotation, {
                  toValue: -2,
                  duration: config.duration / 8,
                  useNativeDriver: config.useNativeDriver,
                }),
                Animated.timing(animatedValues.rotation, {
                  toValue: 2,
                  duration: config.duration / 4,
                  useNativeDriver: config.useNativeDriver,
                }),
                Animated.timing(animatedValues.rotation, {
                  toValue: 0,
                  duration: config.duration / 8,
                  useNativeDriver: config.useNativeDriver,
                }),
                Animated.timing(animatedValues.scale, {
                  toValue: 1,
                  duration: config.duration / 4,
                  useNativeDriver: config.useNativeDriver,
                }),
              ]),
              { iterations: loop ? -1 : 3 }
            )
          );
          break;
        
        case 'tired':
          animations.push(
            Animated.timing(animatedValues.opacity, {
              toValue: 0.6,
              ...config,
            }),
            Animated.timing(animatedValues.scale, {
              toValue: 0.9,
              ...config,
            })
          );
          break;
          
        default: // idle
          animations.push(
            Animated.timing(animatedValues.scale, {
              toValue: 1,
              ...config,
            }),
            Animated.timing(animatedValues.opacity, {
              toValue: 1,
              ...config,
            }),
            Animated.timing(animatedValues.rotation, {
              toValue: 0,
              ...config,
            }),
            Animated.timing(animatedValues.glow, {
              toValue: 0,
              ...config,
              useNativeDriver: false,
            })
          );
      }
      
      if (animations.length > 0) {
        currentAnimation.current = Animated.parallel(animations);
        
        setTimeout(() => {
          currentAnimation.current?.start(({ finished }) => {
            isPlaying.current = false;
            if (finished) {
              resolve();
            } else {
              reject(new Error('Animation was interrupted'));
            }
          });
        }, config.delay);
      } else {
        isPlaying.current = false;
        resolve();
      }
    });
  }, [animatedValues, stopAll, onStateChange, performanceConfig, loop]);
  
  const playSequence = useCallback(async (
    sequenceName: string,
    options: SequenceOptions = {}
  ): Promise<void> => {
    const sequence = CHARACTER_ANIMATION_SEQUENCES[sequenceName];
    if (!sequence) {
      throw new Error(`Animation sequence "${sequenceName}" not found`);
    }
    
    const iterations = options.iterations || (sequence.loop ? -1 : 1);
    let currentIteration = 0;
    
    const runSequence = async (): Promise<void> => {
      for (let i = 0; i < sequence.states.length; i++) {
        const state = sequence.states[i];
        const duration = sequence.durations[i] || ANIMATION_CONFIG.timing.normal;
        
        await playState(state, {
          ...options,
          duration,
        });
        
        if (options.onStepComplete) {
          options.onStepComplete(i);
        }
        
        // Check if we should continue
        if (!isPlaying.current) break;
      }
    };
    
    // Run the sequence with iterations
    if (iterations === -1) {
      // Infinite loop
      while (isPlaying.current) {
        await runSequence();
        currentIteration++;
      }
    } else {
      // Fixed iterations
      for (currentIteration = 0; currentIteration < iterations; currentIteration++) {
        await runSequence();
        if (!isPlaying.current) break;
      }
    }
    
    if (onSequenceComplete) {
      onSequenceComplete(sequenceName);
    }
  }, [playState, onSequenceComplete]);
  
  // ==============================================================================
  // ANIMATION CONTROLS
  // ==============================================================================
  
  const controls: AnimationControls = useMemo(() => ({
    playState,
    playSequence,
    stopAll,
    pauseAll,
    resumeAll,
    getCurrentState: () => currentState.current,
    isPlaying: () => isPlaying.current,
  }), [playState, playSequence, stopAll, pauseAll, resumeAll]);
  
  // ==============================================================================
  // IMPERATIVE HANDLE
  // ==============================================================================
  
  useImperativeHandle(ref, () => controls, [controls]);
  
  // ==============================================================================
  // AUTO-PLAY EFFECT
  // ==============================================================================
  
  React.useEffect(() => {
    if (autoPlay) {
      playState(initialState);
    }
  }, [autoPlay, initialState, playState]);
  
  // ==============================================================================
  // CLEANUP EFFECT
  // ==============================================================================
  
  React.useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);
  
  // ==============================================================================
  // RENDER
  // ==============================================================================
  
  return (
    <>
      {children(animatedValues, controls)}
    </>
  );
});

AnimationController.displayName = 'AnimationController';

export default AnimationController;