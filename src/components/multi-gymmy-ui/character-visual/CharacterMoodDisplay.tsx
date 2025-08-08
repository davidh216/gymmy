// src/components/multi-gymmy-ui/character-visual/CharacterMoodDisplay.tsx
// Displays character mood with visual indicators and contextual information

import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Animated, Text } from 'react-native';
import { GymmyCharacter } from '../../../context/types/MultiGymmyTypes';
import { useCharacterMood, CHARACTER_VISUAL_CONFIG } from '../shared/CharacterUtils';
import { useCharacterAnimation, ANIMATION_CONFIG } from '../shared/AnimationUtils';

// ==============================================================================
// TYPES AND INTERFACES
// ==============================================================================

export interface CharacterMoodDisplayProps {
  character: GymmyCharacter;
  recentWorkout?: boolean;
  experienceGained?: number;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  showIcon?: boolean;
  interactive?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  style?: any;
  onMoodPress?: (mood: any) => void;
}

interface MoodIndicatorProps {
  mood: any;
  size: 'small' | 'medium' | 'large';
  animated: boolean;
}

// ==============================================================================
// SIZE CONFIGURATIONS
// ==============================================================================

const MOOD_SIZE_CONFIG = {
  small: {
    containerSize: 32,
    iconSize: 16,
    fontSize: 10,
    borderRadius: 16,
  },
  medium: {
    containerSize: 48,
    iconSize: 24,
    fontSize: 12,
    borderRadius: 24,
  },
  large: {
    containerSize: 64,
    iconSize: 32,
    fontSize: 14,
    borderRadius: 32,
  },
} as const;

// ==============================================================================
// MOOD INDICATOR COMPONENT
// ==============================================================================

const MoodIndicator: React.FC<MoodIndicatorProps> = ({ mood, size, animated }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  
  const sizeConfig = MOOD_SIZE_CONFIG[size];
  
  // Animate based on mood type
  useEffect(() => {
    if (!animated) return;
    
    const animations: Animated.CompositeAnimation[] = [];
    
    switch (mood.key) {
      case 'excited':
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.2,
                duration: ANIMATION_CONFIG.timing.fast,
                easing: ANIMATION_CONFIG.easing.bounce,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: ANIMATION_CONFIG.timing.fast,
                easing: ANIMATION_CONFIG.easing.standard,
                useNativeDriver: true,
              }),
            ])
          )
        );
        break;
        
      case 'motivated':
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 0.8,
                duration: ANIMATION_CONFIG.timing.slow,
                useNativeDriver: false,
              }),
              Animated.timing(glowAnim, {
                toValue: 0.3,
                duration: ANIMATION_CONFIG.timing.slow,
                useNativeDriver: false,
              }),
            ])
          )
        );
        break;
        
      case 'focused':
        animations.push(
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: ANIMATION_CONFIG.timing.normal,
            easing: ANIMATION_CONFIG.easing.standard,
            useNativeDriver: true,
          })
        );
        break;
        
      case 'tired':
        animations.push(
          Animated.timing(pulseAnim, {
            toValue: 0.9,
            duration: ANIMATION_CONFIG.timing.slow,
            easing: ANIMATION_CONFIG.easing.standard,
            useNativeDriver: true,
          })
        );
        break;
        
      default: // happy
        pulseAnim.setValue(1);
        glowAnim.setValue(0.3);
    }
    
    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
    
    return () => {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.3);
    };
  }, [mood.key, animated, pulseAnim, glowAnim]);
  
  const containerStyle = useMemo(() => [
    styles.moodIndicator,
    {
      width: sizeConfig.containerSize,
      height: sizeConfig.containerSize,
      borderRadius: sizeConfig.borderRadius,
      backgroundColor: mood.config.color,
      shadowColor: mood.config.color,
      shadowOpacity: glowAnim,
      shadowRadius: 8,
      elevation: 6,
      transform: [{ scale: pulseAnim }],
    },
  ], [sizeConfig, mood.config.color, pulseAnim, glowAnim]);
  
  const iconStyle = useMemo(() => [
    styles.moodIcon,
    {
      fontSize: sizeConfig.iconSize,
    },
  ], [sizeConfig.iconSize]);
  
  return (
    <Animated.View style={containerStyle}>
      <Text style={iconStyle}>{mood.config.emoji}</Text>
    </Animated.View>
  );
};

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

