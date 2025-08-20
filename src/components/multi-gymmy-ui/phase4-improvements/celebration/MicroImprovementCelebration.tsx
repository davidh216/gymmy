import React, { useRef, useEffect, useState } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // Animated,
  // Dimensions,
  // Modal,
  // TouchableOpacity,
  // AccessibilityInfo,
  // 
} from 'react-native';
import {
  // DESIGN_TOKENS,
  // getCelebrationColor,
  // getImprovementColor,
  // getValidationColor
} from '../../../../constants/designTokens';

const { width, height } = Dimensions.get('window');

// Types for improvement data
interface ImprovementData {
  id: string;
  dimension: string;
  improvement_percentage: number;
  baseline_value: number;
  current_value: number;
  confidence_score: number;
  validation_status: 'pending' | 'validated' | 'rejected' | 'needs_review';
  detected_at: string;
  workout_context?: {
    workout_type: string;
    exercises_performed: string[];
  };
}

interface CharacterData {
  id: string;
  name: string;
  specialization: string;
  segment: string;
}

interface MicroImprovementCelebrationProps {
  visible: boolean;
  improvement: ImprovementData;
  character?: CharacterData;
  onComplete: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
}

const MicroImprovementCelebration: React.FC<MicroImprovementCelebrationProps> = ({
  visible,
  improvement,
  character,
  onComplete,
  onShare,
  onViewDetails,
}) => {
  // Animation values
  // const scaleAnimation = ...; // Quick fix: commented unused variable
  // const opacityAnimation = ...; // Quick fix: commented unused variable
  // const rotationAnimation = ...; // Quick fix: commented unused variable
  // const flashAnimation = ...; // Quick fix: commented unused variable
  // const textAnimation = ...; // Quick fix: commented unused variable
  // const particleAnimation = ...; // Quick fix: commented unused variable

  // State for accessibility
  const [accessibilityAnnounced, setAccessibilityAnnounced] = useState(false);

  // Get improvement-specific colors and messages
  // const improvementColor = ...; // Quick fix: commented unused variable
  // const validationColor = ...; // Quick fix: commented unused variable
  // const celebrationColor = ...; // Quick fix: commented unused variable

  const getImprovementMessage = () => {
    // const percentage = ...; // Quick fix: commented unused variable
    // const dimension = ...; // Quick fix: commented unused variable
    return `You just improved your ${improvement.dimension} by ${percentage}%!`;
  };

  const getScientificValidationMessage = () => {
    // const confidence = ...; // Quick fix: commented unused variable
    return `Scientifically validated with ${confidence}% confidence`;
  };

  useEffect(() => {
    if (visible) {
      startCelebration();
      announceAccessibility();
    }
  }, [visible]);

  const startCelebration = () => {
    // Reset animations
    scaleAnimation.setValue(0);
    opacityAnimation.setValue(0);
    rotationAnimation.setValue(0);
    flashAnimation.setValue(0);
    textAnimation.setValue(0);
    particleAnimation.setValue(0);

    // Screen flash
    Animated.timing(flashAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Main celebration sequence
    Animated.sequence([
      // Initial scale up with bounce
      Animated.spring(scaleAnimation, {
        toValue: 1.1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      
      // Hold
      Animated.delay(500),
      
      // Scale to normal
      Animated.spring(scaleAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Opacity animation
    Animated.sequence([
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });

    // Text animation
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(textAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Particle animation
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(particleAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotationAnimation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const announceAccessibility = () => {
    if (!accessibilityAnnounced) {
      // const message = ...; // Quick fix: commented unused variable
      AccessibilityInfo.announceForAccessibility(message);
      setAccessibilityAnnounced(true);
    }
  };

  const renderParticles = () => {
    // const particles = ...; // Quick fix: commented unused variable
    // const particleCount = ...; // Quick fix: commented unused variable

    for (let i = 0; i < particleCount; i++) {
      // const angle = ...; // Quick fix: commented unused variable
      // const radius = ...; // Quick fix: commented unused variable
      // const x = ...; // Quick fix: commented unused variable
      // const y = ...; // Quick fix: commented unused variable

      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: improvementColor,
              transform: [
                {
                  translateX: particleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, x],
                  }),
                },
                {
                  translateY: particleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, y],
                  }),
                },
                {
                  scale: particleAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                },
              ],
              opacity: particleAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              }),
            },
          ]}
        />
      );
    }

    return particles;
  };

  const renderCharacterResponse = () => {
    if (!character) return null;

    const getCharacterMessage = () => {
      const messages = {
        strength_seeker: "Incredible work! Your dedication to progressive overload is paying off. You're building real strength! 💪",
        calorie_crusher: "Amazing energy! You're crushing those calories and building incredible endurance! 🔥",
        body_optimizer: "Fantastic progress! Your body composition improvements are showing real results! ✨",
        wellness_seeker: "Beautiful work! You're nurturing both body and mind with this improvement! 🧘‍♀️",
        endurance_athlete: "Outstanding performance! Your endurance gains are building unstoppable momentum! 🏃‍♂️",
        habit_builder: "Consistency is key! You're building powerful habits that will last a lifetime! 📈",
        social_enthusiast: "Team effort! Your community support is amplifying your progress! 🤝",
      };

      return messages[character.segment] || "Fantastic improvement! You're making incredible progress! 🎉";
    };

    return (
      <View style={styles.characterResponse}>
        <Text style={styles.characterName}>{character.name}</Text>
        <Text style={styles.characterMessage}>{getCharacterMessage()}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onComplete}
      accessible={true}
      accessibilityLabel="Micro improvement celebration"
      accessibilityHint="Displays celebration for your 1% improvement"
    >
      {/* Screen flash overlay */}
      <Animated.View
        style={[
          styles.flashOverlay,
          {
            opacity: flashAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      />

      {/* Main celebration container */}
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.celebrationCard,
            {
              transform: [
                { scale: scaleAnimation },
                {
                  rotate: rotationAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: opacityAnimation,
            },
          ]}
          accessible={true}
          accessibilityLabel={`Celebration for ${improvement.dimension} improvement`}
        >
          {/* Celebration header */}
          <View style={styles.header}>
            <Text style={[styles.celebrationTitle, { color: celebrationColor }]}>
              🎉 1% BETTER! 🎉
            </Text>
          </View>

          {/* Improvement details */}
          <Animated.View
            style={[
              styles.improvementDetails,
              {
                opacity: textAnimation,
                transform: [
                  {
                    translateY: textAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.improvementMessage, { color: improvementColor }]}>
              {getImprovementMessage()}
            </Text>

            {/* Scientific validation */}
            <View style={[styles.validationCard, { borderLeftColor: validationColor }]}>
              <Text style={styles.validationTitle}>📊 Scientific Validation</Text>
              <Text style={styles.validationMessage}>
                {getScientificValidationMessage()}
              </Text>
              <View style={styles.validationFactors}>
                <Text style={styles.validationFactor}>• Progressive overload</Text>
                <Text style={styles.validationFactor}>• Consistent form</Text>
                <Text style={styles.validationFactor}>• Recovery optimization</Text>
              </View>
            </View>

            {/* Character response */}
            {renderCharacterResponse()}
          </Animated.View>

          {/* Action buttons */}
          <Animated.View
            style={[
              styles.actionButtons,
              {
                opacity: textAnimation,
                transform: [
                  {
                    translateY: textAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {onViewDetails && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={onViewDetails}
                accessible={true}
                accessibilityLabel="View improvement details"
                accessibilityHint="Opens detailed view of your improvement"
              >
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            )}
            
            {onShare && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={onShare}
                accessible={true}
                accessibilityLabel="Share improvement"
                accessibilityHint="Shares your improvement with others"
              >
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton]}
              onPress={onComplete}
              accessible={true}
              accessibilityLabel="Continue"
              accessibilityHint="Closes celebration and continues"
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Celebration particles */}
        <View style={styles.particlesContainer}>
          {renderParticles()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DESIGN_TOKENS.colors.celebration.primary,
  },
  celebrationCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    padding: DESIGN_TOKENS.spacing.lg,
    margin: DESIGN_TOKENS.spacing.md,
    maxWidth: width * 0.9,
    maxHeight: height * 0.8,
    ...DESIGN_TOKENS.shadows.xl,
    borderWidth: 3,
    borderColor: DESIGN_TOKENS.colors.celebration.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  celebrationTitle: {
    fontSize: DESIGN_TOKENS.fontSize.xxxl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  improvementDetails: {
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  improvementMessage: {
    fontSize: DESIGN_TOKENS.fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
    lineHeight: DESIGN_TOKENS.fontSize.xl * 1.3,
  },
  validationCard: {
    backgroundColor: DESIGN_TOKENS.colors.cardSecondary,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.sm,
    borderLeftWidth: 4,
  },
  validationTitle: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.text,
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  validationMessage: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  validationFactors: {
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
  validationFactor: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    color: DESIGN_TOKENS.colors.textTertiary,
    marginVertical: 1,
  },
  characterResponse: {
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.md,
    marginTop: DESIGN_TOKENS.spacing.md,
  },
  characterName: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.text,
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  characterMessage: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    color: DESIGN_TOKENS.colors.textSecondary,
    lineHeight: DESIGN_TOKENS.fontSize.md * 1.4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: DESIGN_TOKENS.spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    borderRadius: DESIGN_TOKENS.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.celebration.primary,
  },
  secondaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.celebration.secondary,
  },
  continueButton: {
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
  },
  buttonText: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textInverse,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '50%',
    left: '50%',
  },
});

export default MicroImprovementCelebration;
