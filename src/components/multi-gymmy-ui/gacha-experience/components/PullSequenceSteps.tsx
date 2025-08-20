import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // Animated
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';

interface PullResult {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  character: string;
  isNew: boolean;
}

export const AnticipationStep: React.FC<{ animation: Animated.Value }> = ({ animation }) => (
  <View style={styles.stepContainer}>
    <Animated.View
      style={[
        styles.anticipationContainer,
        {
          transform: [{
            scale: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
        },
      ]}
    >
      <Text style={styles.anticipationText}>🎰</Text>
      <Text style={styles.anticipationSubtext}>Pulling...</Text>
    </Animated.View>
  </View>
);

export const RevealStep: React.FC<{ 
  result: PullResult; 
  animation: Animated.Value;
  visualConfig: any;
}> = ({ result, animation, visualConfig }) => (
  <View style={styles.stepContainer}>
    <Animated.View
      style={[
        styles.revealContainer,
        {
          transform: [{
            scale: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, visualConfig.scale],
            }),
          }],
          opacity: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ]}
    >
      <Text style={[styles.characterEmoji, { fontSize: 80 }]}>
        {result.character}
      </Text>
      <Text style={styles.characterName}>{result.name}</Text>
      <Text style={[styles.rarityText, { color: visualConfig.glowColor }]}>
        {result.rarity.toUpperCase()}
      </Text>
      {result.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW!</Text>
        </View>
      )}
    </Animated.View>
  </View>
);

export const CelebrationStep: React.FC<{ 
  result: PullResult; 
  animation: Animated.Value;
  message: string;
}> = ({ result, animation, message }) => (
  <View style={styles.stepContainer}>
    <Animated.View
      style={[
        styles.celebrationContainer,
        {
          transform: [{
            scale: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1.2],
            }),
          }],
        },
      ]}
    >
      <Text style={styles.celebrationMessage}>{message}</Text>
      <Text style={styles.characterEmoji}>{result.character}</Text>
    </Animated.View>
  </View>
);

export const SkipButtons: React.FC<{
  canSkip: boolean;
  animation: Animated.Value;
  onSkip: () => void;
  onSkipAll: () => void;
  pullType: 'single' | 'multi';
}> = ({ canSkip, animation, onSkip, onSkipAll, pullType }) => (
  <Animated.View
    style={[
      styles.skipButtonContainer,
      {
        opacity: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, canSkip ? 1 : 0],
        }),
      },
    ]}
  >
    <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
      <Ionicons name="play-skip-forward" size={20} color="#FFF" />
      <Text style={styles.skipButtonText}>Skip</Text>
    </TouchableOpacity>
    {pullType === 'multi' && (
      <TouchableOpacity style={styles.skipAllButton} onPress={onSkipAll}>
        <Ionicons name="play-skip-forward" size={20} color="#FFF" />
        <Text style={styles.skipButtonText}>Skip All</Text>
      </TouchableOpacity>
    )}
  </Animated.View>
);

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anticipationContainer: {
    alignItems: 'center',
  },
  anticipationText: {
    fontSize: 120,
    marginBottom: 20,
  },
  anticipationSubtext: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  revealContainer: {
    alignItems: 'center',
    padding: 40,
  },
  characterEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  characterName: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  rarityText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  newBadge: {
    backgroundColor: '#FF1493',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  celebrationContainer: {
    alignItems: 'center',
    padding: 40,
  },
  celebrationMessage: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  skipButtonContainer: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    flexDirection: 'row',
    gap: 10,
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
  skipAllButton: {
    backgroundColor: 'rgba(255, 20, 147, 0.8)',
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