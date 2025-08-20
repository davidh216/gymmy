import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet
} from 'react-native';
import {
  // EnhancedCharacter
} from '../utils/CollectionUtils';
import {
  // getRarityColor,
  // getClassIcon,
  // getStatusColor,
  // formatCharacterLevel,
  // formatExperience,
  // getCharacterDescription,
  // 
} from '../utils/CollectionUtils';
import {
  // calculateCharacterStats,
  // getCharacterTier,
  // getCharacterSpecialties,
  // 
} from '../utils/CharacterUtils';

interface CharacterCardViewProps {
  character: EnhancedCharacter;
  isSelected?: boolean;
}



export const ListCardView: React.FC<CharacterCardViewProps> = ({ character, isSelected = false }) => {
  // const characterStats = ...; // Quick fix: commented unused variable
  // const tier = ...; // Quick fix: commented unused variable
  // const specialties = ...; // Quick fix: commented unused variable

  return (
    <View style={[styles.listCard, isSelected && styles.selectedCard]}>
      <View style={styles.listHeader}>
        <View style={styles.characterInfo}>
          <Text style={styles.characterEmojiLarge}>{character.emoji}</Text>
          <View style={styles.characterDetails}>
            <Text style={styles.characterNameLarge}>{character.name}</Text>
            <Text style={styles.characterDescription} numberOfLines={2}>
              {getCharacterDescription(character)}
            </Text>
          </View>
        </View>
        <View style={styles.listStats}>
          <Text style={styles.characterLevelLarge}>
            {formatCharacterLevel(character.level)}
          </Text>
          <Text style={styles.experienceText}>
            {formatExperience(character.experience)} XP
          </Text>
        </View>
      </View>

      <View style={styles.listContent}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Power</Text>
            <Text style={styles.statValue}>{characterStats.power}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Speed</Text>
            <Text style={styles.statValue}>{characterStats.speed}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Endurance</Text>
            <Text style={styles.statValue}>{characterStats.endurance}</Text>
          </View>
        </View>

        <View style={styles.specialtiesContainer}>
          {specialties.slice(0, 2).map((specialty, index) => (
            <View key={index} style={styles.specialtyChip}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.listFooter}>
        <View style={styles.footerLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(character.status) }]} />
          <Text style={styles.statusText}>{character.status}</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.tierText}>Tier {tier}</Text>
          {character.isNew && (
            <View style={styles.newBadgeSmall}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export const CompactCardView: React.FC<CharacterCardViewProps> = ({ character, isSelected = false }) => {
  // const tier = ...; // Quick fix: commented unused variable

  return (
    <View style={[styles.compactCard, isSelected && styles.selectedCard]}>
      <View style={styles.compactContent}>
        <Text style={styles.characterEmojiCompact}>{character.emoji}</Text>
        <View style={styles.compactInfo}>
          <Text style={styles.characterNameCompact} numberOfLines={1}>
            {character.name}
          </Text>
          <Text style={styles.characterLevelCompact}>
            {formatCharacterLevel(character.level)}
          </Text>
        </View>
        <View style={styles.compactStats}>
          <Text style={styles.tierTextCompact}>Tier {tier}</Text>
          <View style={[styles.statusIndicatorSmall, { backgroundColor: getStatusColor(character.status) }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedCard: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  


  // List Mode Styles
  listCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  characterEmojiLarge: {
    fontSize: 32,
    marginRight: 12,
  },
  characterNameLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  characterDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  listStats: {
    alignItems: 'flex-end',
  },
  characterLevelLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  experienceText: {
    fontSize: 12,
    color: '#666',
  },
  listContent: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 12,
    color: '#666',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newBadgeSmall: {
    backgroundColor: '#FF1493',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // Compact Mode Styles
  compactCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterEmojiCompact: {
    fontSize: 20,
    marginRight: 8,
  },
  compactInfo: {
    flex: 1,
  },
  characterNameCompact: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  characterLevelCompact: {
    fontSize: 12,
    color: '#666',
  },
  compactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierTextCompact: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  statusIndicatorSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
}); 