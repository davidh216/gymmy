// src/components/multi-gymmy-ui/character-visual/CharacterSprite.tsx
// Main character sprite component with animation and state management

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Animated } from 'react-native';
import { GymmyCharacter } from '../../../context/types/MultiGymmyTypes';
import { useCharacterAnimation, AnimationState, ANIMATION_CONFIG } from '../shared/AnimationUtils';
import { useCharacterTheme, useCharacterMood } from '../shared/CharacterUtils';
import { CharacterRenderer } from './CharacterRenderer';
import { StateTransition } from './StateTransition';

// ==============================================================================
// TYPES AND INTERFACES
// ==============================================================================

export interface CharacterSpriteProps {
  character: GymmyCharacter;
  size?: 'small' | 'medium' | 'large' | 'xl';
  state?: AnimationState;
  showMood?: boolean;
  showLevel?: boolean;
  showRarity?: boolean;
  interactive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
  containerStyle?: any;
  // Animation props
  autoAnimate?: boolean;
  animationSequence?: string;
  // Performance props
  optimizeForPerformance?: boolean;
  reducedMotion?: boolean;
}

interface CharacterSpriteState {
  currentState: AnimationState;
  isPressed: boolean;
  isHovered: boolean;
  lastInteraction: number;
}

// ==============================================================================
// SIZE CONFIGURATIONS
// ==============================================================================

