// src/components/multi-gymmy-ui/character-visual/CharacterRenderer.tsx
// Core character rendering component with sprite management and visual effects

import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Animated, Text } from 'react-native';
import { GymmyCharacter } from '../../../context/types/MultiGymmyTypes';
import { LinearGradient } from 'expo-linear-gradient';

// ==============================================================================
// TYPES AND INTERFACES
// ==============================================================================

export interface CharacterRendererProps {
  character: GymmyCharacter;
  size: 'small' | 'medium' | 'large' | 'xl';
  mood?: {
    key: string;
    config: {
      emoji: string;
      color: string;
      effect: string;
    };
  };
  theme?: {
    rarity: any;
    specialization: any;
    combined: any;
  };
  optimizeForPerformance?: boolean;
  showEffects?: boolean;
}

interface SpriteFrameData {
  frame: number;
  totalFrames: number;
  animationSpeed: number;
}

// ==============================================================================
// CHARACTER SPRITE MAPPINGS
// ==============================================================================

const CHARACTER_SPRITES = {
  // Gymmy type to emoji mapping with evolution stages
  power: {
    base: '💪',
    stage1: '🔥💪',
    stage2: '⚡💪',
    stage3: '🏆💪',
  },
  blaze: {
    base: '🔥',
    stage1: '🔥⚡',
    stage2: '🔥🔥⚡',
    stage3: '🏆🔥',
  },
  transform: {
    base: '⚖️',
    stage1: '✨⚖️',
    stage2: '🌟⚖️',
    stage3: '🏆⚖️',
  },
  zen: {
    base: '🧘',
    stage1: '✨🧘',
    stage2: '🌸🧘',
    stage3: '🏆🧘',
  },
  pace: {
    base: '🏃',
    stage1: '💨🏃',
    stage2: '⚡🏃',
    stage3: '🏆🏃',
  },
  steady: {
    base: '🎯',
    stage1: '📊🎯',
    stage2: '📈🎯',
    stage3: '🏆🎯',
  },
  rally: {
    base: '🤝',
    stage1: '👥🤝',
    stage2: '🌟🤝',
    stage3: '🏆🤝',
  },
  rookie: {
    base: '⭐',
    stage1: '✨⭐',
    stage2: '🌟⭐',
    stage3: '🏆⭐',
  },
  specialist: {
    base: '🔬',
    stage1: '⚗️🔬',
    stage2: '🧪🔬',
    stage3: '🏆🔬',
  },
  seasonal: {
    base: '🎄',
    stage1: '❄️🎄',
    stage2: '✨🎄',
    stage3: '🏆🎄',
  },
  legendary: {
    base: '👑',
    stage1: '💎👑',
    stage2: '🌟👑',
    stage3: '🏆👑',
  },
  community: {
    base: '🌐',
    stage1: '🤝🌐',
    stage2: '🌟🌐',
    stage3: '🏆🌐',
  },
} as const;

// ==============================================================================
// SIZE CONFIGURATIONS
// ==============================================================================

