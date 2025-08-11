import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CollectionFilters, CollectionViewMode } from '../utils/CollectionUtils';

interface FilterControlsProps {
  filters: CollectionFilters;
  viewMode: CollectionViewMode;
  onFiltersChange: (filters: CollectionFilters) => void;
  onViewModeChange: (viewMode: CollectionViewMode) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  viewMode,
  onFiltersChange,
  onViewModeChange,
}) => {
  const rarityOptions = ['common', 'rare', 'epic', 'legendary'] as const;
  const classOptions = ['strength', 'cardio', 'flexibility', 'balance', 'endurance'] as const;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Filters & Sorting</Text>
      
      {/* Rarity Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Rarity:</Text>
        <View style={styles.filterChips}>
          {rarityOptions.map(rarity => (
            <TouchableOpacity
              key={rarity}
              style={[
                styles.filterChip,
                filters.rarity.includes(rarity) && styles.filterChipActive,
              ]}
              onPress={() => {
                onFiltersChange({
                  ...filters,
                  rarity: filters.rarity.includes(rarity)
                    ? filters.rarity.filter(r => r !== rarity)
                    : [...filters.rarity, rarity],
                });
              }}
            >
              <Text style={[
                styles.filterChipText,
                filters.rarity.includes(rarity) && styles.filterChipTextActive,
              ]}>
                {rarity.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Class Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Class:</Text>
        <View style={styles.filterChips}>
          {classOptions.map(characterClass => (
            <TouchableOpacity
              key={characterClass}
              style={[
                styles.filterChip,
                filters.class.includes(characterClass) && styles.filterChipActive,
              ]}
              onPress={() => {
                onFiltersChange({
                  ...filters,
                  class: filters.class.includes(characterClass)
                    ? filters.class.filter(c => c !== characterClass)
                    : [...filters.class, characterClass],
                });
              }}
            >
              <Text style={[
                styles.filterChipText,
                filters.class.includes(characterClass) && styles.filterChipTextActive,
              ]}>
                {characterClass.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* View Mode Controls */}
      <View style={styles.viewModeSection}>
        <Text style={styles.filterLabel}>View Mode:</Text>
        <View style={styles.viewModeButtons}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode.type === 'grid' && styles.viewModeButtonActive,
            ]}
            onPress={() => onViewModeChange({ type: 'grid', columns: 2, showDetails: true })}
          >
            <Ionicons name="grid-outline" size={20} color={viewMode.type === 'grid' ? '#4ECDC4' : '#666'} />
            <Text style={styles.viewModeButtonText}>Grid</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode.type === 'list' && styles.viewModeButtonActive,
            ]}
            onPress={() => onViewModeChange({ type: 'list', columns: 1, showDetails: true })}
          >
            <Ionicons name="list-outline" size={20} color={viewMode.type === 'list' ? '#4ECDC4' : '#666'} />
            <Text style={styles.viewModeButtonText}>List</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode.type === 'compact' && styles.viewModeButtonActive,
            ]}
            onPress={() => onViewModeChange({ type: 'compact', columns: 3, showDetails: false })}
          >
            <Ionicons name="apps-outline" size={20} color={viewMode.type === 'compact' ? '#4ECDC4' : '#666'} />
            <Text style={styles.viewModeButtonText}>Compact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  viewModeSection: {
    marginTop: 16,
  },
  viewModeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  viewModeButtonActive: {
    backgroundColor: '#E8F5F5',
  },
  viewModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
}); 