// src/components/multi-gymmy-ui/team-management/CharacterSlot.tsx
// Individual team position slot with drag-and-drop support

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GymmyCharacter } from '../../../../context/types/MultiGymmyTypes';
import { TeamPosition } from './utils/TeamUtils';

const { width } = Dimensions.get('window');

interface CharacterSlotProps {
  position: TeamPosition;
  character: GymmyCharacter | null;
  onRemove: (characterId: string) => void;
  onDrop: (character: GymmyCharacter) => void;
  isHighlighted: boolean;
}

const CharacterSlot: React.FC<CharacterSlotProps> = ({
  position,
  character,
  onRemove,
  onDrop,
  isHighlighted,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleAnimation = useMemo(() => new Animated.Value(1), []);
  const borderAnimation = useMemo(() => new Animated.Value(0), []);

  // Animate on highlight
  React.useEffect(() => {
    if (isHighlighted) {
      Animated.parallel([
        Animated.timing(borderAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(borderAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isHighlighted, borderAnimation, scaleAnimation]);

  const handleRemove = () => {
    if (character) {
      onRemove(character.id);
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'leader': return '#FF6B6B';
      case 'motivator': return '#4ECDC4';
      case 'specialist': return '#45B7D1';
      case 'support': return '#96CEB4';
      case 'wildcard': return '#FFEAA7';
      default: return '#DDA0DD';
    }
  };

  const getRoleIcon = (role: string): string => {
    switch (role) {
      case 'leader': return 'shield';
      case 'motivator': return 'heart';
      case 'specialist': return 'star';
      case 'support': return 'hand-left';
      case 'wildcard': return 'diamond';
      default: return 'person';
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9370DB';
      case 'rare': return '#4169E1';
      case 'common': return '#32CD32';
      default: return '#666';
    }
  };

  const borderColor = borderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e1e5e9', '#007AFF'],
  });

  const borderWidth = borderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnimation }],
          borderColor,
          borderWidth,
        },
      ]}
    >
      {character ? (
        // Occupied slot
        <View style={styles.occupiedSlot}>
          <View style={styles.characterHeader}>
            <View style={styles.characterInfo}>
              <Text style={styles.characterEmoji}>{character.emoji}</Text>
              <View style={styles.characterDetails}>
                <Text style={styles.characterName} numberOfLines={1}>
                  {character.name}
                </Text>
                <Text style={[styles.characterRarity, { color: getRarityColor(character.rarity) }]}>
                  {character.rarity}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
              <Ionicons name="close-circle" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.characterStats}>
            <Text style={styles.levelText}>Lv.{character.level}</Text>
            <View style={styles.statBar}>
              <View 
                style={[
                  styles.statFill, 
                  { 
                    width: `${(character.current_stats.strength / 100) * 100}%`,
                    backgroundColor: getRoleColor(position.role),
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.roleIndicator}>
            <Ionicons 
              name={getRoleIcon(position.role) as any} 
              size={12} 
              color={getRoleColor(position.role)} 
            />
            <Text style={[styles.roleText, { color: getRoleColor(position.role) }]}>
              {position.name}
            </Text>
          </View>
        </View>
      ) : (
        // Empty slot
        <View style={styles.emptySlot}>
          <View style={styles.emptySlotContent}>
            <Ionicons 
              name={getRoleIcon(position.role) as any} 
              size={24} 
              color={getRoleColor(position.role)} 
            />
            <Text style={[styles.positionName, { color: getRoleColor(position.role) }]}>
              {position.name}
            </Text>
            <Text style={styles.emptyText}>Tap to add character</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 48) / 2 - 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  occupiedSlot: {
    padding: 12,
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  characterEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  characterDetails: {
    flex: 1,
  },
  characterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  characterRarity: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  removeButton: {
    padding: 4,
  },
  characterStats: {
    marginBottom: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  statBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 2,
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptySlot: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emptySlotContent: {
    alignItems: 'center',
  },
  positionName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default CharacterSlot;
