// src/components/multi-gymmy-ui/character-visual/EvolutionAnimation.tsx
// Dramatic evolution animation sequences with particle effects and transformations

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  // View,
  // StyleSheet,
  // Dimensions
} from 'react-native';
import {
  // Animated,
  // Text
} from 'react-native';
import {
  // GymmyCharacter,
  // EvolutionResult
} from '../../../context/types/MultiGymmyTypes';
import {
  // useEvolutionAnimation,
  // ANIMATION_CONFIG
} from '../shared/AnimationUtils';
import {
  // LinearGradient
} from 'expo-linear-gradient';

// ==============================================================================
// TYPES AND INTERFACES
// ==============================================================================

export interface EvolutionAnimationProps {
  character: GymmyCharacter;
  evolutionData?: EvolutionResult;
  isPlaying: boolean;
  onComplete?: () => void;
  onPhaseChange?: (phase: EvolutionPhase) => void;
  style?: any;
  showBackground?: boolean;
  autoStart?: boolean;
}

export type EvolutionPhase = 'prepare' | 'buildup' | 'climax' | 'transformation' | 'celebration' | 'complete';

interface EvolutionEffectConfig {
  particleCount: number;
  glowIntensity: number;
  transformationScale: number;
  duration: number;
  colors: string[];
}

// ==============================================================================
// EVOLUTION CONFIGURATIONS
// ==============================================================================

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EVOLUTION_CONFIGS: Record<number, EvolutionEffectConfig> = {
  1: {
    particleCount: 12,
    glowIntensity: 0.8,
    transformationScale: 1.3,
    duration: 3000,
    colors: ['#007AFF', '#5AC8FA', '#AF52DE'],
  },
  2: {
    particleCount: 18,
    glowIntensity: 1.0,
    transformationScale: 1.5,
    duration: 4000,
    colors: ['#FF9500', '#FF2D92', '#AF52DE', '#BF5AF2'],
  },
  3: {
    particleCount: 24,
    glowIntensity: 1.2,
    transformationScale: 1.8,
    duration: 5000,
    colors: ['#FFD60A', '#FF2D92', '#BF5AF2', '#30D158', '#FF9500'],
  },
};

const PHASE_DURATIONS = {
  prepare: 800,
  buildup: 1200,
  climax: 2000,
  transformation: 1500,
  celebration: 1000,
  complete: 500,
} as const;

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

