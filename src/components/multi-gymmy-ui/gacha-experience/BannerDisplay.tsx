import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Banner,
  getBannerTimeRemaining,
  formatTimeRemaining,
  getBannerThemeColors,
  getBannerProgress,
} from './utils/BannerUtils';

interface BannerDisplayProps {
  banner: Banner;
  userGems: number;
  onPull: (pullType: 'single' | 'multi') => void;
  onBannerInfo: () => void;
}

const BannerDisplay: React.FC<BannerDisplayProps> = ({
  banner,
  userGems,
  onPull,
  onBannerInfo,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(getBannerTimeRemaining(banner));
  
  // Animation values
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  const themeColors = getBannerThemeColors(banner.theme);
  const progress = getBannerProgress(banner);
  
  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: progress / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    
    // Pulse animation for featured character
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Update time remaining every second
    const interval = setInterval(() => {
      setTimeRemaining(getBannerTimeRemaining(banner));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [banner]);
  
  const canPullSingle = userGems >= banner.pullCost;
  const canPullMulti = userGems >= banner.pullCost * 10;
  
  const handleSinglePull = () => {
    if (canPullSingle) {
      onPull('single');
    }
  };
  
  const handleMultiPull = () => {
    if (canPullMulti) {
      onPull('multi');
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Banner header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: themeColors.primary }]}>
            {banner.name}
          </Text>
          <TouchableOpacity onPress={onBannerInfo} style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={20} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.description}>{banner.description}</Text>
        
        {/* Time remaining */}
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color={themeColors.primary} />
          <Text style={[styles.timeText, { color: themeColors.primary }]}>
            {formatTimeRemaining(timeRemaining)}
          </Text>
        </View>
      </View>
      
      {/* Featured character */}
      <View style={styles.featuredContainer}>
        <Animated.View
          style={[
            styles.characterContainer,
            {
              transform: [{ scale: pulseAnimation }],
            },
          ]}
        >
          <Text style={styles.characterEmoji}>💪</Text>
          <Text style={styles.characterName}>{banner.featuredCharacter}</Text>
          <View style={[styles.rarityBadge, { backgroundColor: themeColors.accent }]}>
            <Text style={styles.rarityText}>{banner.featuredCharacterRarity.toUpperCase()}</Text>
          </View>
        </Animated.View>
      </View>
      
      {/* Banner progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Banner Progress</Text>
          <Text style={[styles.progressText, { color: themeColors.primary }]}>
            {Math.round(progress)}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: themeColors.secondary }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: themeColors.primary,
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
      
      {/* Pull options */}
      <View style={styles.pullOptions}>
        <View style={styles.pullOption}>
          <TouchableOpacity
            style={[
              styles.pullButton,
              {
                backgroundColor: canPullSingle ? themeColors.primary : '#DDD',
                opacity: canPullSingle ? 1 : 0.6,
              },
            ]}
            onPress={handleSinglePull}
            disabled={!canPullSingle}
          >
            <Ionicons name="diamond-outline" size={24} color="#FFF" />
            <Text style={styles.pullButtonText}>Single Pull</Text>
            <Text style={styles.pullCost}>{banner.pullCost} 💎</Text>
          </TouchableOpacity>
          
          {!canPullSingle && (
            <Text style={styles.insufficientText}>
              Need {banner.pullCost - userGems} more gems
            </Text>
          )}
        </View>
        
        <View style={styles.pullOption}>
          <TouchableOpacity
            style={[
              styles.pullButton,
              {
                backgroundColor: canPullMulti ? themeColors.accent : '#DDD',
                opacity: canPullMulti ? 1 : 0.6,
              },
            ]}
            onPress={handleMultiPull}
            disabled={!canPullMulti}
          >
            <Ionicons name="diamond" size={24} color="#FFF" />
            <Text style={styles.pullButtonText}>10x Pull</Text>
            <Text style={styles.pullCost}>{banner.pullCost * 10} 💎</Text>
            <View style={styles.guaranteedBadge}>
              <Text style={styles.guaranteedText}>Guaranteed {banner.guaranteedRarity}</Text>
            </View>
          </TouchableOpacity>
          
          {!canPullMulti && (
            <Text style={styles.insufficientText}>
              Need {(banner.pullCost * 10) - userGems} more gems
            </Text>
          )}
        </View>
      </View>
      
      {/* Banner stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={16} color={themeColors.primary} />
          <Text style={[styles.statText, { color: themeColors.primary }]}>
            {banner.rateUpMultiplier}x Rate Up
          </Text>
        </View>
        
        {banner.guaranteedRarity && (
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color={themeColors.primary} />
            <Text style={[styles.statText, { color: themeColors.primary }]}>
              Guaranteed {banner.guaranteedRarity} in {banner.guaranteedPulls} pulls
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuredContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  characterContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  characterEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pullOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pullOption: {
    flex: 1,
  },
  pullButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  pullButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  pullCost: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  guaranteedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 8,
  },
  guaranteedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  insufficientText: {
    fontSize: 12,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 8,
  },
  statsContainer: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BannerDisplay; 