// ==============================================================================
// PART 3: CharacterCollectionScreen.js - View All Characters
// ==============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useApp } from '../context';

const CharacterCollectionScreen = ({ navigation }) => {
  const { characters, setActiveCharacter } = useApp();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(null);

  // Error recovery function
  const handleError = (error, context) => {
    console.error(`Error in CharacterCollectionScreen ${context}:`, error);
    setError({ message: `Error ${context}`, details: error.message });
  };
    
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setShowDetails(true);
  };
    
  const handleSetActive = (characterId) => {
    setActiveCharacter(characterId);
    setShowDetails(false);
    Alert.alert('Active Character Set!', 'Your character is now ready for battle!');
  };
    
  // Prepare data for FlatList - group characters by rarity for proper display
  const sectionsData = useMemo(() => {
    const sections = [];
    
    // Check if characters collection exists
    if (!characters?.collection || !Array.isArray(characters.collection)) {
      return sections;
    }
      
    // Group characters by rarity
    const groupedCharacters = characters.collection.reduce((acc, char) => {
      if (!acc[char.rarity]) acc[char.rarity] = [];
      acc[char.rarity].push(char);
      return acc;
    }, {});
      
    // Create sections with rarity header and character grid
    ['legendary', 'epic', 'rare', 'common'].forEach(rarity => {
      const chars = groupedCharacters[rarity] || [];
      if (chars.length > 0) {
        sections.push({
          type: 'raritySection',
          id: `section_${rarity}`,
          rarity,
          characters: chars,
          rarity_color: chars[0]?.rarity_color || '#fff',
        });
      }
    });
      
    return sections;
  }, [characters?.collection]);
  const renderCharacterCard = (character) => {
    if (!character || !character.instance_id) {
      console.warn('Invalid character data:', character);
      return null;
    }

    return (
      <TouchableOpacity
        key={character.instance_id}
        style={[
          styles.characterCard,
          { borderColor: character.rarity_color || '#666' },
          characters?.active_character === character.instance_id && styles.activeCharacterCard,
        ]}
        onPress={() => handleCharacterSelect(character)}
      >
        <Text style={styles.characterArtwork}>{character.artwork || '❓'}</Text>
        <Text style={styles.characterCardName}>{character.name || 'Unknown'}</Text>
        <Text style={styles.characterLevel}>Lv.{character.level || 1}</Text>
          
        {characters?.active_character === character.instance_id && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        )}
          
        {/* Condition indicators */}
        {character.condition && (
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render function for FlatList items
  const renderItem = ({ item }) => {
    try {
      if (!item || !item.type) {
        console.warn('Invalid item in renderItem:', item);
        return null;
      }

      if (item.type === 'raritySection') {
        const characters = Array.isArray(item.characters) ? item.characters : [];
        
        return (
          <View style={styles.raritySection}>
            <Text style={[
              styles.rarityHeader,
              { color: item.rarity_color || '#fff' },
            ]}>
              {(item.rarity || 'unknown').toUpperCase()} ({characters.length})
            </Text>
            
            <View style={styles.characterGrid}>
              {characters.map((character, index) => {
                // Ensure each character has a unique key
                const key = character?.instance_id || `char-${item.rarity}-${index}`;
                return renderCharacterCard({ ...character, key });
              }).filter(Boolean)}
            </View>
          </View>
        );
      }
      
      return null;
    } catch (error) {
      console.error('Error rendering item:', error, item);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error displaying characters</Text>
        </View>
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.collectionHeader}>
      <Text style={styles.collectionTitle}>MY CHAMPIONS</Text>
      <Text style={styles.collectionCount}>
        {characters?.collection?.length || 0} Characters Collected
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🎭</Text>
      <Text style={styles.emptyTitle}>No Characters Yet</Text>
      <Text style={styles.emptySubtitle}>Complete workouts to earn gems and summon your first ally!</Text>
      <TouchableOpacity
        style={styles.summonButton}
        onPress={() => navigation.navigate('GachaScreen')}
      >
        <Text style={styles.summonButtonText}>START SUMMONING</Text>
      </TouchableOpacity>
    </View>
  );
    
  // If there's an error, show error screen
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity
            style={styles.summonButton}
            onPress={() => setError(null)}
          >
            <Text style={styles.summonButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  try {
    return (
      <View style={styles.container}>
        {!characters?.collection || characters.collection.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={sectionsData}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id || index.toString()}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            style={styles.collectionContent}
            contentContainerStyle={styles.collectionContentContainer}
            onError={(error) => handleError(error, 'rendering FlatList')}
          />
        )}
          
        {/* Character Details Modal */}
        <CharacterDetailsModal
          visible={showDetails}
          character={selectedCharacter}
          onClose={() => setShowDetails(false)}
          onSetActive={handleSetActive}
          isActive={selectedCharacter?.instance_id === characters?.active_character}
        />
      </View>
    );
  } catch (error) {
    handleError(error, 'rendering component');
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load character collection</Text>
          <TouchableOpacity
            style={styles.summonButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.summonButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
};

// Character Details Modal Component
const CharacterDetailsModal = ({ visible, character, onClose, onSetActive, isActive }) => {
  if (!visible || !character) return null;

  try {

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{character.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.characterDetails}>
            <Text style={styles.characterArtwork}>{character.artwork}</Text>
            <Text style={[styles.characterRarity, { color: character.rarity_color }]}>
              {character.rarity.toUpperCase()}
            </Text>
            <Text style={styles.characterDescription}>{character.description || 'No description available'}</Text>
            
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>STATS</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Level</Text>
                  <Text style={styles.statValue}>{character.level || 1}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Energy</Text>
                  <Text style={styles.statValue}>{character.condition?.energy || 100}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Mood</Text>
                  <Text style={styles.statValue}>{character.condition?.mood || 80}%</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.skillsSection}>
              <Text style={styles.skillsTitle}>SPECIAL ABILITY</Text>
              <View style={styles.skillItem}>
                <Text style={styles.skillName}>{character.special_ability || 'No special ability'}</Text>
              </View>
              
              <Text style={styles.skillsTitle}>BASE STATS</Text>
              {Object.entries(character.base_stats || {}).map(([stat, value]) => (
                <View key={stat} style={styles.skillItem}>
                  <Text style={styles.skillName}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</Text>
                  <Text style={styles.skillDescription}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {!isActive && (
            <TouchableOpacity style={styles.setActiveButton} onPress={() => onSetActive(character.instance_id)}>
              <Text style={styles.setActiveButtonText}>SET AS ACTIVE</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
  } catch (error) {
    console.error('Error in CharacterDetailsModal:', error);
    return (
      <Modal visible={visible} transparent={true} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading character details</Text>
            <TouchableOpacity style={styles.summonButton} onPress={onClose}>
              <Text style={styles.summonButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  collectionContent: {
    padding: 20,
  },
  collectionContentContainer: {
    paddingBottom: 100, // Add padding at the bottom for the modal
  },
  collectionHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  collectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  collectionCount: {
    fontSize: 16,
    color: '#ccc',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  summonButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
  },
  summonButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  raritySection: {
    marginBottom: 30,
  },
  rarityHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  characterCard: {
    width: '48%',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
  },
  activeCharacterCard: {
    borderColor: '#4CAF50',
  },
  characterArtwork: {
    fontSize: 32,
    marginBottom: 10,
  },
  characterCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  characterLevel: {
    fontSize: 12,
    color: '#ccc',
  },
  activeBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  conditionBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  characterDetails: {
    alignItems: 'center',
  },
  characterRarity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  characterDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsSection: {
    width: '100%',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  skillsSection: {
    width: '100%',
    marginBottom: 20,
  },
  skillsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  skillItem: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  skillDescription: {
    fontSize: 12,
    color: '#ccc',
  },
  setActiveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  setActiveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CharacterCollectionScreen;
  