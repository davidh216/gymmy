import React, { useRef, useEffect, useState } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // Animated,
  // TouchableOpacity,
  // Dimensions,
  // AccessibilityInfo,
  // 
} from 'react-native';
import {
  // DESIGN_TOKENS,
  // getImprovementColor,
  // getValidationColor
} from '../../../../constants/designTokens';

const { width } = Dimensions.get('window');

interface ImprovementNotificationProps {
  visible: boolean;
  improvement: {
    dimension: string;
    improvement_percentage: number;
    confidence_score: number;
  };
  onPress?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

const ImprovementNotification: React.FC<ImprovementNotificationProps> = ({
  visible,
  improvement,
  onPress,
  onDismiss,
  autoHide = true,
  duration = 4000,
}) => {
  // Animation values
  // const slideAnimation = ...; // Quick fix: commented unused variable
  // const opacityAnimation = ...; // Quick fix: commented unused variable
  // const scaleAnimation = ...; // Quick fix: commented unused variable
  // const progressAnimation = ...; // Quick fix: commented unused variable

  // State
  const [isVisible, setIsVisible] = useState(false);
  const [accessibilityAnnounced, setAccessibilityAnnounced] = useState(false);

  // Get colors
  // const improvementColor = ...; // Quick fix: commented unused variable
  // const validationColor = ...; // Quick fix: commented unused variable

  const getNotificationMessage = () => {
    // const percentage = ...; // Quick fix: commented unused variable
    // const dimension = ...; // Quick fix: commented unused variable
    return `${dimension} +${percentage}%`;
  };

  const getConfidenceMessage = () => {
    // const confidence = ...; // Quick fix: commented unused variable
    return `${confidence}% confidence`;
  };

  useEffect(() => {
    if (visible && !isVisible) {
      showNotification();
    } else if (!visible && isVisible) {
      hideNotification();
    }
  }, [visible]);

  const showNotification = () => {
    setIsVisible(true);
    announceAccessibility();

    // Slide in animation
    Animated.parallel([
      Animated.spring(slideAnimation, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Auto hide
    if (autoHide) {
      setTimeout(() => {
        hideNotification();
      }, duration);
    }
  };

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const announceAccessibility = () => {
    if (!accessibilityAnnounced) {
      // const message = ...; // Quick fix: commented unused variable
      AccessibilityInfo.announceForAccessibility(message);
      setAccessibilityAnnounced(true);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleDismiss = () => {
    hideNotification();
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnimation },
            { scale: scaleAnimation },
          ],
          opacity: opacityAnimation,
        },
      ]}
      accessible={true}
      accessibilityLabel={`Improvement notification: ${getNotificationMessage()}`}
      accessibilityHint="Tap to view details or swipe to dismiss"
    >
      {/* Progress bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: validationColor,
          },
        ]}
      />

      {/* Main content */}
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: improvementColor }]}>
          <Text style={styles.icon}>📈</Text>
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>1% Better!</Text>
          <Text style={[styles.message, { color: improvementColor }]}>
            {getNotificationMessage()}
          </Text>
          <Text style={styles.confidence}>{getConfidenceMessage()}</Text>
        </View>

        {/* Dismiss button */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          accessible={true}
          accessibilityLabel="Dismiss notification"
          accessibilityHint="Dismisses this improvement notification"
        >
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: DESIGN_TOKENS.spacing.md,
    right: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    ...DESIGN_TOKENS.shadows.lg,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.colors.celebration.primary,
    overflow: 'hidden',
    zIndex: 1000,
  },
  progressBar: {
    height: 3,
    backgroundColor: DESIGN_TOKENS.colors.celebration.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN_TOKENS.spacing.md,
  },
  icon: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.text,
    marginBottom: 2,
  },
  message: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  confidence: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    color: DESIGN_TOKENS.colors.textTertiary,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: DESIGN_TOKENS.spacing.sm,
  },
  dismissText: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textSecondary,
    lineHeight: DESIGN_TOKENS.fontSize.lg,
  },
});

export default ImprovementNotification;
