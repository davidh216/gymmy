// src/components/multi-gymmy-ui/character-visual/StateTransition.tsx
// Handles smooth transitions between character states with visual effects

import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Animated } from 'react-native';
import { GymmyCharacter } from '../../../context/types/MultiGymmyTypes';
import { AnimationState, ANIMATION_CONFIG } from '../shared/AnimationUtils';

// ==============================================================================
// TYPES AND INTERFACES
// ==============================================================================

export interface StateTransitionProps {
  currentState: AnimationState;
  previousState?: AnimationState;
  character: GymmyCharacter;
  size: 'small' | 'medium' | 'large' | 'xl';
  onTransitionComplete?: (state: AnimationState) => void;
  duration?: number;
  showEffects?: boolean;
}

interface TransitionEffect {
  type: 'particle' | 'glow' | 'ripple' | 'flash' | 'sparkle';
  duration: number;
  color: string;
  intensity: number;
}

// ==============================================================================
// TRANSITION CONFIGURATIONS
// ==============================================================================

const STATE_TRANSITIONS: Record<string, Record<AnimationState, TransitionEffect[]>> = {
  // Transitions TO excited state
  excited: {
    idle: [
      { type: 'sparkle', duration: 500, color: '#FFD700', intensity: 0.8 },
      { type: 'glow', duration: 300, color: '#FFA500', intensity: 0.6 },
    ],
    training: [
      { type: 'flash', duration: 200, color: '#FF6B35', intensity: 1.0 },
    ],
    tired: [
      { type: 'glow', duration: 800, color: '#32CD32', intensity: 0.7 },
      { type: 'particle', duration: 600, color: '#90EE90', intensity: 0.5 },
    ],
    celebrating: [],
    evolved: [],
  },
  
  // Transitions TO training state
  training: {
    idle: [
      { type: 'ripple', duration: 400, color: '#007AFF', intensity: 0.6 },
    ],
    excited: [
      { type: 'flash', duration: 150, color: '#FF3B30', intensity: 0.8 },
    ],
    tired: [
      { type: 'glow', duration: 600, color: '#34C759', intensity: 0.5 },
    ],
    celebrating: [
      { type: 'ripple', duration: 300, color: '#FF9500', intensity: 0.7 },
    ],
    evolved: [],
  },
  
  // Transitions TO evolved state
  evolved: {
    idle: [
      { type: 'flash', duration: 1000, color: '#AF52DE', intensity: 1.0 },
      { type: 'particle', duration: 2000, color: '#BF5AF2', intensity: 0.9 },
      { type: 'glow', duration: 3000, color: '#DA70D6', intensity: 0.8 },
    ],
    excited: [
      { type: 'flash', duration: 800, color: '#FF2D92', intensity: 1.0 },
      { type: 'sparkle', duration: 1500, color: '#FF1493', intensity: 0.9 },
    ],
    training: [
      { type: 'ripple', duration: 1200, color: '#8A2BE2', intensity: 0.8 },
      { type: 'glow', duration: 2000, color: '#9370DB', intensity: 0.7 },
    ],
    tired: [
      { type: 'glow', duration: 2500, color: '#DDA0DD', intensity: 0.6 },
      { type: 'particle', duration: 2000, color: '#E6E6FA', intensity: 0.5 },
    ],
    celebrating: [
      { type: 'flash', duration: 500, color: '#FF69B4', intensity: 1.0 },
    ],
  },
  
  // Transitions TO celebrating state
  celebrating: {
    idle: [
      { type: 'sparkle', duration: 800, color: '#FFD700', intensity: 0.9 },
      { type: 'particle', duration: 1000, color: '#FFA500', intensity: 0.7 },
    ],
    excited: [
      { type: 'flash', duration: 300, color: '#FF6347', intensity: 0.8 },
      { type: 'sparkle', duration: 600, color: '#FF4500', intensity: 0.6 },
    ],
    training: [
      { type: 'ripple', duration: 500, color: '#32CD32', intensity: 0.7 },
      { type: 'glow', duration: 800, color: '#90EE90', intensity: 0.5 },
    ],
    tired: [
      { type: 'glow', duration: 1000, color: '#FFD700', intensity: 0.8 },
      { type: 'particle', duration: 1200, color: '#FFA500', intensity: 0.6 },
    ],
    evolved: [
      { type: 'flash', duration: 400, color: '#FF1493', intensity: 1.0 },
    ],
  },
  
  // Transitions TO tired state
  tired: {
    idle: [
      { type: 'glow', duration: 600, color: '#8E8E93', intensity: 0.3 },
    ],
    excited: [
      { type: 'glow', duration: 800, color: '#AEAEB2', intensity: 0.4 },
    ],
    training: [
      { type: 'ripple', duration: 700, color: '#C7C7CC', intensity: 0.3 },
      { type: 'glow', duration: 900, color: '#8E8E93', intensity: 0.2 },
    ],
    celebrating: [
      { type: 'glow', duration: 500, color: '#AEAEB2', intensity: 0.3 },
    ],
    evolved: [
      { type: 'glow', duration: 1000, color: '#8E8E93', intensity: 0.2 },
    ],
  },
  
  // Transitions TO idle state (subtle)
  idle: {
    excited: [
      { type: 'glow', duration: 400, color: '#E5E5EA', intensity: 0.3 },
    ],
    training: [
      { type: 'ripple', duration: 500, color: '#F2F2F7', intensity: 0.2 },
    ],
    celebrating: [
      { type: 'glow', duration: 600, color: '#E5E5EA', intensity: 0.4 },
    ],
    tired: [
      { type: 'glow', duration: 700, color: '#F2F2F7', intensity: 0.3 },
    ],
    evolved: [
      { type: 'glow', duration: 800, color: '#E5E5EA', intensity: 0.5 },
    ],
  },
};

