import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import {
  createCelebrationAnimation,
  createScreenFlash,
  createConfettiAnimation,
  getCelebrationMessage,
  CELEBRATION_CONFIGS,
} from './utils/CelebrationUtils';

const { width, height } = Dimensions.get('window');

interface CelebrationEffectsProps {
  visible: boolean;
  rarity: 'rare' | 'epic' | 'legendary';
  characterName: string;
  onComplete: () => void;
}

const CelebrationEffects: React.FC<CelebrationEffectsProps> = ({
  visible,
  rarity,
  characterName,
  onComplete,
}) => {
  // Animation values
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const rotationAnimation = useRef(new Animated.Value(0)).current;
  const flashAnimation = useRef(new Animated.Value(0)).current;
  const confettiAnimation = useRef(new Animated.Value(0)).current;
  const textAnimation = useRef(new Animated.Value(0)).current;
  
  const config = CELEBRATION_CONFIGS[rarity];
  const message = getCelebrationMessage(rarity, characterName);
  
  useEffect(() => {
    if (visible) {
      startCelebration();
    }
  }, [visible]);
  
  const startCelebration = () => {
    // Reset animations
    scaleAnimation.setValue(0);
    opacityAnimation.setValue(0);
    rotationAnimation.setValue(0);
    flashAnimation.setValue(0);
    confettiAnimation.setValue(0);
    textAnimation.setValue(0);
    
    // Screen flash
    Animated.timing(flashAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Main celebration sequence
    Animated.sequence([
      // Initial scale up
      Animated.timing(scaleAnimation, {
        toValue: config.scale,
        duration: config.duration * 0.4,
        useNativeDriver: true,
      }),
      
      // Hold
      Animated.delay(config.duration * 0.2),
      
      // Scale down
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: config.duration * 0.4,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Opacity animation
    Animated.sequence([
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: config.duration * 0.3,
        useNativeDriver: true,
      }),
      Animated.delay(config.duration * 0.4),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: config.duration * 0.3,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Rotation animation
    Animated.timing(rotationAnimation, {
      toValue: 1,
      duration: config.duration,
      useNativeDriver: true,
    }).start();
    
    // Text animation
    Animated.sequence([
      Animated.delay(config.duration * 0.2),
      Animated.timing(textAnimation, {
        toValue: 1,
        duration: config.duration * 0.6,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Confetti for legendary
    if (rarity === 'legendary') {
      Animated.sequence([
        Animated.delay(config.duration * 0.3),
        Animated.timing(confettiAnimation, {
          toValue: 1,
          duration: config.duration * 0.7,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Complete after animation
    setTimeout(onComplete, config.duration);
  };
  
  const renderConfetti = () => {
    const confettiPieces = [];
    const colors = config.colors;
    
    for (let i = 0; i < 30; i++) {
      const color = colors[i % colors.length];
      const left = Math.random() * width;
      const delay = Math.random() * 1000;
      const duration = 2000 + Math.random() * 1000;
      
      confettiPieces.push(
        <Animated.View
          key={i}
          style={[
            styles.confettiPiece,
            {
              left,
              backgroundColor: color,
              transform: [{
                translateY: confettiAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height],
                }),
              }],
            },
          ]}
        />
      );
    }
    
    return confettiPieces;
  };
  
  const renderParticles = () => {
    const particles = [];
    const colors = config.colors;
    
    for (let i = 0; i < config.particleCount; i++) {
      const color = colors[i % colors.length];
      const angle = (i / config.particleCount) * 2 * Math.PI;
      const radius = 100 + Math.random() * 50;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: color,
              transform: [
                {
                  translateX: opacityAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, x],
                  }),
                },
                {
                  translateY: opacityAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, y],
                  }),
                },
                {
                  scale: opacityAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        />
      );
    }
    
    return particles;
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Screen flash */}
        <Animated.View
          style={[
            styles.screenFlash,
            {
              opacity: flashAnimation,
              backgroundColor: config.colors[0],
            },
          ]}
        />
        
        {/* Main celebration content */}
        <View style={styles.content}>
          {/* Particles */}
          <View style={styles.particlesContainer}>
            {renderParticles()}
          </View>
          
          {/* Celebration text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textAnimation,
                transform: [
                  {
                    scale: textAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.celebrationText, { color: config.colors[0] }]}>
              {message}
            </Text>
          </Animated.View>
          
          {/* Central celebration element */}
          <Animated.View
            style={[
              styles.celebrationElement,
              {
                opacity: opacityAnimation,
                transform: [
                  {
                    scale: scaleAnimation,
                  },
                  {
                    rotate: rotationAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.celebrationRing, { borderColor: config.colors[0] }]}>
              <Text style={styles.celebrationEmoji}>
                {rarity === 'legendary' ? '👑' : rarity === 'epic' ? '⭐' : '✨'}
              </Text>
            </View>
          </Animated.View>
        </View>
        
        {/* Confetti */}
        <View style={styles.confettiContainer}>
          {renderConfetti()}
        </View>
        
        {/* Rarity indicator */}
        <Animated.View
          style={[
            styles.rarityIndicator,
            {
              opacity: textAnimation,
              transform: [{
                translateY: textAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={[styles.rarityText, { color: config.colors[0] }]}>
            {rarity.toUpperCase()}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
  },
  textContainer: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  celebrationElement: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  celebrationEmoji: {
    fontSize: 48,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  confettiPiece: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: -10,
  },
  rarityIndicator: {
    position: 'absolute',
    bottom: '20%',
    alignItems: 'center',
  },
  rarityText: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default CelebrationEffects; 