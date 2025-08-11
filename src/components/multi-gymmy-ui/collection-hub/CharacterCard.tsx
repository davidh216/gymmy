import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Character } from '../../context/types/MultiGymmyTypes';
import { EnhancedCharacter, CollectionViewMode } from './utils/CollectionUtils';
import { GridCardView } from './components/GridCardView';
import {
  ListCardView,
  CompactCardView,
} from './components/CharacterCardViews';

interface CharacterCardProps {
  character: EnhancedCharacter;
  viewMode: CollectionViewMode;
  isSelected?: boolean;
  onPress: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  viewMode,
  isSelected = false,
  onPress,
}) => {
  const renderCard = () => {
    switch (viewMode.type) {
      case 'grid':
        return <GridCardView character={character} isSelected={isSelected} />;
      case 'list':
        return <ListCardView character={character} isSelected={isSelected} />;
      case 'compact':
        return <CompactCardView character={character} isSelected={isSelected} />;
      default:
        return <GridCardView character={character} isSelected={isSelected} />;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        viewMode.type === 'list' && styles.listContainer,
        viewMode.type === 'compact' && styles.compactContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {renderCard()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: 4,
  },
  listContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  compactContainer: {
    marginHorizontal: 8,
    marginVertical: 2,
  },
}); 