// ==============================================================================
// SIZE CONFIGURATIONS
// ==============================================================================

const EFFECT_SIZES = {
  small: {
    particleSize: 4,
    glowRadius: 8,
    rippleSize: 40,
    effectScale: 0.6,
  },
  medium: {
    particleSize: 6,
    glowRadius: 12,
    rippleSize: 60,
    effectScale: 0.8,
  },
  large: {
    particleSize: 8,
    glowRadius: 16,
    rippleSize: 80,
    effectScale: 1.0,
  },
  xl: {
    particleSize: 10,
    glowRadius: 20,
    rippleSize: 100,
    effectScale: 1.2,
  },
} as const;

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

export const StateTransition: React.FC<StateTransitionProps> = ({
  currentState,
  previousState,
  character,
  size,
  onTransitionComplete,
  duration,
  showEffects = true,
}) => {
  // ==============================================================================
  // ANIMATION VALUES
  // ==============================================================================
  
  const flashAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  
  const effectConfig = EFFECT_SIZES[size];
  
  // ==============================================================================
  // TRANSITION EFFECT LOGIC
  // ==============================================================================
  
  const transitionEffects = useMemo(() => {
    if (!previousState || !showEffects) return [];
    
    const stateTransitions = STATE_TRANSITIONS[currentState];
    return stateTransitions?.[previousState] || [];
  }, [currentState, previousState, showEffects]);
  
  // ==============================================================================
  // ANIMATION EXECUTION
  // ==============================================================================
  
  useEffect(() => {
    if (transitionEffects.length === 0) return;
    
    const animations: Animated.CompositeAnimation[] = [];
    
    transitionEffects.forEach((effect) => {
      const animDuration = duration || effect.duration;
      
      switch (effect.type) {
        case 'flash':
          animations.push(
            Animated.sequence([
              Animated.timing(flashAnim, {
                toValue: effect.intensity,
                duration: animDuration * 0.3,
                useNativeDriver: false,
              }),
              Animated.timing(flashAnim, {
                toValue: 0,
                duration: animDuration * 0.7,
                useNativeDriver: false,
              }),
            ])
          );
          break;
          
        case 'glow':
          animations.push(
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: effect.intensity,
                duration: animDuration * 0.4,
                easing: ANIMATION_CONFIG.easing.standard,
                useNativeDriver: false,
              }),
              Animated.timing(glowAnim, {
                toValue: 0,
                duration: animDuration * 0.6,
                easing: ANIMATION_CONFIG.easing.standard,
                useNativeDriver: false,
              }),
            ])
          );
          break;
          
        case 'ripple':
          animations.push(
            Animated.timing(rippleAnim, {
              toValue: effect.intensity,
              duration: animDuration,
              easing: ANIMATION_CONFIG.easing.standard,
              useNativeDriver: true,
            })
          );
          break;
          
        case 'particle':
          animations.push(
            Animated.sequence([
              Animated.timing(particleAnim, {
                toValue: effect.intensity,
                duration: animDuration * 0.6,
                easing: ANIMATION_CONFIG.easing.standard,
                useNativeDriver: true,
              }),
              Animated.timing(particleAnim, {
                toValue: 0,
                duration: animDuration * 0.4,
                easing: ANIMATION_CONFIG.easing.standard,
                useNativeDriver: true,
              }),
            ])
          );
          break;
          
        case 'sparkle':
          animations.push(
            Animated.loop(
              Animated.sequence([
                Animated.timing(sparkleAnim, {
                  toValue: effect.intensity,
                  duration: animDuration * 0.2,
                  useNativeDriver: true,
                }),
                Animated.timing(sparkleAnim, {
                  toValue: 0,
                  duration: animDuration * 0.2,
                  useNativeDriver: true,
                }),
              ]),
              { iterations: 3 }
            )
          );
          break;
      }
    });
    
    // Run all animations in parallel
    if (animations.length > 0) {
      Animated.parallel(animations).start(({ finished }) => {
        if (finished && onTransitionComplete) {
          onTransitionComplete(currentState);
        }
        
        // Reset animation values
        flashAnim.setValue(0);
        glowAnim.setValue(0);
        rippleAnim.setValue(0);
        particleAnim.setValue(0);
        sparkleAnim.setValue(0);
      });
    }
  }, [
    transitionEffects,
    duration,
    currentState,
    onTransitionComplete,
    flashAnim,
    glowAnim,
    rippleAnim,
    particleAnim,
    sparkleAnim,
  ]);
  
  // ==============================================================================
  // RENDER EFFECTS
  // ==============================================================================
  
  const renderFlashEffect = useMemo(() => {
    const effect = transitionEffects.find(e => e.type === 'flash');
    if (!effect) return null;
    
    return (
      <Animated.View
        style={[
          styles.flashOverlay,
          {
            backgroundColor: effect.color,
            opacity: flashAnim,
          },
        ]}
        pointerEvents=\"none\"
      />
    );
  }, [transitionEffects, flashAnim]);
  
  const renderGlowEffect = useMemo(() => {
    const effect = transitionEffects.find(e => e.type === 'glow');
    if (!effect) return null;
    
    return (
      <Animated.View
        style={[
          styles.glowEffect,
          {
            shadowColor: effect.color,
            shadowRadius: effectConfig.glowRadius,
            shadowOpacity: glowAnim,
            backgroundColor: effect.color,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
        pointerEvents=\"none\"
      />
    );
  }, [transitionEffects, glowAnim, effectConfig.glowRadius]);
  
  const renderRippleEffect = useMemo(() => {
    const effect = transitionEffects.find(e => e.type === 'ripple');
    if (!effect) return null;
    
    const scale = rippleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 2],
    });
    
    const opacity = rippleAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    });
    
    return (
      <Animated.View
        style={[
          styles.rippleEffect,
          {
            width: effectConfig.rippleSize,
            height: effectConfig.rippleSize,
            borderRadius: effectConfig.rippleSize / 2,
            borderColor: effect.color,
            borderWidth: 2,
            transform: [{ scale }],
            opacity,
          },
        ]}
        pointerEvents=\"none\"
      />
    );
  }, [transitionEffects, rippleAnim, effectConfig.rippleSize]);
  
  const renderParticleEffect = useMemo(() => {
    const effect = transitionEffects.find(e => e.type === 'particle');
    if (!effect) return null;
    
    return (
      <View style={styles.particleContainer} pointerEvents=\"none\">
        {Array.from({ length: 6 }).map((_, index) => {
          const angle = (index * 60) * (Math.PI / 180);
          const distance = 30 * effectConfig.effectScale;
          
          const translateX = particleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.cos(angle) * distance],
          });
          
          const translateY = particleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.sin(angle) * distance],
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  width: effectConfig.particleSize,
                  height: effectConfig.particleSize,
                  borderRadius: effectConfig.particleSize / 2,
                  backgroundColor: effect.color,
                  opacity: particleAnim,
                  transform: [
                    { translateX },
                    { translateY },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
    );
  }, [transitionEffects, particleAnim, effectConfig]);
  
  const renderSparkleEffect = useMemo(() => {
    const effect = transitionEffects.find(e => e.type === 'sparkle');
    if (!effect) return null;
    
    return (
      <View style={styles.sparkleContainer} pointerEvents=\"none\">
        {Array.from({ length: 4 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.sparkle,
              {
                backgroundColor: effect.color,
                opacity: sparkleAnim,
                transform: [
                  {
                    rotate: sparkleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  }, [transitionEffects, sparkleAnim]);
  
  // ==============================================================================
  // RENDER
  // ==============================================================================
  
  if (!showEffects || transitionEffects.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container} pointerEvents=\"none\">
      {renderFlashEffect}
      {renderGlowEffect}
      {renderRippleEffect}
      {renderParticleEffect}
      {renderSparkleEffect}
    </View>
  );
};

// ==============================================================================
// STYLES
// ==============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  
  flashOverlay: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 50,
  },
  
  glowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  
  rippleEffect: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  particle: {
    position: 'absolute',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 0.8,
    elevation: 4,
  },
  
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 3,
    shadowOpacity: 0.9,
    elevation: 6,
  },
});

export default StateTransition;