import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // Banner,
  // getBannerStatus,
  // getBannerThemeColors,
  // getBannerProgress,
  // getBannerTimeRemaining,
  // getBannerTimeUntilStart,
  // formatTimeRemaining
} from '../utils/BannerUtils';

interface BannerCardProps {
  banner: Banner;
  isSelected?: boolean;
  onPress: (banner: Banner) => void;
}

export const BannerCard: React.FC<BannerCardProps> = ({ banner, isSelected = false, onPress }) => {
  // const status = ...; // Quick fix: commented unused variable
  // const themeColors = ...; // Quick fix: commented unused variable
  // const progress = ...; // Quick fix: commented unused variable
  
  let timeInfo = null;
  if (status === 'active') {
    // const timeRemaining = ...; // Quick fix: commented unused variable
    timeInfo = (
      <View style={styles.timeInfo}>
        <Ionicons name="time-outline" size={16} color="#FFF" />
        <Text style={styles.timeText}>{formatTimeRemaining(timeRemaining)}</Text>
      </View>
    );
  } else if (status === 'upcoming') {
    // const timeUntilStart = ...; // Quick fix: commented unused variable
    timeInfo = (
      <View style={styles.timeInfo}>
        <Ionicons name="calendar-outline" size={16} color="#FFF" />
        <Text style={styles.timeText}>Starts in {formatTimeRemaining(timeUntilStart)}</Text>
      </View>
    );
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.bannerCard,
        {
          backgroundColor: themeColors.background,
          borderColor: isSelected ? themeColors.primary : 'transparent',
          borderWidth: isSelected ? 2 : 0,
        },
      ]}
      onPress={() => onPress(banner)}
      disabled={status === 'ended'}
    >
      <View style={styles.bannerHeader}>
        <View style={styles.bannerTitleContainer}>
          <Text style={[styles.bannerTitle, { color: themeColors.primary }]}>
            {banner.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: themeColors.accent }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>
        {status === 'active' && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: themeColors.secondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: themeColors.primary,
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: themeColors.primary }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.bannerContent}>
        <Text style={styles.bannerDescription}>{banner.description}</Text>
        
        <View style={styles.featuredCharacterContainer}>
          <Text style={styles.featuredCharacterLabel}>Featured Character:</Text>
          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>{banner.featuredCharacter}</Text>
            <View style={[styles.rarityBadge, { backgroundColor: themeColors.accent }]}>
              <Text style={styles.rarityText}>{banner.featuredCharacterRarity.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.bannerStats}>
          <View style={styles.statItem}>
            <Ionicons name="diamond-outline" size={16} color={themeColors.primary} />
            <Text style={[styles.statText, { color: themeColors.primary }]}>
              {banner.pullCost} gems
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trending-up-outline" size={16} color={themeColors.primary} />
            <Text style={[styles.statText, { color: themeColors.primary }]}>
              {banner.rateUpMultiplier}x rate up
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
      
      {timeInfo}
      
      {status === 'ended' && (
        <View style={styles.disabledOverlay}>
          <Text style={styles.disabledText}>ENDED</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  bannerHeader: {
    marginBottom: 16,
  },
  bannerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
  },
  bannerContent: {
    gap: 12,
  },
  bannerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featuredCharacterContainer: {
    gap: 8,
  },
  featuredCharacterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bannerStats: {
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
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
}); 