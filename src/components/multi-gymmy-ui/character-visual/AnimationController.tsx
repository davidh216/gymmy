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
          \n        case 'tired':\n          animations.push(\n            Animated.timing(animatedValues.opacity, {\n              toValue: 0.6,\n              ...config,\n            }),\n            Animated.timing(animatedValues.scale, {\n              toValue: 0.9,\n              ...config,\n            })\n          );\n          break;\n          \n        default: // idle\n          animations.push(\n            Animated.timing(animatedValues.scale, {\n              toValue: 1,\n              ...config,\n            }),\n            Animated.timing(animatedValues.opacity, {\n              toValue: 1,\n              ...config,\n            }),\n            Animated.timing(animatedValues.rotation, {\n              toValue: 0,\n              ...config,\n            }),\n            Animated.timing(animatedValues.glow, {\n              toValue: 0,\n              ...config,\n              useNativeDriver: false,\n            })\n          );\n      }\n      \n      if (animations.length > 0) {\n        currentAnimation.current = Animated.parallel(animations);\n        \n        setTimeout(() => {\n          currentAnimation.current?.start(({ finished }) => {\n            isPlaying.current = false;\n            if (finished) {\n              resolve();\n            } else {\n              reject(new Error('Animation was interrupted'));\n            }\n          });\n        }, config.delay);\n      } else {\n        isPlaying.current = false;\n        resolve();\n      }\n    });\n  }, [animatedValues, stopAll, onStateChange, performanceConfig, loop]);\n  \n  const playSequence = useCallback(async (\n    sequenceName: string,\n    options: SequenceOptions = {}\n  ): Promise<void> => {\n    const sequence = CHARACTER_ANIMATION_SEQUENCES[sequenceName];\n    if (!sequence) {\n      throw new Error(`Animation sequence \"${sequenceName}\" not found`);\n    }\n    \n    const iterations = options.iterations || (sequence.loop ? -1 : 1);\n    let currentIteration = 0;\n    \n    const runSequence = async (): Promise<void> => {\n      for (let i = 0; i < sequence.states.length; i++) {\n        const state = sequence.states[i];\n        const duration = sequence.durations[i] || ANIMATION_CONFIG.timing.normal;\n        \n        await playState(state, {\n          ...options,\n          duration,\n        });\n        \n        if (options.onStepComplete) {\n          options.onStepComplete(i);\n        }\n        \n        // Check if we should continue\n        if (!isPlaying.current) break;\n      }\n    };\n    \n    // Run the sequence with iterations\n    if (iterations === -1) {\n      // Infinite loop\n      while (isPlaying.current) {\n        await runSequence();\n        currentIteration++;\n      }\n    } else {\n      // Fixed iterations\n      for (currentIteration = 0; currentIteration < iterations; currentIteration++) {\n        await runSequence();\n        if (!isPlaying.current) break;\n      }\n    }\n    \n    if (onSequenceComplete) {\n      onSequenceComplete(sequenceName);\n    }\n  }, [playState, onSequenceComplete]);\n  \n  // ==============================================================================\n  // ANIMATION CONTROLS\n  // ==============================================================================\n  \n  const controls: AnimationControls = useMemo(() => ({\n    playState,\n    playSequence,\n    stopAll,\n    pauseAll,\n    resumeAll,\n    getCurrentState: () => currentState.current,\n    isPlaying: () => isPlaying.current,\n  }), [playState, playSequence, stopAll, pauseAll, resumeAll]);\n  \n  // ==============================================================================\n  // IMPERATIVE HANDLE\n  // ==============================================================================\n  \n  useImperativeHandle(ref, () => controls, [controls]);\n  \n  // ==============================================================================\n  // AUTO-PLAY EFFECT\n  // ==============================================================================\n  \n  React.useEffect(() => {\n    if (autoPlay) {\n      playState(initialState);\n    }\n  }, [autoPlay, initialState, playState]);\n  \n  // ==============================================================================\n  // CLEANUP EFFECT\n  // ==============================================================================\n  \n  React.useEffect(() => {\n    return () => {\n      stopAll();\n    };\n  }, [stopAll]);\n  \n  // ==============================================================================\n  // RENDER\n  // ==============================================================================\n  \n  return (\n    <>\n      {children(animatedValues, controls)}\n    </>\n  );\n});\n\nAnimationController.displayName = 'AnimationController';\n\nexport default AnimationController;"