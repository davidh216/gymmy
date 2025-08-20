// ==============================================================================
// PART 2: PullResultsModal.js - Exciting Results Display
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  // View,
  // Text,
  // Modal,
  // TouchableOpacity,
  // Animated,
  // StyleSheet,
  // 
} from 'react-native';

const PullResultsModal = ({ visible, results, onClose, rarityGradients }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealAnimation] = useState(new Animated.Value(0));
    
  useEffect(() => {
    if (visible && results.length > 0) {
      setCurrentIndex(0);
      // Animate reveal
      Animated.timing(revealAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, results, revealAnimation]);
    
  const nextResult = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
      revealAnimation.setValue(0);
      Animated.timing(revealAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else {
      onClose();
    }
  };
    
  if (!visible || results.length === 0) return null;
    
  // const currentResult = ...; // Quick fix: commented unused variable
  // const isLegendary = ...; // Quick fix: commented unused variable
  // const isEpic = ...; // Quick fix: commented unused variable
    
  const cardScale = revealAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
    
  const cardOpacity = revealAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
    
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.resultsOverlay}>
        <View style={styles.resultsContainer}>
          {/* Rarity announcement */}
          <Text style={[
            styles.rarityAnnouncement,
            { color: currentResult.rarity_color },
          ]}>
            {isLegendary && '🌟 LEGENDARY SUMMON! 🌟'}
            {isEpic && '⚡ EPIC SUMMON! ⚡'}
            {currentResult.rarity === 'rare' && '✨ RARE SUMMON! ✨'}
            {currentResult.rarity === 'common' && 'New Ally Summoned!'}
          </Text>
            
          {/* Character Card */}
          <Animated.View
            style={[
              styles.characterCard,
              {
                borderColor: currentResult.rarity_color,
                transform: [{ scale: cardScale }],
                opacity: cardOpacity,
              },
            ]}
          >
            <View style={[styles.cardHeader, { backgroundColor: currentResult.rarity_color }]}>
              <Text style={styles.cardRarity}>{currentResult.rarity.toUpperCase()}</Text>
            </View>
              
            <View style={styles.cardContent}>
              <Text style={styles.characterArtwork}>{currentResult.artwork}</Text>
              <Text style={styles.characterName}>{currentResult.name}</Text>
              <Text style={styles.characterDescription}>{currentResult.description}</Text>
                
              {/* Stats Preview */}
              <View style={styles.statsPreview}>
                <Text style={styles.statsTitle}>BASE STATS</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>STR</Text>
                    <Text style={styles.statValue}>{currentResult.base_stats.strength}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>CAR</Text>
                    <Text style={styles.statValue}>{currentResult.base_stats.cardio}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>FLX</Text>
                    <Text style={styles.statValue}>{currentResult.base_stats.flexibility}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
            
          {/* Navigation */}
          <View style={styles.navigationContainer}>
            <Text style={styles.progressText}>
              {currentIndex + 1} of {results.length}
            </Text>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={nextResult}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex < results.length - 1 ? 'Next' : 'Finish'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  resultsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    alignItems: 'center',
  },
  rarityAnnouncement: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  characterCard: {
    borderWidth: 3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: 'white',
  },
  cardHeader: {
    padding: 12,
    alignItems: 'center',
  },
  cardRarity: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 20,
  },
  characterArtwork: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  characterDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  statsPreview: {
    marginTop: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
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
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PullResultsModal;
  