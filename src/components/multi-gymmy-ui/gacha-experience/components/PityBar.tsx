import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getPityColor,
  getPityMessage,
  getPityVisualConfig,
  formatPityProgress,
  getPityEmoji,
} from '../utils/PityUtils';

interface PityProgress {
  current: number;
  max: number;
  percentage: number;
  guaranteed: boolean;
}

interface PityBarProps {
  rarity: 'legendary' | 'epic' | 'rare';
  progress: PityProgress;
  progressAnimation: Animated.Value;
  pulseAnimation: Animated.Value;
}

export const PityBar: React.FC<PityBarProps> = ({
  rarity,
  progress,
  progressAnimation,
  pulseAnimation,
}) => {
  const color = getPityColor(rarity, progress.percentage);
  const emoji = getPityEmoji(rarity, progress.percentage);
  const message = getPityMessage(rarity, progress.percentage);
  const visualConfig = getPityVisualConfig(rarity, progress.percentage);
  
  return (
    <View style={styles.pityBarContainer}>
      <View style={styles.pityBarHeader}>
        <View style={styles.rarityInfo}>
          <Text style={styles.rarityEmoji}>{emoji}</Text>
          <Text style={[styles.rarityLabel, { color }]}>{rarity.toUpperCase()}</Text>
        </View>
        <Text style={styles.pityCount}>
          {formatPityProgress(progress.current, progress.max)}
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { backgroundColor: `${color}20` }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: color,
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${progress.percentage}%`],
                }),
              },
            ]}
          />
          {progress.guaranteed && (
            <View style={[styles.guaranteedIndicator, { backgroundColor: color }]}>
              <Ionicons name="shield-checkmark" size={12} color="#FFF" />
            </View>
          )}
        </View>
      </View>
      
      <Text style={[styles.pityMessage, { color }]}>{message}</Text>
      
      {progress.percentage >= 80 && (
        <Animated.View
          style={[
            styles.highPityGlow,
            {
              backgroundColor: color,
              opacity: pulseAnimation.interpolate({
                inputRange: [1, 1.05],
                outputRange: [0.3, 0.6],
              }),
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pityBarContainer: {
    position: 'relative',
  },
  pityBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rarityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rarityEmoji: {
    fontSize: 16,
  },
  rarityLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pityCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  progressBarContainer: {
    position: 'relative',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  guaranteedIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  pityMessage: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  highPityGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 6,
    zIndex: -1,
  },
}); 