export const EvolutionAnimation: React.FC<EvolutionAnimationProps> = ({
  character,
  evolutionData,
  isPlaying,
  onComplete,
  onPhaseChange,
  style,
  showBackground = true,
  autoStart = false,
}) => {
  // ==============================================================================
  // STATE AND REFS
  // ==============================================================================
  
  const [currentPhase, setCurrentPhase] = useState<EvolutionPhase>('prepare');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // const backgroundOpacity = ...; // Quick fix: commented unused variable
  // const mainScale = ...; // Quick fix: commented unused variable
  // const glowOpacity = ...; // Quick fix: commented unused variable
  // const particleOpacity = ...; // Quick fix: commented unused variable
  // const burstScale = ...; // Quick fix: commented unused variable
  // const celebrationScale = ...; // Quick fix: commented unused variable
  // const textOpacity = ...; // Quick fix: commented unused variable
  
  const { startEvolutionAnimation, values } = useEvolutionAnimation();
  
  // ==============================================================================
  // EVOLUTION DATA
  // ==============================================================================
  
  // const evolutionStage = ...; // Quick fix: commented unused variable
  // const config = ...; // Quick fix: commented unused variable
  
  const evolutionText = useMemo(() => {
    if (!evolutionData) return `${character.display_name} is evolving!`;
    
    const stageName = evolutionStage === 1 ? 'First Evolution' :
                     evolutionStage === 2 ? 'Second Evolution' :
                     evolutionStage === 3 ? 'Final Form' : `Stage ${evolutionStage}`;
    
    return `${character.display_name} evolved to ${stageName}!`;
  }, [character.display_name, evolutionData, evolutionStage]);
  
  // ==============================================================================
  // PHASE MANAGEMENT
  // ==============================================================================
  
  const changePhase = (newPhase: EvolutionPhase) => {
    setCurrentPhase(newPhase);
    if (onPhaseChange) {
      onPhaseChange(newPhase);
    }
  };
  
  // ==============================================================================
  // ANIMATION SEQUENCE
  // ==============================================================================
  
  const runEvolutionSequence = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    changePhase('prepare');
    
    // Phase 1: Prepare - Fade in background
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: PHASE_DURATIONS.prepare,
      useNativeDriver: false,
    }).start(() => {
      
      // Phase 2: Buildup - Start glow and particles
      changePhase('buildup');
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: config.glowIntensity,
          duration: PHASE_DURATIONS.buildup,
          useNativeDriver: false,
        }),
        Animated.timing(particleOpacity, {
          toValue: 1,
          duration: PHASE_DURATIONS.buildup,
          useNativeDriver: false,
        }),
        Animated.timing(mainScale, {
          toValue: 1.1,
          duration: PHASE_DURATIONS.buildup,
          easing: ANIMATION_CONFIG.easing.standard,
          useNativeDriver: true,
        }),
      ]).start(() => {
        
        // Phase 3: Climax - Maximum effects
        changePhase('climax');
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: config.glowIntensity * 1.5,
            duration: PHASE_DURATIONS.climax * 0.6,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.timing(mainScale, {
              toValue: config.transformationScale,
              duration: PHASE_DURATIONS.climax * 0.4,
              easing: ANIMATION_CONFIG.easing.elastic,
              useNativeDriver: true,
            }),
            Animated.timing(mainScale, {
              toValue: 1,
              duration: PHASE_DURATIONS.climax * 0.6,
              easing: ANIMATION_CONFIG.easing.bounce,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(burstScale, {
              toValue: 3,
              duration: PHASE_DURATIONS.climax * 0.3,
              useNativeDriver: true,
            }),
            Animated.timing(burstScale, {
              toValue: 0,
              duration: PHASE_DURATIONS.climax * 0.1,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          
          // Phase 4: Transformation - Show evolution text
          changePhase('transformation');
          Animated.parallel([
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: PHASE_DURATIONS.transformation * 0.5,
              useNativeDriver: true,
            }),
            Animated.timing(particleOpacity, {
              toValue: 0.3,
              duration: PHASE_DURATIONS.transformation,
              useNativeDriver: false,
            }),
          ]).start(() => {
            
            // Phase 5: Celebration - Final celebration effects
            changePhase('celebration');
            Animated.parallel([
              Animated.loop(
                Animated.sequence([
                  Animated.timing(celebrationScale, {
                    toValue: 1.2,
                    duration: PHASE_DURATIONS.celebration / 4,
                    useNativeDriver: true,
                  }),
                  Animated.timing(celebrationScale, {
                    toValue: 1,
                    duration: PHASE_DURATIONS.celebration / 4,
                    useNativeDriver: true,
                  }),
                ]),
                { iterations: 2 }
              ),
            ]).start(() => {
              
              // Phase 6: Complete - Fade out and finish
              changePhase('complete');
              Animated.parallel([
                Animated.timing(backgroundOpacity, {
                  toValue: 0,
                  duration: PHASE_DURATIONS.complete,
                  useNativeDriver: false,
                }),
                Animated.timing(textOpacity, {
                  toValue: 0,
                  duration: PHASE_DURATIONS.complete,
                  useNativeDriver: true,
                }),
                Animated.timing(glowOpacity, {
                  toValue: 0,
                  duration: PHASE_DURATIONS.complete,
                  useNativeDriver: false,
                }),
                Animated.timing(particleOpacity, {
                  toValue: 0,
                  duration: PHASE_DURATIONS.complete,
                  useNativeDriver: false,
                }),
              ]).start(() => {
                setIsAnimating(false);
                if (onComplete) {
                  onComplete();
                }
              });
            });
          });
        });
      });
    });
  };
  
  // ==============================================================================
  // EFFECTS
  // ==============================================================================
  
  useEffect(() => {
    if ((isPlaying || autoStart) && !isAnimating) {
      runEvolutionSequence();
    }
  }, [isPlaying, autoStart, isAnimating]);
  
  // Reset animations when not playing
  useEffect(() => {
    if (!isPlaying && !isAnimating) {
      backgroundOpacity.setValue(0);
      mainScale.setValue(1);
      glowOpacity.setValue(0);
      particleOpacity.setValue(0);
      burstScale.setValue(0);
      celebrationScale.setValue(1);
      textOpacity.setValue(0);
      setCurrentPhase('prepare');
    }
  }, [isPlaying, isAnimating]);
  
  // ==============================================================================
  // MEMOIZED COMPONENTS
  // ==============================================================================
  
  const renderBackground = useMemo(() => {
    if (!showBackground) return null;
    
    return (
      <Animated.View
        style={[
          styles.background,
          {
            opacity: backgroundOpacity,
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)']}
          style={styles.backgroundGradient}
        />
      </Animated.View>
    );
  }, [showBackground, backgroundOpacity]);
  
  const renderGlowEffect = useMemo(() => (
    <Animated.View
      style={[
        styles.glowContainer,
        {
          opacity: glowOpacity,
        },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={config.colors}
        style={styles.glowGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  ), [glowOpacity, config.colors]);
  
  const renderParticles = useMemo(() => (
    <Animated.View
      style={[
        styles.particleContainer,
        {
          opacity: particleOpacity,
        },
      ]}
      pointerEvents="none"
    >
      {Array.from({ length: config.particleCount }).map((_, index) => {
        // const angle = ...; // Quick fix: commented unused variable
        // const radius = ...; // Quick fix: commented unused variable
        
        // const x = ...; // Quick fix: commented unused variable
        // const y = ...; // Quick fix: commented unused variable
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: x + 150,
                top: y + 150,
                backgroundColor: config.colors[index % config.colors.length],
                transform: [
                  {
                    rotate: particleOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${360 * (index % 2 === 0 ? 1 : -1)}deg`],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </Animated.View>
  ), [particleOpacity, config.particleCount, config.colors]);
  
  const renderBurst = useMemo(() => (
    <Animated.View
      style={[
        styles.burst,
        {
          transform: [{ scale: burstScale }],
          opacity: burstScale.interpolate({
            inputRange: [0, 1, 3],
            outputRange: [0, 1, 0],
          }),
        },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['transparent', ...config.colors, 'transparent']}
        style={styles.burstGradient}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  ), [burstScale, config.colors]);
  
  const renderEvolutionText = useMemo(() => (
    <Animated.View
      style={[
        styles.textContainer,
        {
          opacity: textOpacity,
          transform: [{ scale: celebrationScale }],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.evolutionText}>
        {evolutionText}
      </Text>
      {evolutionData && (
        <View style={styles.statsContainer}>
          {Object.entries(evolutionData.stat_bonuses).map(([stat, bonus]) => (
            <Text key={stat} style={styles.statBonus}>
              {stat.toUpperCase()}: +{bonus}
            </Text>
          ))}
        </View>
      )}
    </Animated.View>
  ), [textOpacity, celebrationScale, evolutionText, evolutionData]);
  
  // ==============================================================================
  // RENDER
  // ==============================================================================
  
  if (!isPlaying && !isAnimating) {
    return null;
  }
  
  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {renderBackground}
      {renderGlowEffect}
      {renderParticles}
      {renderBurst}
      
      {/* Character container with main transformations */}
      <Animated.View
        style={[
          styles.characterContainer,
          {
            transform: [{ scale: mainScale }],
          },
        ]}
      >
        {/* Character content would be rendered here by parent */}
      </Animated.View>
      
      {renderEvolutionText}
    </View>
  );
};

// ==============================================================================
// STYLES
// ==============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  
  backgroundGradient: {
    flex: 1,
  },
  
  glowContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  
  particleContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
  },
  
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 0.8,
    elevation: 8,
  },
  
  burst: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  
  burstGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  
  characterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 160,
    height: 160,
  },
  
  textContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  
  evolutionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  
  statBonus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default EvolutionAnimation;