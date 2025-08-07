// src/components/multi-gymmy/CharacterGallery.js
// Enhanced character gallery with filtering, sorting, and detailed character cards

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Mock character data - this would come from MultiGymmy system
const mockCharacters = [
  {
    id: 'rookie_power',
    name: 'Rookie Power',
    rarity: 'common',
    type: 'rookie',
    specialization: 'strength_training',
    emoji: '💪',
    level: 15,
    evolution_stage: 1,
    current_stats: { strength: 60, cardio: 30, flexibility: 25, focus: 40, motivation: 70, loyalty: 80 },
    bond_points: 250,
    is_favorite: true,
    total_workouts_together: 45,
  },
  {
    id: 'cardio_queen',
    name: 'Cardio Queen',
    rarity: 'rare',
    type: 'specialist',
    specialization: 'cardio_endurance',
    emoji: '👑',
    level: 22,
    evolution_stage: 2,
    current_stats: { strength: 50, cardio: 90, flexibility: 60, focus: 80, motivation: 85, loyalty: 75 },
    bond_points: 680,
    is_favorite: false,
    total_workouts_together: 78,
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    rarity: 'epic',
    type: 'specialist',
    specialization: 'mental_wellness',
    emoji: '🕯️',
    level: 35,
    evolution_stage: 2,
    current_stats: { strength: 60, cardio: 70, flexibility: 95, focus: 99, motivation: 85, loyalty: 90 },
    bond_points: 1200,
    is_favorite: true,
    total_workouts_together: 156,
  },
  {
    id: 'titan_forge',
    name: 'Titan Forge',
    rarity: 'legendary',
    type: 'legendary',
    specialization: 'strength_training',
    emoji: '🔥',
    level: 48,
    evolution_stage: 3,
    current_stats: { strength: 95, cardio: 70, flexibility: 50, focus: 90, motivation: 95, loyalty: 99 },
    bond_points: 2500,
    is_favorite: true,
    total_workouts_together: 234,
  },
];

