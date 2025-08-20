// src/components/multi-gymmy-ui/character-visual/ExperienceVisualizer.tsx
// Visual experience tracking and level progression display component

import React, { useEffect, useMemo, useRef } from 'react';
import {
  // View,
  // StyleSheet,
  // Platform
} from 'react-native';
import {
  // Animated,
  // Text
} from 'react-native';
import {
  // GymmyCharacter
} from '../../../context/types/MultiGymmyTypes';
import {
  // useExperienceAnimation,
  // ANIMATION_CONFIG
} from '../shared/AnimationUtils';
import {
  // useLevelProgress
} from '../shared/CharacterUtils';
import {
  // LinearGradient
} from 'expo-linear-gradient';

// ==============================================================================
// TYPES AND INTERFACES
// ==============================================================================

export interface ExperienceVisualizerProps {
  character: GymmyCharacter;
  experienceTable?: Record<number, number>;
  showNumbers?: boolean;
  showLevel?: boolean;
  animated?: boolean;
  compact?: boolean;
  style?: any;
  // Animation props
  onLevelUp?: (newLevel: number) => void;
  onExperienceGain?: (experience: number) => void;
  recentExperienceGain?: number;
  animateExperienceGain?: boolean;
}

interface ExperienceDisplayData {
  currentExp: number;
  maxExp: number;
  progress: number;
  expToNext: number;
  isMaxLevel: boolean;
}

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

