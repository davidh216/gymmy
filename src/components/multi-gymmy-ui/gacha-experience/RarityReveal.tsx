import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  createRarityRevealSequence,
  getRarityVisualConfig,
} from './utils/PullAnimationUtils';

interface RarityRevealProps {
  visible: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  characterName: string;
  characterEmoji: string;
  onComplete: () => void;
  onSkip?: () => void;
}

const RarityReveal: React.FC<RarityRevealProps> = ({
  visible,
  rarity,
  characterName,
  characterEmoji,
  onComplete,
  onSkip,
}) => {
  const [currentRevealStep, setCurrentRevealStep] = useState<'bronze' | 'silver' | 'gold' | 'legendary'>('bronze');
  const [canSkip, setCanSkip] = useState(false);
  
  // Animation values
  const revealAnimation = useRef(new Animated.Value(0)).current;
  const sparkleAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const skipAnimation = useRef(new Animated.Value(0)).current;
  
  const visualConfig = getRarityVisualConfig(rarity);
  const revealSteps: Array<'bronze' | 'silver' | 'gold' | 'legendary'> = ['bronze', 'silver', 'gold', 'legendary'];
  
  useEffect(() => {
    if (visible) {
      startRevealSequence();
    }
  }, [visible]);
  
  const startRevealSequence = () => {
    setCurrentRevealStep('bronze');
    setCanSkip(false);
    
    // Enable skip after 1 second
    setTimeout(() => setCanSkip(true), 1000);
    
    // Start with bronze reveal
    revealStep(0);
  };
  
  const revealStep = (stepIndex: number) => {
    if (stepIndex >= revealSteps.length) {
      // All steps revealed, complete
      setTimeout(onComplete, 1000);
      return;
    }
    
    const step = revealSteps[stepIndex];
    setCurrentRevealStep(step);
    
    // Reset animations
    revealAnimation.setValue(0);
    sparkleAnimation.setValue(0);
    glowAnimation.setValue(0);
    
    // Start reveal animation
    const reveal = createRarityRevealSequence(step, () => {
      // Move to next step after delay
      setTimeout(() => revealStep(stepIndex + 1), 800);
    });
    
    // Glow effect
    Animated.timing(glowAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  
  const handleSkip = () => {
    if (!canSkip || !onSkip) return;
    onSkip();
  };
  
  const getRevealEmoji = (step: string) => {
    const emojis = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      legendary: '👑',
    };
    return emojis[step as keyof typeof emojis] || '❓';
  };
  
  const getRevealColor = (step: string) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      legendary: '#FF1493',
    };
    return colors[step as keyof typeof colors] || '#666';
  };
  
  const shouldShowCharacter = currentRevealStep === rarity;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Background glow */}
        <Animated.View
          style={[
            styles.backgroundGlow,
            {
              backgroundColor: getRevealColor(currentRevealStep),
              opacity: glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />
        
        {/* Main content */}
        <View style={styles.content}>
          {/* Reveal card */}
          <Animated.View
            style={[
              styles.revealCard,
              {
                transform: [{
                  scale: revealAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }],
                opacity: revealAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            {/* Current reveal step */}
            <View style={styles.revealStepContainer}>
              <Text style={styles.revealEmoji}>{getRevealEmoji(currentRevealStep)}</Text>
              <Text style={[styles.revealText, { color: getRevealColor(currentRevealStep) }]}>
                {currentRevealStep.toUpperCase()}
              </Text>
            </View>
            
            {/* Character reveal */}
            {shouldShowCharacter && (
              <Animated.View
                style={[
                  styles.characterReveal,
                  {
                    opacity: revealAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                    transform: [{
                      scale: revealAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    }],
                  },
                ]}
              >
                <Text style={styles.characterEmoji}>{characterEmoji}</Text>
                <Text style={styles.characterName}>{characterName}</Text>
                <Text style={[styles.rarityText, { color: getRevealColor(rarity) }]}>
                  {rarity.toUpperCase()}
                </Text>
              </Animated.View>
            )}
            
            {/* Sparkle effect */}
            <Animated.View
              style={[
                styles.sparkleContainer,
                {
                  opacity: sparkleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            >
              {[...Array(8)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.sparkle,
                    {
                      backgroundColor: getRevealColor(currentRevealStep),
                      transform: [{
                        rotate: `${i * 45}deg`,
                      }],
                    },
                  ]}
                />
              ))}
            </Animated.View>
          </Animated.View>
          
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {revealSteps.map((step, index) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= revealSteps.indexOf(currentRevealStep) 
                      ? getRevealColor(step) 
                      : '#DDD',
                  },
                ]}
              />
            ))}
          </View>
        </View>
        
        {/* Skip button */}
        <Animated.View
          style={[
            styles.skipButtonContainer,
            {
              opacity: skipAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, canSkip ? 1 : 0],
              }),
            },
          ]}
        >
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Ionicons name="play-skip-forward" size={20} color="#FFF" />
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  revealStepContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  revealEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  revealText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  characterReveal: {
    alignItems: 'center',
    marginTop: 20,
  },
  characterEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  rarityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 10,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  skipButtonContainer: {
    position: 'absolute',
    bottom: 50,
    right: 20,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  skipButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RarityReveal; 