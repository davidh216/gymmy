// src/components/multi-gymmy-ui/team-management/components/TeamBuilderRenders.tsx
// Render components for TeamBuilder

import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // ScrollView,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // GymmyCharacter,
  // GymmyTeam
} from '../../../../../context/types/MultiGymmyTypes';
import {
  // TeamFormation,
  // TeamPosition
} from '../utils/TeamUtils';
import {
  // getRarityColor
} from '../utils/ComponentUtils';
import CharacterSlot from '../CharacterSlot';

interface TeamPositionsProps {
  formation: TeamFormation;
  currentTeam: GymmyTeam;
  onCharacterDrop: (character: GymmyCharacter, position: TeamPosition) => void;
  onCharacterRemove: (position: TeamPosition) => void;
}

export const TeamPositions: React.FC<TeamPositionsProps> = ({
  formation,
  currentTeam,
  onCharacterDrop,
  onCharacterRemove,
}) => (
  <View style={styles.positionsContainer}>
    <Text style={styles.sectionTitle}>Team Formation</Text>
    <View style={styles.positionsGrid}>
      {formation.positions.map((position) => {
        // const character = ...; // Quick fix: commented unused variable
        return (
          <CharacterSlot
            key={position.id}
            position={position}
            character={character || null}
            onCharacterDrop={(char) => onCharacterDrop(char, position)}
            onCharacterRemove={() => onCharacterRemove(position)}
          />
        );
      })}
    </View>
  </View>
);

interface AvailableCharactersProps {
  characters: GymmyCharacter[];
  onCharacterSelect: (character: GymmyCharacter) => void;
  selectedCharacter?: GymmyCharacter | null;
}

export const AvailableCharacters: React.FC<AvailableCharactersProps> = ({
  characters,
  onCharacterSelect,
  selectedCharacter,
}) => (
  <View style={styles.charactersContainer}>
    <Text style={styles.sectionTitle}>Available Characters</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.charactersList}>
        {characters.map((character) => (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.characterItem,
              selectedCharacter?.id === character.id && styles.selectedCharacter,
            ]}
            onPress={() => onCharacterSelect(character)}
          >
            <Text style={styles.characterEmoji}>{character.emoji}</Text>
            <Text style={styles.characterName}>{character.name}</Text>
            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(character.rarity) }]}>
              <Text style={styles.rarityText}>{character.rarity}</Text>
            </View>
            <Text style={styles.characterLevel}>Lv.{character.level}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </View>
);

interface FormationSelectorProps {
  selectedFormation: string;
  formations: TeamFormation[];
  onFormationSelect: (formation: string) => void;
  onShowFormationModal: () => void;
}

export const FormationSelector: React.FC<FormationSelectorProps> = ({
  selectedFormation,
  formations,
  onFormationSelect,
  onShowFormationModal,
}) => {
  // const currentFormation = ...; // Quick fix: commented unused variable
  
  return (
    <View style={styles.formationSelector}>
      <Text style={styles.sectionTitle}>Formation</Text>
      <TouchableOpacity style={styles.formationButton} onPress={onShowFormationModal}>
        <View style={styles.formationInfo}>
          <Text style={styles.formationName}>{currentFormation?.name || 'Select Formation'}</Text>
          <Text style={styles.formationDescription}>
            {currentFormation?.description || 'Choose a team formation'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );
};

interface TeamNameInputProps {
  teamName: string;
  onNameChange: (name: string) => void;
  onShowNameModal: () => void;
}

export const TeamNameInput: React.FC<TeamNameInputProps> = ({
  teamName,
  onNameChange,
  onShowNameModal,
}) => (
  <View style={styles.nameContainer}>
    <Text style={styles.sectionTitle}>Team Name</Text>
    <TouchableOpacity style={styles.nameButton} onPress={onShowNameModal}>
      <Text style={styles.teamName}>{teamName || 'Enter team name'}</Text>
      <Ionicons name="edit" size={16} color="#8E8E93" />
    </TouchableOpacity>
  </View>
);

interface TeamHeaderProps {
  onClose: () => void;
  onSave: () => void;
  canSave: boolean;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({
  onClose,
  onSave,
  canSave,
}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onClose} style={styles.headerButton}>
      <Ionicons name="close" size={24} color="#000" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Team Builder</Text>
    <TouchableOpacity 
      onPress={onSave} 
      style={[styles.headerButton, !canSave && styles.disabledButton]}
      disabled={!canSave}
    >
      <Text style={[styles.saveText, !canSave && styles.disabledText]}>Save</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  positionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  positionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  charactersContainer: {
    marginBottom: 20,
  },
  charactersList: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  characterItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    minWidth: 80,
  },
  selectedCharacter: {
    backgroundColor: '#E5F9FF',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  characterEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  characterName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  rarityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  characterLevel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  formationSelector: {
    marginBottom: 20,
  },
  formationButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  formationInfo: {
    flex: 1,
  },
  formationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  formationDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  nameContainer: {
    marginBottom: 20,
  },
  nameButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#8E8E93',
  },
});
