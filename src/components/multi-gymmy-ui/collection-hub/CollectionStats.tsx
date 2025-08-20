import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // CollectionStats as CollectionStatsType
} from './utils/CollectionUtils';

interface CollectionStatsProps {
  stats: CollectionStatsType;
}

export const CollectionStats: React.FC<CollectionStatsProps> = ({ stats }) => {
  const getCompletionColor = (percentage: number): string => {
    if (percentage >= 80) return '#26DE81';
    if (percentage >= 60) return '#FED330';
    if (percentage >= 40) return '#FF6B6B';
    return '#95A5A6';
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#A55EEA';
      case 'rare': return '#4ECDC4';
      case 'common': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={20} color="#4ECDC4" />
          <Text style={styles.statValue}>{stats.totalCharacters}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.statValue}>{stats.uniqueCharacters}</Text>
          <Text style={styles.statLabel}>Unique</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={20} color={getCompletionColor(stats.completionPercentage)} />
          <Text style={styles.statValue}>{Math.round(stats.completionPercentage)}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={20} color="#4ECDC4" />
          <Text style={styles.statValue}>{Math.round(stats.averageLevel)}</Text>
          <Text style={styles.statLabel}>Avg Level</Text>
        </View>
      </View>

      <View style={styles.rarityBreakdown}>
        <View style={styles.rarityItem}>
          <View style={[styles.rarityDot, { backgroundColor: getRarityColor('legendary') }]} />
          <Text style={styles.rarityCount}>{stats.byRarity.legendary}</Text>
        </View>
        <View style={styles.rarityItem}>
          <View style={[styles.rarityDot, { backgroundColor: getRarityColor('epic') }]} />
          <Text style={styles.rarityCount}>{stats.byRarity.epic}</Text>
        </View>
        <View style={styles.rarityItem}>
          <View style={[styles.rarityDot, { backgroundColor: getRarityColor('rare') }]} />
          <Text style={styles.rarityCount}>{stats.byRarity.rare}</Text>
        </View>
        <View style={styles.rarityItem}>
          <View style={[styles.rarityDot, { backgroundColor: getRarityColor('common') }]} />
          <Text style={styles.rarityCount}>{stats.byRarity.common}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rarityBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  rarityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rarityCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
}); 