// ==============================================================================
// PART 1: GachaScreen.js - Main Gacha Pull Interface
// ==============================================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Modal,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useApp, getPullCosts, GACHA_RATES } from '../context';
import { 
  ScreenErrorBoundary,
  MemoryOptimizedComponent,
  PerformanceMonitor,
} from '../components/common';

const { width, height } = Dimensions.get('window');

const GachaScreen = ({ navigation }) => {
  const { userStats, gacha } = useApp();
  const [pullAnimation] = useState(new Animated.Value(0));
  const [showResults, setShowResults] = useState(false);
  const [pullResults, setPullResults] = useState([]);
  const [isPulling, setIsPulling] = useState(false);
  
  const costs = getPullCosts();
  
  const handlePull = async (pullType) => {
    const cost = costs[pullType];
    
    // Check currency
    if ((gacha?.userCurrencies?.gems ?? 0) < cost.gems) {
      Alert.alert(
        'Insufficient Gems! 💎',
        `You need ${cost.gems} gems for this pull. Complete more workouts to earn gems!`,
        [{ text: 'Got it!', style: 'default' }],
      );
      return;
    }
    
    setIsPulling(true);
    
    // Dramatic pull animation
    Animated.sequence([
      Animated.timing(pullAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(pullAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      // Perform the actual gacha pull
      try {
        if (!gacha?.performPull) {
          throw new Error('Gacha system not available');
        }
        const results = await gacha.performPull(pullType);
        console.log('Gacha pull results:', results);
        setPullResults(results);
        setShowResults(true);
        setIsPulling(false);
      } catch (error) {
        Alert.alert('Pull Failed', error.message);
        setIsPulling(false);
      }
    });
  };
  
  const rarityGradients = {
    legendary: ['#FFD700', '#FFA500', '#FF8C00'], // Gold gradient
    epic: ['#9932CC', '#8A2BE2', '#7B68EE'],      // Purple gradient
    rare: ['#4169E1', '#1E90FF', '#00BFFF'],      // Blue gradient
    common: ['#808080', '#A9A9A9', '#D3D3D3'],    // Gray gradient
  };
  
  const pullAnimationStyle = {
    opacity: pullAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.3, 1],
    }),
    transform: [{
      scale: pullAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.2, 1],
      }),
    }],
  };
  
  return (
    <ScreenErrorBoundary>
      <MemoryOptimizedComponent>
        <PerformanceMonitor componentName="GachaScreen">
          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Currency Display */}
        <View style={styles.header}>
          <Text style={styles.title}>GACHA SUMMONS</Text>
          <View style={styles.currencyDisplay}>
            <View style={styles.currencyItem}>
              <Text style={styles.currencyIcon}>💎</Text>
              <Text style={styles.currencyAmount}>{gacha?.userCurrencies?.gems ?? 0}</Text>
            </View>
            <View style={styles.currencyItem}>
              <Text style={styles.currencyIcon}>🪙</Text>
              <Text style={styles.currencyAmount}>{gacha?.userCurrencies?.coins ?? 0}</Text>
            </View>
            <View style={styles.currencyItem}>
              <Text style={styles.currencyIcon}>💠</Text>
              <Text style={styles.currencyAmount}>{gacha?.userCurrencies?.crystals ?? 0}</Text>
            </View>
          </View>
        </View>
        
        {/* Rates Display */}
        <View style={styles.ratesSection}>
          <Text style={styles.ratesTitle}>SUMMON RATES</Text>
          <View style={styles.ratesList}>
            <View style={styles.rateItem}>
              <Text style={[styles.rateRarity, { color: '#FFD700' }]}>LEGENDARY</Text>
              <Text style={styles.ratePercent}>{(GACHA_RATES.legendary * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={[styles.rateRarity, { color: '#9932CC' }]}>EPIC</Text>
              <Text style={styles.ratePercent}>{(GACHA_RATES.epic * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={[styles.rateRarity, { color: '#4169E1' }]}>RARE</Text>
              <Text style={styles.ratePercent}>{(GACHA_RATES.rare * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.rateItem}>
              <Text style={[styles.rateRarity, { color: '#808080' }]}>COMMON</Text>
              <Text style={styles.ratePercent}>{(GACHA_RATES.common * 100).toFixed(1)}%</Text>
            </View>
          </View>
        </View>
        
        {/* Gacha Machine Animation Area */}
        <Animated.View style={[styles.gachaMachine, pullAnimationStyle]}>
          <Text style={styles.machineTitle}>🎰 LEGENDARY SUMMONER 🎰</Text>
          <View style={styles.machineDisplay}>
            {isPulling ? (
              <View style={styles.pullingAnimation}>
                <Text style={styles.pullingText}>✨ SUMMONING... ✨</Text>
                <Text style={styles.pullingSubtext}>Calling forth legendary warriors!</Text>
              </View>
            ) : (
              <View style={styles.machineIdle}>
                <Text style={styles.machineText}>Ready to summon powerful allies?</Text>
                <Text style={styles.machineSubtext}>Complete workouts to earn gems!</Text>
              </View>
            )}
          </View>
        </Animated.View>
        
        {/* Pull Buttons */}
        <View style={styles.pullButtons}>
          <TouchableOpacity
            style={[
              styles.pullButton,
              { backgroundColor: (gacha?.userCurrencies?.gems ?? 0) >= costs.single.gems ? '#4CAF50' : '#666' },
            ]}
            onPress={() => handlePull('single')}
            disabled={isPulling || (gacha?.userCurrencies?.gems ?? 0) < costs.single.gems}
          >
            <Text style={styles.pullButtonTitle}>SINGLE SUMMON</Text>
            <Text style={styles.pullButtonCost}>💎 {costs.single.gems}</Text>
            <Text style={styles.pullButtonDesc}>Summon 1 character</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.pullButton,
              styles.tenPullButton,
              { backgroundColor: (gacha?.userCurrencies?.gems ?? 0) >= costs.ten_pull.gems ? '#FF6347' : '#666' },
            ]}
            onPress={() => handlePull('ten_pull')}
            disabled={isPulling || (gacha?.userCurrencies?.gems ?? 0) < costs.ten_pull.gems}
          >
            <Text style={styles.pullButtonTitle}>10x SUMMON</Text>
            <Text style={styles.pullButtonCost}>💎 {costs.ten_pull.gems}</Text>
            <Text style={styles.pullButtonDesc}>Summon 10 characters</Text>
            <Text style={styles.bonusText}>★ GUARANTEED RARE+ ★</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CharacterCollection')}
          >
            <Text style={styles.actionButtonText}>📚 MY COLLECTION</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('WorkoutScreen')}
          >
            <Text style={styles.actionButtonText}>🏋️ EARN GEMS</Text>
          </TouchableOpacity>
        </View>
            </ScrollView>
          </View>
          
          {/* Pull Results Modal */}
          <PullResultsModal
            visible={showResults}
            results={pullResults}
            onClose={() => setShowResults(false)}
            rarityGradients={rarityGradients}
          />
        </PerformanceMonitor>
      </MemoryOptimizedComponent>
    </ScreenErrorBoundary>
  );
};

