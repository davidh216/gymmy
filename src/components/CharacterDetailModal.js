// ==============================================================================
// PART 4: CharacterDetailsModal.js - Detailed Character View
// ==============================================================================

import React from 'react';
import {
  // View,
  // Text,
  // Modal,
  // TouchableOpacity,
  // ScrollView,
  // StyleSheet,
  // 
} from 'react-native';

const CharacterDetailsModal = ({ visible, character, onClose, onSetActive, isActive }) => {
  if (!character) return null;
    
  const getConditionColor = (value) => {
    if (value >= 70) return '#4CAF50';
    if (value >= 40) return '#FFC107';
    return '#F44336';
  };
    
  const getConditionText = (value) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    if (value >= 20) return 'Poor';
    return 'Critical';
  };
    
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.detailsOverlay}>
        <View style={styles.detailsContainer}>
          <ScrollView>
            {/* Header */}
            <View style={[styles.detailsHeader, { backgroundColor: character.rarity_color }]}>
              <Text style={styles.detailsRarity}>{character.rarity.toUpperCase()}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
              
            {/* Character Info */}
            <View style={styles.detailsContent}>
              <Text style={styles.detailsArtwork}>{character.artwork}</Text>
              <Text style={styles.detailsName}>{character.name}</Text>
              <Text style={styles.detailsDescription}>{character.description}</Text>
                
              {/* Level and Experience */}
              <View style={styles.levelSection}>
                <Text style={styles.levelText}>Level {character.level}</Text>
                <Text style={styles.expText}>EXP: {character.experience}</Text>
              </View>
                
              {/* Current Stats */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>CURRENT STATS</Text>
                <View style={styles.statsGrid}>
                  {Object.entries(character.current_stats).map(([stat, value]) => (
                    <View key={stat} style={styles.statRow}>
                      <Text style={styles.statName}>{stat.toUpperCase()}</Text>
                      <View style={styles.statBar}>
                        <View style={[
                          styles.statFill,
                          { width: `${value}%`, backgroundColor: character.rarity_color },
                        ]} />
                      </View>
                      <Text style={styles.statNumber}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
                
              {/* Character Condition (Tamagotchi-style) */}
              <View style={styles.conditionSection}>
                <Text style={styles.sectionTitle}>CHARACTER CONDITION</Text>
                {Object.entries(character.condition).map(([condition, value]) => (
                  <View key={condition} style={styles.conditionRow}>
                    <Text style={styles.conditionName}>{condition.toUpperCase()}</Text>
                    <View style={styles.conditionBar}>
                      <View style={[
                        styles.conditionFill,
                        { width: `${value}%`, backgroundColor: getConditionColor(value) },
                      ]} />
                    </View>
                    <Text style={[styles.conditionStatus, { color: getConditionColor(value) }]}>
                      {getConditionText(value)}
                    </Text>
                  </View>
                ))}
              </View>
                
              {/* Special Ability */}
              <View style={styles.abilitySection}>
                <Text style={styles.sectionTitle}>SPECIAL ABILITY</Text>
                <View style={[styles.abilityCard, { borderColor: character.rarity_color }]}>
                  <Text style={styles.abilityName}>{character.special_ability.split(':')[0]}</Text>
                  <Text style={styles.abilityDescription}>{character.special_ability.split(':')[1]}</Text>
                </View>
              </View>
                
              {/* Personality */}
              <View style={styles.personalitySection}>
                <Text style={styles.sectionTitle}>PERSONALITY</Text>
                <View style={styles.personalityGrid}>
                  {Object.entries(character.personality).map(([trait, value]) => (
                    <View key={trait} style={styles.personalityItem}>
                      <Text style={styles.personalityTrait}>{trait.replace('_', ' ').toUpperCase()}</Text>
                      <Text style={styles.personalityValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
                
              {/* Action Buttons */}
              <View style={styles.actionSection}>
                {!isActive && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: character.rarity_color }]}
                    onPress={() => onSetActive(character.id)}
                  >
                    <Text style={styles.actionButtonText}>SET AS ACTIVE</Text>
                  </TouchableOpacity>
                )}
                {isActive && (
                  <View style={styles.activeIndicator}>
                    <Text style={styles.activeText}>✓ CURRENTLY ACTIVE</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  detailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 500,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  detailsRarity: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsContent: {
    padding: 20,
  },
  detailsArtwork: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  levelSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  expText: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statsGrid: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statName: {
    fontSize: 14,
    fontWeight: '600',
    width: 60,
  },
  statBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  conditionSection: {
    marginBottom: 20,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 12,
    fontWeight: '600',
    width: 80,
  },
  conditionBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  conditionFill: {
    height: '100%',
    borderRadius: 3,
  },
  conditionStatus: {
    fontSize: 12,
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  abilitySection: {
    marginBottom: 20,
  },
  abilityCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  abilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  abilityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  personalitySection: {
    marginBottom: 20,
  },
  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  personalityItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
  },
  personalityTrait: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  personalityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionSection: {
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CharacterDetailsModal;