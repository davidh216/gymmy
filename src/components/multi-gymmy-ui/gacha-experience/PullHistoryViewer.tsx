import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PullRecord {
  id: string;
  timestamp: Date;
  characterName: string;
  characterEmoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  bannerName?: string;
  pullType: 'single' | 'multi';
}

interface PullHistoryViewerProps {
  pullHistory: PullRecord[];
  onClose?: () => void;
  visible?: boolean;
}

const PullHistoryViewer: React.FC<PullHistoryViewerProps> = ({
  pullHistory,
  onClose,
  visible = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'rare' | 'epic' | 'legendary'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rarity'>('date');
  
  // Animation values
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  const filteredHistory = pullHistory.filter(record => {
    if (selectedFilter === 'all') return true;
    return record.rarity === selectedFilter;
  });
  
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'date') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    }
  });
  
  const getRarityColor = (rarity: string) => {
    const colors = {
      legendary: '#FF1493',
      epic: '#9932CC',
      rare: '#4169E1',
      common: '#808080',
    };
    return colors[rarity as keyof typeof colors] || '#666';
  };
  
  const getRarityEmoji = (rarity: string) => {
    const emojis = {
      legendary: '👑',
      epic: '⭐',
      rare: '✨',
      common: '⚪',
    };
    return emojis[rarity as keyof typeof emojis] || '❓';
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getAnalytics = () => {
    const total = pullHistory.length;
    const legendary = pullHistory.filter(p => p.rarity === 'legendary').length;
    const epic = pullHistory.filter(p => p.rarity === 'epic').length;
    const rare = pullHistory.filter(p => p.rarity === 'rare').length;
    const common = pullHistory.filter(p => p.rarity === 'common').length;
    
    return {
      total,
      legendary,
      epic,
      rare,
      common,
      legendaryRate: total > 0 ? (legendary / total * 100).toFixed(1) : '0',
      epicRate: total > 0 ? (epic / total * 100).toFixed(1) : '0',
      rareRate: total > 0 ? (rare / total * 100).toFixed(1) : '0',
    };
  };
  
  const analytics = getAnalytics();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnimation,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{
                translateY: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Pull History</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* Analytics */}
          <View style={styles.analyticsContainer}>
            <Text style={styles.analyticsTitle}>Pull Statistics</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>{analytics.total}</Text>
                <Text style={styles.analyticsLabel}>Total Pulls</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={[styles.analyticsNumber, { color: '#FF1493' }]}>
                  {analytics.legendary}
                </Text>
                <Text style={styles.analyticsLabel}>Legendary ({analytics.legendaryRate}%)</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={[styles.analyticsNumber, { color: '#9932CC' }]}>
                  {analytics.epic}
                </Text>
                <Text style={styles.analyticsLabel}>Epic ({analytics.epicRate}%)</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={[styles.analyticsNumber, { color: '#4169E1' }]}>
                  {analytics.rare}
                </Text>
                <Text style={styles.analyticsLabel}>Rare ({analytics.rareRate}%)</Text>
              </View>
            </View>
          </View>
          
          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['all', 'rare', 'epic', 'legendary'] as const).map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.activeFilterButton,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedFilter === filter && styles.activeFilterText,
                  ]}>
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'date' && styles.activeSortButton,
                ]}
                onPress={() => setSortBy('date')}
              >
                <Text style={[
                  styles.sortText,
                  sortBy === 'date' && styles.activeSortText,
                ]}>
                  Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy === 'rarity' && styles.activeSortButton,
                ]}
                onPress={() => setSortBy('rarity')}
              >
                <Text style={[
                  styles.sortText,
                  sortBy === 'rarity' && styles.activeSortText,
                ]}>
                  Rarity
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Pull History */}
          <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
            {sortedHistory.length > 0 ? (
              sortedHistory.map((record, index) => (
                <View key={record.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <View style={styles.characterInfo}>
                      <Text style={styles.characterEmoji}>{record.characterEmoji}</Text>
                      <View style={styles.characterDetails}>
                        <Text style={styles.characterName}>{record.characterName}</Text>
                        <Text style={styles.pullType}>
                          {record.pullType === 'multi' ? '10x Pull' : 'Single Pull'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rarityInfo}>
                      <Text style={styles.rarityEmoji}>{getRarityEmoji(record.rarity)}</Text>
                      <Text style={[
                        styles.rarityText,
                        { color: getRarityColor(record.rarity) },
                      ]}>
                        {record.rarity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.historyFooter}>
                    <Text style={styles.timestamp}>{formatDate(record.timestamp)}</Text>
                    {record.bannerName && (
                      <Text style={styles.bannerName}>{record.bannerName}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>No pull history found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your pull history will appear here after you make your first pull!
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  analyticsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    alignItems: 'center',
    flex: 1,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  filtersContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4ECDC4',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFF',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  activeSortButton: {
    backgroundColor: '#4ECDC4',
  },
  sortText: {
    fontSize: 12,
    color: '#666',
  },
  historyContainer: {
    flex: 1,
    padding: 20,
  },
  historyItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  characterEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  characterDetails: {
    flex: 1,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pullType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rarityInfo: {
    alignItems: 'center',
  },
  rarityEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  bannerName: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PullHistoryViewer; 