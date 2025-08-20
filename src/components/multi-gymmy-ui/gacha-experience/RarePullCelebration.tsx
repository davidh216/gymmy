import React, { useRef, useEffect } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // Animated,
  // Modal,
  // Dimensions,
  // 
} from 'react-native';
import {
  // createCelebrationAnimation,
  // createScreenFlash,
  // createConfettiAnimation,
  // getCelebrationMessage,
  // CELEBRATION_CONFIGS,
  // 
} from './utils/CelebrationUtils';

const { width, height } = Dimensions.get('window');

interface RarePullCelebrationProps {
  visible: boolean;
  rarity: 'rare' | 'epic' | 'legendary';
  characterName: string;
  characterEmoji: string;
  celebrationType: 'first_pull' | 'milestone' | 'collection_complete' | 'special_event';
  onComplete: () => void;
}

const RarePullCelebration: React.FC<RarePullCelebrationProps> = ({
  visible,
  rarity,
  characterName,
  characterEmoji,
  celebrationType,
  onComplete,
}) => {
  // Animation values
  // const scaleAnimation = ...; // Quick fix: commented unused variable
  // const opacityAnimation = ...; // Quick fix: commented unused variable
  // const rotationAnimation = ...; // Quick fix: commented unused variable
  // const flashAnimation = ...; // Quick fix: commented unused variable
  // const confettiAnimation = ...; // Quick fix: commented unused variable
  // const textAnimation = ...; // Quick fix: commented unused variable
  // const particleAnimation = ...; // Quick fix: commented unused variable
  
  // const config = ...; // Quick fix: commented unused variable
  // const message = ...; // Quick fix: commented unused variable
  
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
    particleAnimation.setValue(0);
    
    // Screen flash
    Animated.timing(flashAnimation, {
      toValue: 1,
      duration: 500,
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
    
    // Particle animation
    Animated.sequence([
      Animated.delay(config.duration * 0.1),
      Animated.timing(particleAnimation, {
        toValue: 1,
        duration: config.duration * 0.8,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Confetti for legendary and special celebrations
    if (rarity === 'legendary' || celebrationType === 'collection_complete') {
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
  
  const renderParticles = () => {
    // const particles = ...; // Quick fix: commented unused variable
    // const colors = ...; // Quick fix: commented unused variable
    
    for (let i = 0; i < config.particleCount; i++) {
      // const color = ...; // Quick fix: commented unused variable
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
              backgroundColor: color,
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
  
  const renderConfetti = () => {
    // const confettiPieces = ...; // Quick fix: commented unused variable
    // const colors = ...; // Quick fix: commented unused variable
    
    for (let i = 0; i < 40; i++) {
      // const color = ...; // Quick fix: commented unused variable
      // const left = ...; // Quick fix: commented unused variable
      // const delay = ...; // Quick fix: commented unused variable
      // const fallDuration = ...; // Quick fix: commented unused variable
      
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
  
  const getCelebrationTypeEmoji = () => {
    const emojis = {
      first_pull: '🎉',
      milestone: '🏆',
      collection_complete: '🎊',
      special_event: '🎆',
    };
    return emojis[celebrationType] || '🎉';
  };
  
  const getCelebrationTypeText = () => {
    const texts = {
      first_pull: 'First Pull!',
      milestone: 'Milestone Achieved!',
      collection_complete: 'Collection Complete!',
      special_event: 'Special Event!',
    };
    return texts[celebrationType] || 'Celebration!';
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
          {/* Celebration type indicator */}
          <Animated.View
            style={[
              styles.celebrationTypeContainer,
              {
                opacity: textAnimation,
                transform: [{
                  scale: textAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                }],
              },
            ]}
          >
            <Text style={styles.celebrationTypeEmoji}>{getCelebrationTypeEmoji()}</Text>
            <Text style={styles.celebrationTypeText}>{getCelebrationTypeText()}</Text>
          </Animated.View>
          
          {/* Celebration message */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: textAnimation,
                transform: [{
                  scale: textAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                }],
              },
            ]}
          >
            <Text style={[styles.celebrationMessage, { color: config.colors[0] }]}>
              {message}
            </Text>
          </Animated.View>
          
          {/* Character display */}
          <Animated.View
            style={[
              styles.characterContainer,
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
            <View style={[styles.characterRing, { borderColor: config.colors[0] }]}>
              <Text style={styles.characterEmoji}>{characterEmoji}</Text>
            </View>
            <Text style={styles.characterName}>{characterName}</Text>
            <Text style={[styles.rarityText, { color: config.colors[0] }]}>
              {rarity.toUpperCase()}
            </Text>
          </Animated.View>
          
          {/* Particles */}
          <View style={styles.particlesContainer}>
            {renderParticles()}
          </View>
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
          <Text style={[styles.rarityIndicatorText, { color: config.colors[0] }]}>
            {rarity.toUpperCase()} PULL!
          </Text>
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
  celebrationTypeContainer: {
    position: 'absolute',
    top: '15%',
    alignItems: 'center',
  },
  celebrationTypeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrationTypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  messageContainer: {
    position: 'absolute',
    top: '25%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  celebrationMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  characterEmoji: {
    fontSize: 64,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rarityText: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    bottom: '15%',
    alignItems: 'center',
  },
  rarityIndicatorText: {
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default RarePullCelebration; 