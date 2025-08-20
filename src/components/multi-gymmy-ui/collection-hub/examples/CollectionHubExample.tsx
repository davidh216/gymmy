import React, { useState, useMemo } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // ScrollView,
  // TouchableOpacity,
  // Alert,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // Character
} from '../../../context/types/MultiGymmyTypes';
import {
  // CollectionGrid,
  // CollectionFilters,
  // CollectionViewMode,
  // SortOption,
  // 
} from '../index';
import {
  // calculateCollectionStats,
  // 
} from '../utils/CollectionUtils';
import {
  // mockCharacters,
  // defaultFilters,
  // defaultSortOption,
  // defaultViewMode,
  // 
} from './CollectionExampleData';
import {
  // FilterControls
} from '../components/FilterControls';

export const CollectionHubExample: React.FC = () => {
  const [filters, setFilters] = useState<CollectionFilters>(defaultFilters);
  const [sortOption, setSortOption] = useState<SortOption>(defaultSortOption);
  const [viewMode, setViewMode] = useState<CollectionViewMode>(defaultViewMode);

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate collection stats
  const collectionStats = useMemo(() => {
    return calculateCollectionStats(mockCharacters);
  }, [mockCharacters]);

  // Handle character selection
  const handleCharacterPress = (character: Character) => {
    setSelectedCharacter(character);
    Alert.alert(
      'Character Selected',
      `You selected ${character.name} (${character.rarity} ${character.class})`,
      [
        { text: 'View Details', onPress: () => console.log('View details') },
        { text: 'Compare', onPress: () => console.log('Compare') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Collection data has been refreshed!');
    }, 1000);
  };

  // Handle view mode change
  const handleViewModeChange = (newViewMode: CollectionViewMode) => {
    setViewMode(newViewMode);
  };

  // Handle sort change
  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort);
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collection Hub</Text>
        <Text style={styles.subtitle}>Manage your character collection</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Collection Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Collection Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color="#4ECDC4" />
              <Text style={styles.statValue}>{collectionStats.totalCharacters}</Text>
              <Text style={styles.statLabel}>Total Characters</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{collectionStats.uniqueCharacters}</Text>
              <Text style={styles.statLabel}>Unique Characters</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color="#26DE81" />
              <Text style={styles.statValue}>{Math.round(collectionStats.completionPercentage)}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </View>

        {/* Filter Controls */}
        <FilterControls
          filters={filters}
          viewMode={viewMode}
          onFiltersChange={setFilters}
          onViewModeChange={setViewMode}
        />

        {/* Collection Grid */}
        <View style={styles.collectionSection}>
          <Text style={styles.sectionTitle}>Your Characters</Text>
          <CollectionGrid
            characters={mockCharacters}
            filters={filters}
            sortOption={sortOption}
            viewMode={viewMode}
            onCharacterPress={handleCharacterPress}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onViewModeChange={handleViewModeChange}
            onSortChange={handleSortChange}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Feature', 'Evolution planning coming soon!')}
          >
            <Ionicons name="trending-up" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Evolution Planning</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Feature', 'Character comparison coming soon!')}
          >
            <Ionicons name="git-compare" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Compare Characters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5F5',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  collectionSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionsSection: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
}); 