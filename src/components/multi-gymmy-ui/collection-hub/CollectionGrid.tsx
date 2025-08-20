import React, { useState, useMemo, useCallback } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // FlatList,
  // TouchableOpacity,
  // Dimensions,
  // RefreshControl,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // Character
} from '../../context/types/MultiGymmyTypes';
import {
  // CollectionFilters,
  // CollectionViewMode,
  // SortOption,
  // filterCharacters,
  // sortCharacters,
  // enhanceCharacterForDisplay,
  // calculateCollectionStats,
  // 
} from './utils/CollectionUtils';
import {
  // useOptimizedList,
  // DEFAULT_PERFORMANCE_CONFIG,
  // 
} from './utils/PerformanceUtils';
import {
  // CharacterCard
} from './CharacterCard';
import {
  // CollectionStats
} from './CollectionStats';

interface CollectionGridProps {
  characters: Character[];
  filters: CollectionFilters;
  sortOption: SortOption;
  viewMode: CollectionViewMode;
  onCharacterPress: (character: Character) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onViewModeChange?: (mode: CollectionViewMode) => void;
  onSortChange?: (sort: SortOption) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const CollectionGrid: React.FC<CollectionGridProps> = ({
  characters,
  filters,
  sortOption,
  viewMode,
  onCharacterPress,
  onRefresh,
  refreshing = false,
  onViewModeChange,
  onSortChange,
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  // Process and filter characters
  const processedCharacters = useMemo(() => {
    // const filtered = ...; // Quick fix: commented unused variable
    // const sorted = ...; // Quick fix: commented unused variable
    return sorted.map(enhanceCharacterForDisplay);
  }, [characters, filters, sortOption]);

  // Calculate collection stats
  const collectionStats = useMemo(() => {
    return calculateCollectionStats(characters);
  }, [characters]);

  // Optimized list configuration
  const { virtualizedData, getItem, getItemCount, keyExtractor, performanceConfig } = 
    useOptimizedList(processedCharacters, (char) => char.id, {
      ...DEFAULT_PERFORMANCE_CONFIG,
      initialNumToRender: viewMode.columns * 3,
      maxToRenderPerBatch: viewMode.columns * 2,
    });

  // Handle character selection
  const handleCharacterPress = useCallback((character: Character) => {
    setSelectedCharacterId(character.id);
    onCharacterPress(character);
  }, [onCharacterPress]);

  // Render character item
  const renderCharacterItem = useCallback(({ item }: { item: any }) => {
    // const character = ...; // Quick fix: commented unused variable
    // const isSelected = ...; // Quick fix: commented unused variable

    return (
      <CharacterCard
        character={character}
        viewMode={viewMode}
        isSelected={isSelected}
        onPress={() => handleCharacterPress(character)}
      />
    );
  }, [viewMode, selectedCharacterId, handleCharacterPress]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#CCC" />
      <Text style={styles.emptyStateTitle}>No Characters Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {filters.search 
          ? 'Try adjusting your search terms'
          : 'Try adjusting your filters or pull some characters'
        }
      </Text>
    </View>
  ), [filters.search]);

  // Render header with stats and controls
  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <CollectionStats stats={collectionStats} />
      
      {processedCharacters.length > 0 && (
        <View style={styles.controls}>
          <View style={styles.viewModeControls}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode.type === 'grid' && styles.viewModeButtonActive,
              ]}
              onPress={() => onViewModeChange?.({ ...viewMode, type: 'grid' })}
            >
              <Ionicons 
                name="grid-outline" 
                size={20} 
                color={viewMode.type === 'grid' ? '#4ECDC4' : '#666'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode.type === 'list' && styles.viewModeButtonActive,
              ]}
              onPress={() => onViewModeChange?.({ ...viewMode, type: 'list' })}
            >
              <Ionicons 
                name="list-outline" 
                size={20} 
                color={viewMode.type === 'list' ? '#4ECDC4' : '#666'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode.type === 'compact' && styles.viewModeButtonActive,
              ]}
              onPress={() => onViewModeChange?.({ ...viewMode, type: 'compact' })}
            >
              <Ionicons 
                name="apps-outline" 
                size={20} 
                color={viewMode.type === 'compact' ? '#4ECDC4' : '#666'} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const newSort: SortOption = {
                ...sortOption,
                direction: sortOption.direction === 'asc' ? 'desc' : 'asc',
              };
              onSortChange?.(newSort);
            }}
          >
            <Ionicons 
              name={sortOption.direction === 'asc' ? 'arrow-up' : 'arrow-down'} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.sortButtonText}>{sortOption.label}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [collectionStats, processedCharacters.length, viewMode, sortOption, onViewModeChange, onSortChange]);

  // Calculate item layout based on view mode
  const getItemLayout = useCallback((data: any, index: number) => {
    const itemHeight = viewMode.type === 'compact' ? 80 : 
                      viewMode.type === 'list' ? 120 : 200;
    return {
      length: itemHeight,
      offset: itemHeight * index,
      index,
    };
  }, [viewMode.type]);

  return (
    <View style={styles.container}>
      <FlatList
        data={virtualizedData}
        renderItem={renderCharacterItem}
        keyExtractor={keyExtractor}
        getItem={getItem}
        getItemCount={getItemCount}
        getItemLayout={getItemLayout}
        numColumns={viewMode.type === 'list' ? 1 : viewMode.columns}
        key={`${viewMode.type}-${viewMode.columns}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4ECDC4']}
            tintColor="#4ECDC4"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        {...performanceConfig}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  viewModeControls: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  viewModeButtonActive: {
    backgroundColor: '#E8F5F5',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
}); 