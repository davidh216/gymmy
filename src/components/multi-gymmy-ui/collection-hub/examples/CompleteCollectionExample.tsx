import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Character } from '../../../context/types/MultiGymmyTypes';
import {
  CollectionGrid,
  CharacterDetailModal,
  CharacterComparison,
  EvolutionPlanner,
} from '../index';
import {
  calculateCollectionStats,
  enhanceCharacterForDisplay,
} from '../utils/CollectionUtils';
import { mockCharacters } from './CollectionExampleData';

export const CompleteCollectionExample: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [comparisonCharacter1, setComparisonCharacter1] = useState<Character | null>(null);
  const [comparisonCharacter2, setComparisonCharacter2] = useState<Character | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showEvolutionPlanner, setShowEvolutionPlanner] = useState(false);

  const enhancedCharacters = mockCharacters.map(enhanceCharacterForDisplay);
  const collectionStats = calculateCollectionStats(mockCharacters);

  const handleCharacterPress = (character: Character) => {
    setSelectedCharacter(character);
    setShowDetailModal(true);
  };

  const handleCompare = (character: Character) => {
    if (!comparisonCharacter1) {
      setComparisonCharacter1(character);
      Alert.alert('Character Selected', 'Select a second character to compare');
    } else if (!comparisonCharacter2) {
      setComparisonCharacter2(character);
      setShowComparisonModal(true);
    }
  };

  const handleEvolve = (character: Character) => {
    setSelectedCharacter(character);
    setShowEvolutionPlanner(true);
  };

  const handleEvolutionComplete = (character: Character, evolutionPath: any) => {
    Alert.alert(
      'Evolution Complete!',
      `${character.name} has evolved through ${evolutionPath.name}!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Collection Hub</Text>
        <Text style={styles.subtitle}>Sprint 4 - All Features Integrated</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Collection Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#4ECDC4" />
              <Text style={styles.statValue}>{collectionStats.totalCharacters}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{collectionStats.uniqueCharacters}</Text>
              <Text style={styles.statLabel}>Unique</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#26DE81" />
              <Text style={styles.statValue}>{Math.round(collectionStats.completionPercentage)}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Feature Buttons */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Sprint 4 Features</Text>
          
          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => setShowDetailModal(true)}
          >
            <Ionicons name="person" size={20} color="#FFF" />
            <Text style={styles.featureButtonText}>Character Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => {
              setComparisonCharacter1(enhancedCharacters[0]);
              setComparisonCharacter2(enhancedCharacters[1]);
              setShowComparisonModal(true);
            }}
          >
            <Ionicons name="git-compare" size={20} color="#FFF" />
            <Text style={styles.featureButtonText}>Character Comparison</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => {
              setSelectedCharacter(enhancedCharacters[0]);
              setShowEvolutionPlanner(true);
            }}
          >
            <Ionicons name="trending-up" size={20} color="#FFF" />
            <Text style={styles.featureButtonText}>Evolution Planning</Text>
          </TouchableOpacity>
        </View>

        {/* Collection Grid */}
        <View style={styles.collectionSection}>
          <Text style={styles.sectionTitle}>Your Characters</Text>
          <CollectionGrid
            characters={enhancedCharacters}
            filters={{ search: '', rarity: [], class: [], status: [], level: { min: 0, max: 100 }, owned: false, evolved: false }}
            sortOption={{ key: 'level', label: 'Level', direction: 'desc' }}
            viewMode={{ type: 'grid', columns: 2, showDetails: true }}
            onCharacterPress={handleCharacterPress}
            onRefresh={() => Alert.alert('Refreshed', 'Collection updated!')}
            refreshing={false}
            onViewModeChange={() => {}}
            onSortChange={() => {}}
          />
        </View>
      </ScrollView>

      {/* Character Detail Modal */}
      <CharacterDetailModal
        character={selectedCharacter}
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onCompare={handleCompare}
        onEvolve={handleEvolve}
      />

      {/* Character Comparison Modal */}
      <CharacterComparison
        character1={comparisonCharacter1}
        character2={comparisonCharacter2}
        visible={showComparisonModal}
        onClose={() => {
          setShowComparisonModal(false);
          setComparisonCharacter1(null);
          setComparisonCharacter2(null);
        }}
        onSelectCharacter={(slot) => {
          if (slot === 1) {
            setComparisonCharacter1(selectedCharacter);
          } else {
            setComparisonCharacter2(selectedCharacter);
          }
        }}
      />

      {/* Evolution Planner Modal */}
      {selectedCharacter && (
        <EvolutionPlanner
          character={selectedCharacter}
          onClose={() => setShowEvolutionPlanner(false)}
          onEvolve={handleEvolutionComplete}
        />
      )}
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
  statsGrid: {
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
  statCard: {
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
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  collectionSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
}); 