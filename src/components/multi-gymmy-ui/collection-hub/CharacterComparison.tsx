import React, { useState } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // Modal,
  // TouchableOpacity,
  // ScrollView,
  // Dimensions,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // Character
} from '../../context/types/MultiGymmyTypes';
import {
  // EnhancedCharacter
} from './utils/CollectionUtils';
import {
  // getRarityColor,
  // getClassIcon,
  // getStatusColor,
  // formatCharacterLevel,
  // formatExperience,
  // 
} from './utils/CollectionUtils';
import {
  // calculateCharacterStats,
  // getCharacterTier,
  // getCharacterSpecialties,
  // compareCharacters,
  // generateComparisonRecommendations,
  // 
} from './utils/CharacterUtils';

interface CharacterComparisonProps {
  character1: EnhancedCharacter | null;
  character2: EnhancedCharacter | null;
  visible: boolean;
  onClose: () => void;
  onSelectCharacter?: (slot: 1 | 2) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const CharacterComparison: React.FC<CharacterComparisonProps> = ({
  character1,
  character2,
  visible,
  onClose,
  onSelectCharacter,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<1 | 2 | null>(null);

  // const character1Stats = ...; // Quick fix: commented unused variable
  // const character2Stats = ...; // Quick fix: commented unused variable
  // const comparison = ...; // Quick fix: commented unused variable
  // const recommendations = ...; // Quick fix: commented unused variable

  const renderCharacterCard = (character: EnhancedCharacter | null, slot: 1 | 2) => {
    if (!character) {
      return (
        <TouchableOpacity
          style={styles.emptySlot}
          onPress={() => {
            setSelectedSlot(slot);
            onSelectCharacter?.(slot);
          }}
        >
          <Ionicons name="add-circle-outline" size={48} color="#CCC" />
          <Text style={styles.emptySlotText}>Select Character</Text>
        </TouchableOpacity>
      );
    }

    // const stats = ...; // Quick fix: commented unused variable
    // const tier = ...; // Quick fix: commented unused variable
    // const specialties = ...; // Quick fix: commented unused variable

    return (
      <View style={styles.characterCard}>
        <View style={styles.characterHeader}>
          <Text style={styles.characterEmoji}>{character.emoji}</Text>
          <View style={styles.characterInfo}>
            <Text style={styles.characterName} numberOfLines={1}>
              {character.name}
            </Text>
            <Text style={styles.characterLevel}>
              {formatCharacterLevel(character.level)}
            </Text>
          </View>
          <View style={styles.characterMeta}>
            <Text style={[styles.rarityText, { color: getRarityColor(character.rarity) }]}>
              {character.rarity.toUpperCase()}
            </Text>
            <Text style={styles.classText}>{character.class}</Text>
          </View>
        </View>

        {stats && (
          <View style={styles.statsSection}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Power</Text>
              <Text style={styles.statValue}>{stats.power}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Speed</Text>
              <Text style={styles.statValue}>{stats.speed}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Endurance</Text>
              <Text style={styles.statValue}>{stats.endurance}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tier</Text>
              <Text style={styles.statValue}>{tier}</Text>
            </View>
          </View>
        )}

        {specialties.length > 0 && (
          <View style={styles.specialtiesSection}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.specialtiesContainer}>
              {specialties.slice(0, 2).map((specialty, index) => (
                <View key={index} style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderComparisonSection = () => {
    if (!character1 || !character2 || !comparison) return null;

    return (
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Comparison</Text>
        
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Power Difference</Text>
            <View style={styles.comparisonValue}>
              <Text style={[
                styles.comparisonText,
                { color: comparison.powerDifference > 0 ? '#26DE81' : '#FF6B6B' }
              ]}>
                {comparison.powerDifference > 0 ? '+' : ''}{comparison.powerDifference}
              </Text>
            </View>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Speed Difference</Text>
            <View style={styles.comparisonValue}>
              <Text style={[
                styles.comparisonText,
                { color: comparison.speedDifference > 0 ? '#26DE81' : '#FF6B6B' }
              ]}>
                {comparison.speedDifference > 0 ? '+' : ''}{comparison.speedDifference}
              </Text>
            </View>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Endurance Difference</Text>
            <View style={styles.comparisonValue}>
              <Text style={[
                styles.comparisonText,
                { color: comparison.enduranceDifference > 0 ? '#26DE81' : '#FF6B6B' }
              ]}>
                {comparison.enduranceDifference > 0 ? '+' : ''}{comparison.enduranceDifference}
              </Text>
            </View>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Overall Winner</Text>
            <View style={styles.comparisonValue}>
              <Text style={[
                styles.comparisonText,
                { color: '#4ECDC4', fontWeight: 'bold' }
              ]}>
                {comparison.winner}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRecommendationsSection = () => {
    if (recommendations.length === 0) return null;

    return (
      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.recommendationsCard}>
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="bulb" size={16} color="#4ECDC4" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Character Comparison</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedSlot(1);
                onSelectCharacter?.(1);
              }}
            >
              <Ionicons name="swap-horizontal" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Character Cards */}
          <View style={styles.charactersSection}>
            <View style={styles.characterSlot}>
              {renderCharacterCard(character1, 1)}
            </View>
            
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            
            <View style={styles.characterSlot}>
              {renderCharacterCard(character2, 2)}
            </View>
          </View>

          {/* Comparison Section */}
          {renderComparisonSection()}

          {/* Recommendations Section */}
          {renderRecommendationsSection()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  charactersSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  characterSlot: {
    flex: 1,
  },
  emptySlot: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptySlotText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  characterCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  characterHeader: {
    marginBottom: 16,
  },
  characterEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  characterInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  characterLevel: {
    fontSize: 14,
    color: '#666',
  },
  characterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  classText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  statsSection: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  specialtiesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  specialtyChip: {
    backgroundColor: '#E8F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  comparisonSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  comparisonCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#666',
  },
  comparisonValue: {
    alignItems: 'flex-end',
  },
  comparisonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  recommendationsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
    marginLeft: 8,
  },
}); 