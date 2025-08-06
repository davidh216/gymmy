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
  VirtualizedList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const CharacterCollectionScreen = ({ navigation }) => {
  const { characters, setActiveCharacter } = useApp();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
    
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setShowDetails(true);
  };
    
  const handleSetActive = (characterId) => {
    setActiveCharacter(characterId);
    setShowDetails(false);
    Alert.alert('Active Character Set!', 'Your character is now ready for battle!');
  };
    
  // Prepare data for VirtualizedList
  const sections = useMemo(() => {
    const sectionsData = [];
      
    // Group characters by rarity
    const groupedCharacters = characters.collection.reduce((acc, char) => {
      if (!acc[char.rarity]) acc[char.rarity] = [];
      acc[char.rarity].push(char);
      return acc;
    }, {});
      
    // Add sections for each rarity that has characters
    ['legendary', 'epic', 'rare', 'common'].forEach(rarity => {
      const chars = groupedCharacters[rarity] || [];
      if (chars.length > 0) {
        sectionsData.push({
          type: 'rarity',
          id: rarity,
          rarity,
          data: chars,
        });
      }
    });
      
    return sectionsData;
  }, [characters.collection]);
    
  // VirtualizedList render functions
  const getItem = (data, index) => data[index];
  const getItemCount = (data) => data.length;

  const renderCharacterCard = (character) => (
    <TouchableOpacity
      key={character.instance_id}
      style={[
        styles.characterCard,
        { borderColor: character.rarity_color },
        characters.active_character === character.instance_id && styles.activeCharacterCard,
      ]}
      onPress={() => handleCharacterSelect(character)}
    >
      <Text style={styles.characterArtwork}>{character.artwork}</Text>
      <Text style={styles.characterCardName}>{character.name}</Text>
      <Text style={styles.characterLevel}>Lv.{character.level}</Text>
        
      {characters.active_character === character.instance_id && (
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

  const renderItem = ({ item, section }) => {
    if (section.type === 'rarity') {
      return (
        <View style={styles.raritySection}>
          <Text style={[
            styles.rarityHeader,
            { color: section.data[0]?.rarity_color || '#fff' },
          ]}>
            {section.rarity.toUpperCase()} ({section.data.length})
          </Text>
            
          <View style={styles.characterGrid}>
            {section.data.map(renderCharacterCard)}
          </View>
        </View>
      );
    }
    return null;
  };

  const renderHeader = () => (
    <View style={styles.collectionHeader}>
      <Text style={styles.collectionTitle}>MY CHAMPIONS</Text>
      <Text style={styles.collectionCount}>
        {characters.collection.length} Characters Collected
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
    
  return (
    <View style={styles.container}>
      {characters.collection.length === 0 ? (
        renderEmptyState()
      ) : (
        <VirtualizedList
          data={sections}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          getItemCount={getItemCount}
          getItem={getItem}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          style={styles.collectionContent}
          contentContainerStyle={styles.collectionContentContainer}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 250, // Approximate height for each rarity section
            offset: 250 * index,
            index,
          })}
        />
      )}
        
      {/* Character Details Modal */}
      <CharacterDetailsModal
        visible={showDetails}
        character={selectedCharacter}
        onClose={() => setShowDetails(false)}
        onSetActive={handleSetActive}
        isActive={selectedCharacter?.instance_id === characters.active_character}
      />
    </View>
  );
};

// Character Details Modal Component
const CharacterDetailsModal = ({ visible, character, onClose, onSetActive, isActive }) => {
  if (!visible || !character) return null;

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
            <Text style={styles.characterDescription}>{character.description}</Text>
            
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>STATS</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Level</Text>
                  <Text style={styles.statValue}>{character.level}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Energy</Text>
                  <Text style={styles.statValue}>{character.condition.energy}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Mood</Text>
                  <Text style={styles.statValue}>{character.condition.mood}%</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.skillsSection}>
              <Text style={styles.skillsTitle}>SKILLS</Text>
              {character.skills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillDescription}>{skill.description}</Text>
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
    gap: 10,
  },
  characterCard: {
    width: '48%',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
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
});

export default CharacterCollectionScreen;
  