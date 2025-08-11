import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EnhancedCharacter } from '../utils/CollectionUtils';
import {
  getRarityColor,
  getClassIcon,
  getStatusColor,
  formatCharacterLevel,
} from '../utils/CollectionUtils';
import {
  calculateCharacterStats,
  getCharacterTier,
} from '../utils/CharacterUtils';

interface GridCardViewProps {
  character: EnhancedCharacter;
  isSelected?: boolean;
}

export const GridCardView: React.FC<GridCardViewProps> = ({ character, isSelected = false }) => {
  const characterStats = calculateCharacterStats(character);
  const tier = getCharacterTier(character);

  return (
    <View style={[styles.gridCard, isSelected && styles.selectedCard]}>
      <View style={styles.gridHeader}>
        <View style={styles.characterInfo}>
          <Text style={styles.characterEmoji}>{character.emoji}</Text>
          <View style={styles.characterDetails}>
            <Text style={styles.characterName} numberOfLines={1}>
              {character.name}
            </Text>
            <Text style={styles.characterLevel}>
              {formatCharacterLevel(character.level)}
            </Text>
          </View>
        </View>
        <View style={styles.rarityBadge}>
          <Text style={[styles.rarityText, { color: getRarityColor(character.rarity) }]}>
            {character.rarity.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.gridContent}>
        <View style={styles.classInfo}>
          <Text style={styles.classIcon}>{getClassIcon(character.class)}</Text>
          <Text style={styles.className}>{character.class}</Text>
        </View>

        <View style={styles.statsPreview}>
          <Text style={styles.statLabel}>Power</Text>
          <Text style={styles.statValue}>{characterStats.power}</Text>
        </View>

        {character.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>

      <View style={styles.gridFooter}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(character.status) }]} />
        <Text style={styles.tierText}>Tier {tier}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedCard: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  gridCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 180,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  characterEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  characterDetails: {
    flex: 1,
  },
  characterName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  characterLevel: {
    fontSize: 12,
    color: '#666',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  gridContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  className: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  statsPreview: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  newBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF1493',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFF',
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
}); 