export const CharacterMoodDisplay: React.FC<CharacterMoodDisplayProps> = ({
  character,
  recentWorkout = false,
  experienceGained,
  size = 'medium',
  showText = true,
  showIcon = true,
  interactive = false,
  position = 'center',
  style,
  onMoodPress,
}) => {
  // ==============================================================================
  // HOOKS AND STATE
  // ==============================================================================
  
  const mood = useCharacterMood(character, recentWorkout, experienceGained);
  const { animateToState } = useCharacterAnimation();
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const sizeConfig = MOOD_SIZE_CONFIG[size];
  
  // ==============================================================================
  // MOOD CHANGE ANIMATION
  // ==============================================================================
  
  const previousMoodKey = useRef(mood.key);
  
  useEffect(() => {
    if (mood.key !== previousMoodKey.current) {
      // Animate mood change
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION_CONFIG.timing.fast,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
      
      previousMoodKey.current = mood.key;
    }
  }, [mood.key, fadeAnim]);
  
  // ==============================================================================
  // INTERACTION HANDLERS
  // ==============================================================================
  
  const handlePress = () => {
    if (!interactive || !onMoodPress) return;
    
    // Trigger character animation based on mood
    switch (mood.key) {
      case 'excited':
        animateToState('excited');
        break;
      case 'motivated':
        animateToState('celebrating');
        break;
      case 'focused':
        animateToState('training');
        break;
      case 'tired':
        animateToState('tired');
        break;
      default:
        animateToState('idle');
    }
    
    onMoodPress(mood);
  };
  
  // ==============================================================================
  // POSITION STYLING
  // ==============================================================================
  
  const positionStyle = useMemo(() => {
    const baseStyle: any = { position: 'absolute' };
    
    switch (position) {
      case 'top':
        return { ...baseStyle, top: 8, alignSelf: 'center' };
      case 'bottom':
        return { ...baseStyle, bottom: 8, alignSelf: 'center' };
      case 'left':
        return { ...baseStyle, left: 8, alignSelf: 'center' };
      case 'right':
        return { ...baseStyle, right: 8, alignSelf: 'center' };
      default:
        return { alignSelf: 'center' };
    }
  }, [position]);
  
  const containerStyle = useMemo(() => [
    styles.container,
    positionStyle,
    style,
  ], [positionStyle, style]);
  
  // ==============================================================================
  // MOOD CONTEXT DATA
  // ==============================================================================
  
  const moodContext = useMemo(() => {
    const context: string[] = [];
    
    // Add context based on character stats
    if (character.current_stats.motivation > 80) {
      context.push('High motivation');
    } else if (character.current_stats.motivation < 30) {
      context.push('Low motivation');
    }
    
    if (character.current_stats.focus > 80) {
      context.push('Very focused');
    } else if (character.current_stats.focus < 30) {
      context.push('Unfocused');
    }
    
    // Add recent activity context
    if (recentWorkout) {
      context.push('Recently active');
    }
    
    if (experienceGained && experienceGained > 50) {
      context.push('Major progress');
    }
    
    // Add level context
    if (character.level >= 50) {
      context.push('Experienced');
    } else if (character.level < 10) {
      context.push('Beginner');
    }
    
    return context;
  }, [character, recentWorkout, experienceGained]);
  
  // ==============================================================================
  // RENDER COMPONENTS
  // ==============================================================================
  
  const renderMoodIcon = useMemo(() => {
    if (!showIcon) return null;
    
    return (
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <MoodIndicator
          mood={mood}
          size={size}
          animated={!interactive}
        />
      </Animated.View>
    );
  }, [showIcon, fadeAnim, slideAnim, mood, size, interactive]);
  
  const renderMoodText = useMemo(() => {
    if (!showText) return null;
    
    return (
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={[styles.moodTitle, { fontSize: sizeConfig.fontSize + 2 }]}>
          {mood.key.charAt(0).toUpperCase() + mood.key.slice(1)}
        </Text>
        
        <Text style={[styles.moodDescription, { fontSize: sizeConfig.fontSize }]}>
          {mood.description}
        </Text>
        
        {moodContext.length > 0 && (
          <View style={styles.contextContainer}>
            {moodContext.map((context, index) => (
              <Text key={index} style={[styles.contextText, { fontSize: sizeConfig.fontSize - 2 }]}>
                • {context}
              </Text>
            ))}
          </View>
        )}
      </Animated.View>
    );
  }, [showText, fadeAnim, mood, sizeConfig.fontSize, moodContext]);
  
  // ==============================================================================
  // RENDER
  // ==============================================================================
  
  const Component = interactive ? Animated.TouchableOpacity : Animated.View;
  
  return (
    <Component
      style={containerStyle}
      onPress={interactive ? handlePress : undefined}
      activeOpacity={interactive ? 0.8 : 1}
      testID={`mood-display-${character.instance_id}-${mood.key}`}
      accessibilityLabel={`${character.display_name} is feeling ${mood.key}. ${mood.description}`}
      accessibilityRole={interactive ? 'button' : 'text'}
      accessibilityHint={interactive ? 'Tap to interact with character mood' : undefined}
    >
      {renderMoodIcon}
      {renderMoodText}
    </Component>
  );
};

// ==============================================================================
// STYLES
// ==============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  moodIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  
  moodIcon: {
    textAlign: 'center',
    color: '#FFFFFF',
  },
  
  textContainer: {
    alignItems: 'center',
    maxWidth: 200,
  },
  
  moodTitle: {
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  moodDescription: {
    color: '#3C3C43',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  
  contextContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  
  contextText: {
    color: '#8E8E93',
    textAlign: 'left',
    marginBottom: 2,
    lineHeight: 16,
  },
});

export default CharacterMoodDisplay;