const CharacterGallery = ({ 
  characters = mockCharacters, 
  onCharacterSelect, 
  onCharacterFavorite,
  showTeamBuilder = false, 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('level'); // 'level', 'rarity', 'name', 'bond_points'
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);

  // Filter and sort characters
  const filteredAndSortedCharacters = useMemo(() => {
    const filtered = characters.filter(char => {
      // Search filter
      if (searchQuery && !char.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Rarity filter
      if (filterRarity !== 'all' && char.rarity !== filterRarity) {
        return false;
      }
      
      // Type filter
      if (filterType !== 'all' && char.type !== filterType) {
        return false;
      }
      
      return true;
    });

    // Sort characters
    filtered.sort((a, b) => {
      switch (sortBy) {
      case 'level':
        return b.level - a.level;
      case 'rarity':
        const rarityOrder = { mythical: 5, legendary: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      case 'name':
        return a.name.localeCompare(b.name);
      case 'bond_points':
        return b.bond_points - a.bond_points;
      default:
        return 0;
      }
    });

    return filtered;
  }, [characters, searchQuery, filterRarity, filterType, sortBy]);

  const handleCharacterPress = useCallback((character) => {
    if (showTeamBuilder) {
      onCharacterSelect?.(character);
    } else {
      setSelectedCharacter(character);
      setShowCharacterModal(true);
    }
  }, [showTeamBuilder, onCharacterSelect]);

  const handleFavoritePress = useCallback((character) => {
    onCharacterFavorite?.(character.id, !character.is_favorite);
  }, [onCharacterFavorite]);

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9E9E9E',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FF9800',
      mythical: '#E91E63',
    };
    return colors[rarity] || colors.common;
  };

  const renderCharacterCard = (character) => {
    const rarityColor = getRarityColor(character.rarity);
    
    if (viewMode === 'list') {
      return (
        <TouchableOpacity
          key={character.id}
          style={[styles.listCard, { borderLeftColor: rarityColor }]}
          onPress={() => handleCharacterPress(character)}
        >
          <View style={styles.listCardContent}>
            <View style={styles.listCardLeft}>
              <Text style={styles.characterEmoji}>{character.emoji}</Text>
              <View style={styles.listCardInfo}>
                <Text style={styles.characterName}>{character.name}</Text>
                <Text style={[styles.characterRarity, { color: rarityColor }]}>
                  {character.rarity.toUpperCase()} • LV.{character.level}
                </Text>
                <Text style={styles.characterStats}>
                  Bond: {character.bond_points} • Workouts: {character.total_workouts_together}
                </Text>
              </View>
            </View>
            
            <View style={styles.listCardRight}>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => handleFavoritePress(character)}
              >
                <Ionicons
                  name={character.is_favorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={character.is_favorite ? '#FF6B6B' : '#666'}
                />
              </TouchableOpacity>
              
              <View style={styles.evolutionIndicator}>
                {Array.from({ length: 3 }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.evolutionDot,
                      { backgroundColor: i < character.evolution_stage ? rarityColor : '#E0E0E0' },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={character.id}
        style={[styles.gridCard, { borderColor: rarityColor }]}
        onPress={() => handleCharacterPress(character)}
      >
        <View style={[styles.gridCardHeader, { backgroundColor: rarityColor }]}>
          <Text style={styles.gridCardLevel}>LV.{character.level}</Text>
          <TouchableOpacity
            style={styles.gridFavoriteButton}
            onPress={() => handleFavoritePress(character)}
          >
            <Ionicons
              name={character.is_favorite ? 'heart' : 'heart-outline'}
              size={20}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.gridCardContent}>
          <Text style={styles.gridCharacterEmoji}>{character.emoji}</Text>
          <Text style={styles.gridCharacterName}>{character.name}</Text>
          <Text style={[styles.gridCharacterRarity, { color: rarityColor }]}>
            {character.rarity.toUpperCase()}
          </Text>
          
          <View style={styles.gridStatsContainer}>
            <View style={styles.statBar}>
              <Text style={styles.statLabel}>STR</Text>
              <View style={styles.statBarBg}>
                <View 
                  style={[
                    styles.statBarFill, 
                    { width: `${character.current_stats.strength}%`, backgroundColor: rarityColor },
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.statBar}>
              <Text style={styles.statLabel}>CAR</Text>
              <View style={styles.statBarBg}>
                <View 
                  style={[
                    styles.statBarFill, 
                    { width: `${character.current_stats.cardio}%`, backgroundColor: rarityColor },
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.statBar}>
              <Text style={styles.statLabel}>FOC</Text>
              <View style={styles.statBarBg}>
                <View 
                  style={[
                    styles.statBarFill, 
                    { width: `${character.current_stats.focus}%`, backgroundColor: rarityColor },
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <View style={styles.gridEvolutionIndicator}>
            {Array.from({ length: 3 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.gridEvolutionDot,
                  { backgroundColor: i < character.evolution_stage ? rarityColor : '#E0E0E0' },
                ]}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filters & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {['level', 'rarity', 'name', 'bond_points'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.filterOption}
                  onPress={() => setSortBy(option)}
                >
                  <Text style={styles.filterOptionText}>
                    {option.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Ionicons
                    name={sortBy === option ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Filter by Rarity</Text>
              {['all', 'common', 'rare', 'epic', 'legendary', 'mythical'].map((rarity) => (
                <TouchableOpacity
                  key={rarity}
                  style={styles.filterOption}
                  onPress={() => setFilterRarity(rarity)}
                >
                  <Text style={styles.filterOptionText}>
                    {rarity.toUpperCase()}
                  </Text>
                  <Ionicons
                    name={filterRarity === rarity ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Filter by Type</Text>
              {['all', 'rookie', 'specialist', 'legendary', 'community'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.filterOption}
                  onPress={() => setFilterType(type)}
                >
                  <Text style={styles.filterOptionText}>
                    {type.toUpperCase()}
                  </Text>
                  <Ionicons
                    name={filterType === type ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderCharacterDetailModal = () => (
    <Modal
      visible={showCharacterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCharacterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.characterModal}>
          {selectedCharacter && (
            <>
              <View style={[styles.characterModalHeader, { backgroundColor: getRarityColor(selectedCharacter.rarity) }]}>
                <TouchableOpacity onPress={() => setShowCharacterModal(false)}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.characterModalTitle}>{selectedCharacter.name}</Text>
                <TouchableOpacity onPress={() => handleFavoritePress(selectedCharacter)}>
                  <Ionicons
                    name={selectedCharacter.is_favorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.characterModalContent}>
                <View style={styles.characterModalMain}>
                  <Text style={styles.characterModalEmoji}>{selectedCharacter.emoji}</Text>
                  <Text style={styles.characterModalName}>{selectedCharacter.name}</Text>
                  <Text style={[styles.characterModalRarity, { color: getRarityColor(selectedCharacter.rarity) }]}>
                    {selectedCharacter.rarity.toUpperCase()} • LEVEL {selectedCharacter.level}
                  </Text>
                </View>
                
                <View style={styles.characterModalStats}>
                  <Text style={styles.statsTitle}>Stats</Text>
                  {Object.entries(selectedCharacter.current_stats).map(([stat, value]) => (
                    <View key={stat} style={styles.detailedStatBar}>
                      <Text style={styles.detailedStatLabel}>
                        {stat.replace('_', ' ').toUpperCase()}
                      </Text>
                      <View style={styles.detailedStatBarContainer}>
                        <View style={styles.detailedStatBarBg}>
                          <View 
                            style={[
                              styles.detailedStatBarFill, 
                              { 
                                width: `${value}%`, 
                                backgroundColor: getRarityColor(selectedCharacter.rarity), 
                              },
                            ]} 
                          />
                        </View>
                        <Text style={styles.detailedStatValue}>{value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                <View style={styles.characterModalInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Bond Points</Text>
                    <Text style={styles.infoValue}>{selectedCharacter.bond_points}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Workouts Together</Text>
                    <Text style={styles.infoValue}>{selectedCharacter.total_workouts_together}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Evolution Stage</Text>
                    <Text style={styles.infoValue}>{selectedCharacter.evolution_stage}/3</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Specialization</Text>
                    <Text style={styles.infoValue}>
                      {selectedCharacter.specialization.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Character Gallery</Text>
          <Text style={styles.headerSubtitle}>
            {filteredAndSortedCharacters.length} characters
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list' : 'grid'} 
              size={24} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search characters..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Character List */}
      <ScrollView 
        style={styles.characterList}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'grid' ? (
          <View style={styles.gridContainer}>
            {filteredAndSortedCharacters.map(renderCharacterCard)}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredAndSortedCharacters.map(renderCharacterCard)}
          </View>
        )}
        
        {filteredAndSortedCharacters.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>No characters found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Modals */}
      {renderFilterModal()}
      {renderCharacterDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  
  // Character List Styles
  characterList: {
    flex: 1,
  },
  
  // Grid View Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  gridCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    margin: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gridCardLevel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gridFavoriteButton: {
    padding: 4,
  },
  gridCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  gridCharacterEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  gridCharacterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  gridCharacterRarity: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  gridStatsContainer: {
    width: '100%',
    marginBottom: 12,
  },
  statBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    width: 30,
  },
  statBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginLeft: 8,
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  gridEvolutionIndicator: {
    flexDirection: 'row',
  },
  gridEvolutionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  
  // List View Styles
  listContainer: {
    paddingHorizontal: 16,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  listCardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  characterEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  listCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  characterRarity: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  characterStats: {
    fontSize: 12,
    color: '#666',
  },
  listCardRight: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteButton: {
    padding: 8,
  },
  evolutionIndicator: {
    flexDirection: 'row',
  },
  evolutionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 1,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  // Filter Modal Styles
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  
  // Character Detail Modal Styles
  characterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  characterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  characterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  characterModalContent: {
    flex: 1,
    padding: 20,
  },
  characterModalMain: {
    alignItems: 'center',
    marginBottom: 24,
  },
  characterModalEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  characterModalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  characterModalRarity: {
    fontSize: 16,
    fontWeight: '600',
  },
  characterModalStats: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailedStatBar: {
    marginBottom: 12,
  },
  detailedStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  detailedStatBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailedStatBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginRight: 12,
  },
  detailedStatBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  detailedStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'right',
  },
  characterModalInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  // Empty State Styles
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
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CharacterGallery;