import React from 'react';
import {
  // View,
  // Text,
  // Modal,
  // TouchableOpacity,
  // ScrollView,
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
  // getCharacterDescription,
  // 
} from './utils/CollectionUtils';
import {
  // calculateCharacterStats,
  // getCharacterTier,
  // getCharacterSpecialties,
  // getCharacterPotential,
  // getCharacterRecommendations,
  // 
} from './utils/CharacterUtils';
import {
  // getAvailableEvolutionPaths,
  // calculateEvolutionPathProgress,
  // 
} from './utils/EvolutionUtils';
import {
  // characterDetailStyles
} from './components/CharacterDetailStyles';

interface CharacterDetailModalProps {
  character: EnhancedCharacter | null;
  visible: boolean;
  onClose: () => void;
  onCompare?: (character: Character) => void;
  onEvolve?: (character: Character) => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  visible,
  onClose,
  onCompare,
  onEvolve,
}) => {
  if (!character) return null;

  // const characterStats = ...; // Quick fix: commented unused variable
  // const tier = ...; // Quick fix: commented unused variable
  // const specialties = ...; // Quick fix: commented unused variable
  // const potential = ...; // Quick fix: commented unused variable
  // const recommendations = ...; // Quick fix: commented unused variable
  // const evolutionPaths = ...; // Quick fix: commented unused variable
  // const evolutionProgress = ...; // Quick fix: commented unused variable

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={characterDetailStyles.container}>
        {/* Header */}
        <View style={characterDetailStyles.header}>
          <TouchableOpacity style={characterDetailStyles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={characterDetailStyles.headerTitle}>Character Details</Text>
          <View style={characterDetailStyles.headerActions}>
            {onCompare && (
              <TouchableOpacity
                style={characterDetailStyles.actionButton}
                onPress={() => onCompare(character)}
              >
                <Ionicons name="git-compare" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
            {onEvolve && character.status !== 'evolved' && (
              <TouchableOpacity
                style={characterDetailStyles.actionButton}
                onPress={() => onEvolve(character)}
              >
                <Ionicons name="trending-up" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={characterDetailStyles.content} showsVerticalScrollIndicator={false}>
          {/* Character Overview */}
          <View style={characterDetailStyles.overviewSection}>
            <View style={characterDetailStyles.characterHeader}>
              <Text style={characterDetailStyles.characterEmoji}>{character.emoji}</Text>
              <View style={characterDetailStyles.characterInfo}>
                <Text style={characterDetailStyles.characterName}>{character.name}</Text>
                <Text style={characterDetailStyles.characterDescription}>
                  {getCharacterDescription(character)}
                </Text>
              </View>
            </View>

            <View style={characterDetailStyles.characterMeta}>
              <View style={characterDetailStyles.metaItem}>
                <Text style={characterDetailStyles.metaLabel}>Rarity</Text>
                <Text style={[characterDetailStyles.metaValue, { color: getRarityColor(character.rarity) }]}>
                  {character.rarity.toUpperCase()}
                </Text>
              </View>
              <View style={characterDetailStyles.metaItem}>
                <Text style={characterDetailStyles.metaLabel}>Class</Text>
                <View style={characterDetailStyles.classInfo}>
                  <Text style={characterDetailStyles.classIcon}>{getClassIcon(character.class)}</Text>
                  <Text style={characterDetailStyles.metaValue}>{character.class}</Text>
                </View>
              </View>
              <View style={characterDetailStyles.metaItem}>
                <Text style={characterDetailStyles.metaLabel}>Status</Text>
                <View style={characterDetailStyles.statusInfo}>
                  <View style={[characterDetailStyles.statusDot, { backgroundColor: getStatusColor(character.status) }]} />
                  <Text style={characterDetailStyles.metaValue}>{character.status}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={characterDetailStyles.section}>
            <Text style={characterDetailStyles.sectionTitle}>Statistics</Text>
            <View style={characterDetailStyles.statsGrid}>
              <View style={characterDetailStyles.statCard}>
                <Text style={characterDetailStyles.statLabel}>Level</Text>
                <Text style={characterDetailStyles.statValue}>{formatCharacterLevel(character.level)}</Text>
              </View>
              <View style={characterDetailStyles.statCard}>
                <Text style={characterDetailStyles.statLabel}>Experience</Text>
                <Text style={characterDetailStyles.statValue}>{formatExperience(character.experience)}</Text>
              </View>
              <View style={characterDetailStyles.statCard}>
                <Text style={characterDetailStyles.statLabel}>Power</Text>
                <Text style={characterDetailStyles.statValue}>{characterStats.power}</Text>
              </View>
              <View style={characterDetailStyles.statCard}>
                <Text style={characterDetailStyles.statLabel}>Speed</Text>
                <Text style={characterDetailStyles.statValue}>{characterStats.speed}</Text>
              </View>
              <View style={characterDetailStyles.statCard}>
                <Text style={characterDetailStyles.statLabel}>Endurance</Text>
                <Text style={characterDetailStyles.statValue}>{characterStats.endurance}</Text>
              </View>
              <View style={characterDetailStyles.statCard}>
                <Text style={characterDetailStyles.statLabel}>Tier</Text>
                <Text style={characterDetailStyles.statValue}>{tier}</Text>
              </View>
            </View>
          </View>

          {/* Specialties */}
          {specialties.length > 0 && (
            <View style={characterDetailStyles.section}>
              <Text style={characterDetailStyles.sectionTitle}>Specialties</Text>
              <View style={characterDetailStyles.specialtiesContainer}>
                {specialties.map((specialty, index) => (
                  <View key={index} style={characterDetailStyles.specialtyChip}>
                    <Text style={characterDetailStyles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Evolution Progress */}
          {character.status !== 'evolved' && evolutionPaths.length > 0 && (
            <View style={characterDetailStyles.section}>
              <Text style={characterDetailStyles.sectionTitle}>Evolution Progress</Text>
              <View style={characterDetailStyles.evolutionCard}>
                <View style={characterDetailStyles.evolutionHeader}>
                  <Text style={characterDetailStyles.evolutionTitle}>Next Evolution</Text>
                  <Text style={characterDetailStyles.evolutionProgress}>{Math.round(evolutionProgress)}%</Text>
                </View>
                <View style={characterDetailStyles.progressBar}>
                  <View
                    style={[
                      characterDetailStyles.progressFill,
                      { width: `${evolutionProgress}%` },
                    ]}
                  />
                </View>
                <Text style={characterDetailStyles.evolutionDescription}>
                  {evolutionPaths[0].description}
                </Text>
              </View>
            </View>
          )}

          {/* Usage History */}
          <View style={characterDetailStyles.section}>
            <Text style={characterDetailStyles.sectionTitle}>Usage History</Text>
            <View style={characterDetailStyles.usageCard}>
              <View style={characterDetailStyles.usageItem}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={characterDetailStyles.usageLabel}>Days Owned</Text>
                <Text style={characterDetailStyles.usageValue}>{character.daysOwned}</Text>
              </View>
              <View style={characterDetailStyles.usageItem}>
                <Ionicons name="fitness" size={16} color="#666" />
                <Text style={characterDetailStyles.usageLabel}>Times Used</Text>
                <Text style={characterDetailStyles.usageValue}>{character.usageCount}</Text>
              </View>
              <View style={characterDetailStyles.usageItem}>
                <Ionicons name="star" size={16} color="#666" />
                <Text style={characterDetailStyles.usageLabel}>Potential</Text>
                <Text style={characterDetailStyles.usageValue}>{potential}</Text>
              </View>
            </View>
          </View>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={characterDetailStyles.section}>
              <Text style={characterDetailStyles.sectionTitle}>Recommendations</Text>
              <View style={characterDetailStyles.recommendationsContainer}>
                {recommendations.map((recommendation, index) => (
                  <View key={index} style={characterDetailStyles.recommendationItem}>
                    <Ionicons name="bulb" size={16} color="#4ECDC4" />
                    <Text style={characterDetailStyles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}; 