export const ExperienceVisualizer: React.FC<ExperienceVisualizerProps> = ({
  character,
  experienceTable,
  showNumbers = true,
  showLevel = true,
  animated = true,
  compact = false,
  style,
  onLevelUp,
  onExperienceGain,
  recentExperienceGain,
  animateExperienceGain = false,
}) => {
  // ==============================================================================
  // STATE AND HOOKS
  // ==============================================================================
  
  // const progressBarAnim = ...; // Quick fix: commented unused variable
  // const expGainAnim = ...; // Quick fix: commented unused variable
  // const levelUpAnim = ...; // Quick fix: commented unused variable
  // const numberCountAnim = ...; // Quick fix: commented unused variable
  
  // const levelProgress = ...; // Quick fix: commented unused variable
  const { animateExperienceGain: animateExpGain, values } = useExperienceAnimation();
  
  // const previousLevel = ...; // Quick fix: commented unused variable
  // const previousExp = ...; // Quick fix: commented unused variable
  
  // ==============================================================================
  // EXPERIENCE DATA CALCULATION
  // ==============================================================================
  
  const experienceData: ExperienceDisplayData = useMemo(() => {
    // const currentExp = ...; // Quick fix: commented unused variable
    // const currentLevel = ...; // Quick fix: commented unused variable
    // const isMaxLevel = ...; // Quick fix: commented unused variable
    
    if (isMaxLevel) {
      return {
        currentExp,
        maxExp: currentExp,
        progress: 100,
        expToNext: 0,
        isMaxLevel: true,
      };
    }
    
    // const expForCurrentLevel = ...; // Quick fix: commented unused variable
    // const expForNextLevel = ...; // Quick fix: commented unused variable
    
    // const expInCurrentLevel = ...; // Quick fix: commented unused variable
    // const expRequiredForLevel = ...; // Quick fix: commented unused variable
    // const progress = ...; // Quick fix: commented unused variable
    
    return {
      currentExp: expInCurrentLevel,
      maxExp: expRequiredForLevel,
      progress,
      expToNext: Math.max(0, expForNextLevel - currentExp),
      isMaxLevel: false,
    };
  }, [character.current_exp, character.level, experienceTable]);
  
  // ==============================================================================
  // ANIMATION EFFECTS
  // ==============================================================================
  
  // Animate progress bar
  useEffect(() => {
    if (!animated) {
      progressBarAnim.setValue(experienceData.progress);
      return;
    }
    
    Animated.timing(progressBarAnim, {
      toValue: experienceData.progress,
      duration: ANIMATION_CONFIG.timing.slow,
      easing: ANIMATION_CONFIG.easing.standard,
      useNativeDriver: false,
    }).start();
  }, [experienceData.progress, progressBarAnim, animated]);
  
  // Level up detection and animation
  useEffect(() => {
    // const currentLevel = ...; // Quick fix: commented unused variable
    if (currentLevel > previousLevel.current && onLevelUp) {
      onLevelUp(currentLevel);
      
      if (animated) {
        // Level up celebration animation
        Animated.sequence([
          Animated.timing(levelUpAnim, {
            toValue: 1.3,
            duration: ANIMATION_CONFIG.timing.normal,
            easing: ANIMATION_CONFIG.easing.bounce,
            useNativeDriver: true,
          }),
          Animated.timing(levelUpAnim, {
            toValue: 1,
            duration: ANIMATION_CONFIG.timing.normal,
            easing: ANIMATION_CONFIG.easing.standard,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
    
    previousLevel.current = currentLevel;
  }, [character.level, onLevelUp, levelUpAnim, animated]);
  
  // Experience gain animation
  useEffect(() => {
    // const currentExp = ...; // Quick fix: commented unused variable
    // const expGained = ...; // Quick fix: commented unused variable
    
    if (expGained > 0 && animateExperienceGain && animated) {
      if (onExperienceGain) {
        onExperienceGain(expGained);
      }
      
      // Show floating +XP animation
      Animated.sequence([
        Animated.timing(expGainAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.timing.fast,
          easing: ANIMATION_CONFIG.easing.standard,
          useNativeDriver: true,
        }),
        Animated.timing(expGainAnim, {
          toValue: 0,
          duration: ANIMATION_CONFIG.timing.slow,
          easing: ANIMATION_CONFIG.easing.standard,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    previousExp.current = currentExp;
  }, [character.current_exp, animateExperienceGain, animated, onExperienceGain, expGainAnim]);
  
  // Animate number counting
  useEffect(() => {
    if (!animated || !showNumbers) return;
    
    numberCountAnim.setValue(0);
    Animated.timing(numberCountAnim, {
      toValue: experienceData.currentExp,
      duration: ANIMATION_CONFIG.timing.slow,
      easing: ANIMATION_CONFIG.easing.standard,
      useNativeDriver: false,
    }).start();
  }, [experienceData.currentExp, numberCountAnim, animated, showNumbers]);
  
  // ==============================================================================
  // MEMOIZED STYLES
  // ==============================================================================
  
  const containerStyle = useMemo(() => [
    compact ? styles.compactContainer : styles.container,
    style,
  ], [compact, style]);
  
  const progressBarStyle = useMemo(() => {
    const width = progressBarAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    });
    
    return [
      styles.progressFill,
      {
        width,
        backgroundColor: experienceData.isMaxLevel ? '#FFD700' : '#007AFF',
      },
    ];
  }, [progressBarAnim, experienceData.isMaxLevel]);
  
  const levelTextStyle = useMemo(() => [
    compact ? styles.compactLevelText : styles.levelText,
    {
      transform: [{ scale: levelUpAnim }],
    },
  ], [compact, levelUpAnim]);
  
  // ==============================================================================
  // RENDER COMPONENTS
  // ==============================================================================
  
  const renderProgressBar = useMemo(() => (
    <View style={compact ? styles.compactProgressContainer : styles.progressContainer}>
      <View style={styles.progressBackground}>
        {/* Gradient background for progress */}
        <LinearGradient
          colors={experienceData.isMaxLevel ? ['#FFD700', '#FFA500'] : ['#007AFF', '#0051D5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressGradient}
        />
        
        {/* Animated progress fill */}
        <Animated.View style={progressBarStyle} />
      </View>
      
      {/* Progress percentage text */}
      {!compact && (
        <Text style={styles.progressText}>
          {Math.round(experienceData.progress)}%\n        </Text>
      )}
    </View>
  ), [compact, experienceData.isMaxLevel, experienceData.progress, progressBarStyle]);
  
  const renderExperienceNumbers = useMemo(() => {
    if (!showNumbers) return null;
    
    return (
      <View style={compact ? styles.compactNumbersContainer : styles.numbersContainer}>
        {experienceData.isMaxLevel ? (
          <Text style={styles.maxLevelText}>MAX LEVEL</Text>
        ) : (
          <>
            <Animated.Text style={styles.currentExpText}>
              {animated ? numberCountAnim : experienceData.currentExp}
            </Animated.Text>
            <Text style={styles.separatorText}> / </Text>
            <Text style={styles.maxExpText}>{experienceData.maxExp}</Text>
            
            {!compact && (
              <Text style={styles.expToNextText}>
                {experienceData.expToNext} to next level
              </Text>
            )}
          </>
        )}
      </View>
    );
  }, [
    showNumbers,
    compact,
    experienceData.isMaxLevel,
    experienceData.maxExp,
    experienceData.expToNext,
    animated,
    numberCountAnim,
    experienceData.currentExp,
  ]);
  
  const renderLevelDisplay = useMemo(() => {
    if (!showLevel) return null;
    
    return (
      <Animated.View style={levelTextStyle}>
        <Text style={compact ? styles.compactLevelNumber : styles.levelNumber}>
          {character.level}
        </Text>
        {!compact && (
          <Text style={styles.levelLabel}>LEVEL</Text>
        )}
      </Animated.View>
    );
  }, [showLevel, character.level, compact, levelTextStyle]);
  
  const renderFloatingExpGain = useMemo(() => {
    if (!recentExperienceGain || !animated) return null;
    
    return (
      <Animated.View
        style={[
          styles.floatingExp,
          {
            opacity: expGainAnim,
            transform: [
              {
                translateY: expGainAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.floatingExpText}>+{recentExperienceGain} XP</Text>
      </Animated.View>
    );
  }, [recentExperienceGain, animated, expGainAnim]);
  
  // ==============================================================================
  // RENDER
  // ==============================================================================
  
  return (
    <View style={containerStyle} testID={`experience-visualizer-${character.instance_id}`}>
      {/* Level Display */}
      {renderLevelDisplay}
      
      {/* Progress Bar */}
      {renderProgressBar}
      
      {/* Experience Numbers */}
      {renderExperienceNumbers}
      
      {/* Floating Experience Gain */}
      {renderFloatingExpGain}
    </View>
  );
};

// ==============================================================================
// STYLES
// ==============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    minWidth: 200,
  },
  
  compactContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 4,
    backgroundColor: 'transparent',
    minWidth: 80,
  },
  
  levelText: {
    alignItems: 'center',
    marginRight: 12,
  },
  
  compactLevelText: {
    alignItems: 'center',
    marginBottom: 4,
  },
  
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  
  compactLevelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  
  levelLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
  },
  
  progressContainer: {
    flex: 1,
    marginRight: 12,
  },
  
  compactProgressContainer: {
    width: '100%',
    marginBottom: 4,
  },
  
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  
  progressGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  progressText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  
  numbersContainer: {
    alignItems: 'flex-end',
  },
  
  compactNumbersContainer: {
    alignItems: 'center',
  },
  
  currentExpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  
  separatorText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  maxExpText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  expToNextText: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 2,
  },
  
  maxLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  
  floatingExp: {
    position: 'absolute',
    top: -20,
    right: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  floatingExpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ExperienceVisualizer;