const RENDERER_SIZE_CONFIG = {
  small: {
    spriteSize: 40,
    fontSize: 20,
    effectSize: 8,
  },
  medium: {
    spriteSize: 56,
    fontSize: 28,
    effectSize: 12,
  },
  large: {
    spriteSize: 80,
    fontSize: 40,
    effectSize: 16,
  },
  xl: {
    spriteSize: 120,
    fontSize: 60,
    effectSize: 24,
  },
} as const;

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  character,
  size,
  mood,
  theme,
  optimizeForPerformance = false,
  showEffects = true,
}) => {
  // ==============================================================================
  // STATE AND REFS
  // ==============================================================================
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const sizeConfig = RENDERER_SIZE_CONFIG[size];
  
  // ==============================================================================
  // SPRITE SELECTION
  // ==============================================================================
  
  const characterSprite = useMemo(() => {
    const typeSprites = CHARACTER_SPRITES[character.type as keyof typeof CHARACTER_SPRITES];
    if (!typeSprites) {
      return character.specialization === 'strength_training' ? '💪' : 
             character.specialization === 'cardio_endurance' ? '🏃' :
             character.specialization === 'flexibility_mobility' ? '🧘' :
             character.specialization === 'mental_wellness' ? '🧠' : '⭐';
    }
    
    // Select sprite based on evolution stage
    const evolutionStage = character.evolution_stage || 0;
    if (evolutionStage >= 3) return typeSprites.stage3;
    if (evolutionStage >= 2) return typeSprites.stage2;
    if (evolutionStage >= 1) return typeSprites.stage1;
    return typeSprites.base;
  }, [character.type, character.specialization, character.evolution_stage]);
  
  // ==============================================================================
  // VISUAL EFFECTS
  // ==============================================================================
  
  // Pulsing animation for mood effects
  useEffect(() => {
    if (!showEffects || optimizeForPerformance) return;
    
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    
    if (mood?.config?.effect === 'pulse') {
      startPulseAnimation();
    }
    
    return () => {
      pulseAnim.setValue(1);
    };
  }, [mood?.config?.effect, pulseAnim, showEffects, optimizeForPerformance]);
  
  // Glow animation for rarity effects
  useEffect(() => {
    if (!showEffects || optimizeForPerformance) return;
    
    const rarityIntensity = theme?.rarity?.intensity || 0;
    if (rarityIntensity > 0.5) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: rarityIntensity,
            duration: 2000,
            useNativeDriver: false, // Using for shadow properties
          }),
          Animated.timing(glowAnim, {
            toValue: rarityIntensity * 0.3,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [theme?.rarity?.intensity, glowAnim, showEffects, optimizeForPerformance]);
  
  // Rotation animation for celebrating state
  useEffect(() => {
    if (!showEffects || optimizeForPerformance) return;
    
    if (mood?.key === 'excited' || mood?.key === 'motivated') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
    
    return () => {
      rotateAnim.setValue(0);
    };
  }, [mood?.key, rotateAnim, showEffects, optimizeForPerformance]);
  
  // ==============================================================================
  // MEMOIZED STYLES
  // ==============================================================================
  
  const containerStyle = useMemo(() => [
    styles.container,
    {
      width: sizeConfig.spriteSize,
      height: sizeConfig.spriteSize,
    },
  ], [sizeConfig.spriteSize]);
  
  const spriteTextStyle = useMemo(() => [
    styles.spriteText,
    {
      fontSize: sizeConfig.fontSize,
      textShadowColor: theme?.combined?.primaryColor || '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
  ], [sizeConfig.fontSize, theme?.combined?.primaryColor]);
  
  const animatedSpriteStyle = useMemo(() => {
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    
    return [
      styles.animatedSprite,
      {
        transform: [
          { scale: pulseAnim },
          { rotate: rotation },
        ],
      },
    ];
  }, [pulseAnim, rotateAnim]);
  
  const glowStyle = useMemo(() => {
    if (!showEffects || !theme?.rarity?.glowColor) return {};
    
    return {
      shadowColor: theme.rarity.glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: sizeConfig.effectSize,
      shadowOpacity: 0.6,
      elevation: 8,
    };
  }, [showEffects, theme?.rarity?.glowColor, sizeConfig.effectSize]);
  
  // ==============================================================================
  // EFFECTS COMPONENTS
  // ==============================================================================
  
  const renderBackgroundGradient = useMemo(() => {
    if (!showEffects || !theme?.specialization?.gradient) return null;
    
    return (
      <LinearGradient
        colors={theme.specialization.gradient}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    );
  }, [showEffects, theme?.specialization?.gradient]);
  
  const renderParticleEffects = useMemo(() => {
    if (!showEffects || optimizeForPerformance) return null;
    
    const shouldShowParticles = 
      (character.evolution_stage || 0) > 0 || 
      (theme?.rarity?.intensity || 0) > 0.7;
    
    if (!shouldShowParticles) return null;
    
    return (
      <View style={styles.particleContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                backgroundColor: theme?.combined?.primaryColor || '#FFD700',
                width: sizeConfig.effectSize,
                height: sizeConfig.effectSize,
                borderRadius: sizeConfig.effectSize / 2,
                opacity: glowAnim,
              },
              {
                transform: [
                  {
                    translateX: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (index - 1) * 20],
                    }),
                  },
                  {
                    translateY: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -index * 15],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  }, [
    showEffects,
    optimizeForPerformance,
    character.evolution_stage,
    theme?.rarity?.intensity,
    theme?.combined?.primaryColor,
    sizeConfig.effectSize,
    glowAnim,
    rotateAnim,
  ]);
  
  const renderStatIndicators = useMemo(() => {
    if (optimizeForPerformance || size === 'small') return null;
    
    // Show stat indicators for larger sizes
    const dominantStat = character.current_stats.strength > 80 ? '💪' :
                        character.current_stats.cardio > 80 ? '❤️' :
                        character.current_stats.flexibility > 80 ? '🤸' :
                        character.current_stats.focus > 80 ? '🧠' :
                        character.current_stats.motivation > 80 ? '🔥' :
                        character.current_stats.loyalty > 80 ? '🤝' : null;
    
    if (!dominantStat) return null;
    
    return (
      <View style={styles.statIndicator}>
        <Text style={[styles.statEmoji, { fontSize: sizeConfig.fontSize * 0.3 }]}>
          {dominantStat}
        </Text>
      </View>
    );
  }, [
    optimizeForPerformance,
    size,
    character.current_stats,
    sizeConfig.fontSize,
  ]);
  
  // ==============================================================================
  // RENDER
  // ==============================================================================
  
  return (
    <View style={containerStyle}>
      {/* Background Gradient */}
      {renderBackgroundGradient}
      
      {/* Main Character Sprite */}
      <Animated.View style={[animatedSpriteStyle, glowStyle]}>
        <Text style={spriteTextStyle} selectable={false}>
          {characterSprite}
        </Text>
      </Animated.View>
      
      {/* Particle Effects */}
      {renderParticleEffects}
      
      {/* Stat Indicators */}
      {renderStatIndicators}
      
      {/* Mood Effect Overlay */}
      {mood?.config?.effect === 'sparkle' && showEffects && (
        <Animated.View style={[styles.sparkleOverlay, { opacity: pulseAnim }]}>
          <Text style={[styles.sparkleText, { fontSize: sizeConfig.fontSize * 0.6 }]}>
            ✨
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

// ==============================================================================
// STYLES
// ==============================================================================

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  backgroundGradient: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 50,
    opacity: 0.2,
  },
  
  animatedSprite: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spriteText: {
    textAlign: 'center',
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  
  particle: {
    position: 'absolute',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 0.8,
    elevation: 4,
  },
  
  statIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  
  statEmoji: {
    textAlign: 'center',
  },
  
  sparkleOverlay: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  
  sparkleText: {
    textAlign: 'center',
  },
});

export default CharacterRenderer;