// Pull Results Modal Component
const PullResultsModal = ({ visible, results, onClose, rarityGradients }) => {
  if (!visible || !results.length) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎉 SUMMON RESULTS 🎉</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.resultsList}>
            {results.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <View style={styles.characterCard}>
                                     <Text style={styles.characterName}>{result.name || 'Unknown Character'}</Text>
                                     <Text style={[styles.characterRarity, { color: getRarityColor(result.rarity || 'common') }]}>
                     {(result.rarity || 'common').toUpperCase()}
                   </Text>
                                     <Text style={styles.characterDescription}>{result.description || 'A mysterious character with unknown abilities.'}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.claimButton} onPress={onClose}>
            <Text style={styles.claimButtonText}>CLAIM REWARDS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const getRarityColor = (rarity) => {
  switch (rarity) {
  case 'legendary': return '#FFD700';
  case 'epic': return '#9932CC';
  case 'rare': return '#4169E1';
  case 'common': return '#808080';
  default: return '#666';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  currencyDisplay: {
    flexDirection: 'row',
    gap: 20,
  },
  currencyItem: {
    alignItems: 'center',
  },
  currencyIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  currencyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  ratesSection: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  ratesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  ratesList: {
    gap: 10,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateRarity: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratePercent: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  gachaMachine: {
    backgroundColor: '#0f3460',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  machineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  machineDisplay: {
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  pullingAnimation: {
    alignItems: 'center',
  },
  pullingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  pullingSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  machineIdle: {
    alignItems: 'center',
  },
  machineText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  machineSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  pullButtons: {
    gap: 15,
    marginBottom: 30,
  },
  pullButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  tenPullButton: {
    backgroundColor: '#FF6347',
  },
  pullButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  pullButtonCost: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  pullButtonDesc: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
  bonusText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  resultsList: {
    maxHeight: 400,
  },
  resultItem: {
    marginBottom: 15,
  },
  characterCard: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  characterRarity: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  characterDescription: {
    fontSize: 12,
    color: '#ccc',
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default GachaScreen;