const SIZE_CONFIG = {
  small: {
    width: 60,
    height: 60,
    borderRadius: 12,
    fontSize: 24,
    levelFontSize: 10,
  },
  medium: {
    width: 80,
    height: 80,
    borderRadius: 16,
    fontSize: 32,
    levelFontSize: 12,
  },
  large: {
    width: 120,
    height: 120,
    borderRadius: 24,
    fontSize: 48,
    levelFontSize: 16,
  },
  xl: {
    width: 160,
    height: 160,
    borderRadius: 32,
    fontSize: 64,
    levelFontSize: 20,
  },
} as const;

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  character,
  size = 'medium',
  state = 'idle',
  showMood = true,
  showLevel = true,
  showRarity = true,
  interactive = true,
  onPress,
  onLongPress,
  style,
  containerStyle,
  autoAnimate = true,
  animationSequence,
  optimizeForPerformance = false,
  reducedMotion = false,
}) => {
  // ==============================================================================
  // STATE AND HOOKS
  // ==============================================================================
  
  const [spriteState, setSpriteState] = useState<CharacterSpriteState>({
    currentState: state,
    isPressed: false,
    isHovered: false,
    lastInteraction: 0,
  });
  
  const theme = useCharacterTheme(character);
  const mood = useCharacterMood(character);
  const { animatedStyle, animateToState } = useCharacterAnimation(state);
  
  const sizeConfig = SIZE_CONFIG[size];
  
  // ==============================================================================
  // ANIMATION MANAGEMENT
  // ==============================================================================
  
  // Update animation when state changes
  useEffect(() => {
    if (spriteState.currentState !== state && !reducedMotion) {
      animateToState(state);
      setSpriteState(prev => ({ ...prev, currentState: state }));
    }
  }, [state, animateToState, reducedMotion, spriteState.currentState]);
  
  // Auto-animate idle breathing effect
  useEffect(() => {
    if (autoAnimate && spriteState.currentState === 'idle' && !reducedMotion) {
      const idleAnimation = setInterval(() => {
        // Subtle breathing animation
        animateToState('idle', {
          duration: ANIMATION_CONFIG.timing.slow,
          easing: ANIMATION_CONFIG.easing.standard,
        });
      }, 3000);
      
      return () => clearInterval(idleAnimation);
    }
  }, [autoAnimate, spriteState.currentState, animateToState, reducedMotion]);
  
  // ==============================================================================
  // INTERACTION HANDLERS
  // ==============================================================================
  
  const handlePressIn = useCallback(() => {
    if (!interactive) return;
    
    setSpriteState(prev => ({ 
      ...prev, 
      isPressed: true,
      lastInteraction: Date.now(),
    }));
    
    if (!reducedMotion) {
      animateToState('excited', { duration: ANIMATION_CONFIG.timing.fast });
    }
  }, [interactive, animateToState, reducedMotion]);
  
  const handlePressOut = useCallback(() => {
    if (!interactive) return;
    
    setSpriteState(prev => ({ 
      ...prev, 
      isPressed: false,
    }));
    
    if (!reducedMotion) {
      setTimeout(() => {
        animateToState(state, { duration: ANIMATION_CONFIG.timing.normal });
      }, 100);
    }
  }, [interactive, animateToState, state, reducedMotion]);
  
  const handlePress = useCallback(() => {
    if (!interactive || !onPress) return;
    
    // Haptic feedback on supported platforms
    if (Platform.OS === 'ios' && 'impact' in require('expo-haptics').ImpactFeedbackStyle) {
      require('expo-haptics').impactAsync(require('expo-haptics').ImpactFeedbackStyle.Light);
    }
    
    onPress();
  }, [interactive, onPress]);
  
  const handleLongPress = useCallback(() => {
    if (!interactive || !onLongPress) return;
    
    // Stronger haptic feedback for long press
    if (Platform.OS === 'ios' && 'impact' in require('expo-haptics').ImpactFeedbackStyle) {
      require('expo-haptics').impactAsync(require('expo-haptics').ImpactFeedbackStyle.Medium);
    }
    
    onLongPress();
  }, [interactive, onLongPress]);
  
  // ==============================================================================
  // MEMOIZED STYLES
  // ==============================================================================
  
  const containerStyles = useMemo(() => [
    styles.container,
    {
      width: sizeConfig.width,
      height: sizeConfig.height,
      borderRadius: sizeConfig.borderRadius,
      backgroundColor: theme.rarity.backgroundColor,
      borderColor: theme.rarity.borderColor,
      shadowColor: theme.rarity.glowColor,
      shadowOpacity: theme.rarity.intensity * 0.3,
      shadowRadius: theme.rarity.intensity * 8,
      elevation: theme.rarity.intensity * 4,
    },
    containerStyle,
  ], [sizeConfig, theme, containerStyle]);
  
  const spriteStyles = useMemo(() => [
    styles.sprite,
    {
      fontSize: sizeConfig.fontSize,
    },
    animatedStyle,
    style,
  ], [sizeConfig.fontSize, animatedStyle, style]);
  
  // ==============================================================================
  // RENDER OPTIMIZATIONS
  // ==============================================================================
  
  const renderContent = useMemo(() => (
    <View style={styles.contentContainer}>
      {/* Character Renderer - the main visual */}
      <CharacterRenderer
        character={character}
        size={size}
        mood={mood}
        theme={theme}
        optimizeForPerformance={optimizeForPerformance}
      />
      
      {/* State Transition Effects */}
      {!reducedMotion && (
        <StateTransition
          currentState={spriteState.currentState}
          character={character}
          size={size}
        />
      )}
      
      {/* Level Badge */}
      {showLevel && (
        <View style={[styles.levelBadge, { backgroundColor: theme.specialization.color }]}>
          <Animated.Text style={[styles.levelText, { fontSize: sizeConfig.levelFontSize }]}>
            {character.level}
          </Animated.Text>
        </View>
      )}
      
      {/* Rarity Border Effect */}
      {showRarity && theme.rarity.intensity > 0.3 && (
        <View style={[styles.rarityBorder, { borderColor: theme.rarity.borderColor }]} />
      )}
      
      {/* Mood Indicator */}
      {showMood && mood.config && (
        <View style={[styles.moodIndicator, { backgroundColor: mood.config.color }]}>
          <Animated.Text style={styles.moodEmoji}>
            {mood.config.emoji}
          </Animated.Text>
        </View>
      )}
    </View>
  ), [
    character,
    size,
    mood,
    theme,
    optimizeForPerformance,
    reducedMotion,
    spriteState.currentState,
    showLevel,
    showRarity,
    showMood,
    sizeConfig,
  ]);
  
  // ==============================================================================
  // RENDER
  // ==============================================================================
  
  const Component = interactive ? TouchableOpacity : View;
  
  return (
    <Component
      style={containerStyles}
      onPressIn={interactive ? handlePressIn : undefined}
      onPressOut={interactive ? handlePressOut : undefined}
      onPress={interactive ? handlePress : undefined}
      onLongPress={interactive ? handleLongPress : undefined}
      activeOpacity={interactive ? 0.8 : 1}
      testID={`character-sprite-${character.instance_id}`}
      accessibilityLabel={`${character.display_name}, Level ${character.level}, ${character.rarity} rarity`}
      accessibilityRole={interactive ? 'button' : 'image'}
      accessibilityHint={interactive ? 'Tap to interact with character' : undefined}
    >
      <Animated.View style={spriteStyles}>
        {renderContent}
      </Animated.View>
    </Component>
  );
};

// ==============================================================================
// STYLES
// ==============================================================================

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  sprite: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  contentContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  levelBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  
  levelText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  rarityBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 2,
    borderRadius: 20,
    opacity: 0.6,
  },
  
  moodIndicator: {
    position: 'absolute',
    bottom: -8,
    left: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  moodEmoji: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default CharacterSprite;