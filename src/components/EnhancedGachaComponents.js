// src/components/EnhancedGachaComponents.js
// UI components for the refined gacha system

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUnifiedApp } from '../context/UnifiedAppProvider';

// ==============================================================================
// ENHANCED GACHA SCREEN WITH PITY DISPLAY
// ==============================================================================

export const EnhancedGachaScreen = ({ navigation }) => {
  const { userStats, gachaStats, pullGacha, getPullCosts } = useUnifiedApp();
  const [showPityDetails, setShowPityDetails] = useState(false);
  const [showBannerDetails, setShowBannerDetails] = useState(false);
  const [pullAnimation] = useState(new Animated.Value(0));
  const [showResults, setShowResults] = useState(false);
  const [pullResults, setPullResults] = useState([]);
  const [isPulling, setIsPulling] = useState(false);
  
  const costs = getPullCosts();
  
  // Pity progress calculations
  const pityProgress = {
    legendary: Math.min((gachaStats.legendaryPity / 90) * 100, 100),
    epic: Math.min(((gachaStats.totalPulls % 30) / 30) * 100, 100),
    rare: Math.min(((gachaStats.totalPulls % 10) / 10) * 100, 100),
  };

  const handlePull = async (pullType) => {
    const cost = costs[pullType];
    
    if (userStats.currencies.gems < cost.gems) {
      Alert.alert(
        'Insufficient Gems! 💎',
        `You need ${cost.gems} gems for this pull. Complete more workouts to earn gems!`,
        [{ text: 'Got it!', style: 'default' }],
      );
      return;
    }
    
    setIsPulling(true);
    
    // Enhanced pull animation
    Animated.sequence([
      Animated.timing(pullAnimation, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }),
      Animated.timing(pullAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      try {
        const results = pullGacha(pullType);
        setPullResults(results);
        setShowResults(true);
        setIsPulling(false);
      } catch (error) {
        Alert.alert('Pull Failed', error.message);
        setIsPulling(false);
      }
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Enhanced Header with Pity Display */}
      <View style={styles.enhancedHeader}>
        <Text style={styles.title}>ENHANCED SUMMONS</Text>
        
        {/* Currency Display */}
        <View style={styles.currencyDisplay}>
          <View style={styles.currencyItem}>
            <Text style={styles.currencyIcon}>💎</Text>
            <Text style={styles.currencyAmount}>{userStats.currencies.gems}</Text>
          </View>
          <View style={styles.currencyItem}>
            <Text style={styles.currencyIcon}>🪙</Text>
            <Text style={styles.currencyAmount}>{userStats.currencies.coins}</Text>
          </View>
          <View style={styles.currencyItem}>
            <Text style={styles.currencyIcon}>💠</Text>
            <Text style={styles.currencyAmount}>{userStats.currencies.crystals}</Text>
          </View>
        </View>
        
        {/* Pity Counter Display */}
        <View style={styles.pityContainer}>
          <TouchableOpacity 
            style={styles.pityHeader}
            onPress={() => setShowPityDetails(true)}
          >
            <Text style={styles.pityTitle}>Pity System</Text>
            <Ionicons name="information-circle" size={20} color="#FFD700" />
          </TouchableOpacity>
          
          <View style={styles.pityBars}>
            {/* Legendary Pity */}
            <View style={styles.pityBarContainer}>
              <Text style={styles.pityLabel}>Legendary: {gachaStats.legendaryPity}/90</Text>
              <View style={styles.pityBar}>
                <View 
                  style={[
                    styles.pityFill, 
                    { width: `${pityProgress.legendary}%`, backgroundColor: '#FFD700' },
                  ]} 
                />
              </View>
            </View>
            
            {/* Epic Pity */}
            <View style={styles.pityBarContainer}>
              <Text style={styles.pityLabel}>Epic: {gachaStats.totalPulls % 30}/30</Text>
              <View style={styles.pityBar}>
                <View 
                  style={[
                    styles.pityFill, 
                    { width: `${pityProgress.epic}%`, backgroundColor: '#9932CC' },
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
      </View>
      
      {/* Featured Banner Section */}
      <FeaturedBannerCard onPress={() => setShowBannerDetails(true)} />
      
      {/* Enhanced Pull Buttons */}
      <View style={styles.pullSection}>
        <PullButton 
          type="single"
          cost={costs.single.gems}
          available={userStats.currencies.gems >= costs.single.gems}
          onPress={() => handlePull('single')}
          disabled={isPulling}
        />
        
        <PullButton 
          type="ten_pull"
          cost={costs.ten_pull.gems}
          available={userStats.currencies.gems >= costs.ten_pull.gems}
          onPress={() => handlePull('ten_pull')}
          disabled={isPulling}
          featured={true}
        />
      </View>
      
      {/* Materials Inventory */}
      <MaterialsInventory />
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CharacterCollection')}
        >
          <Ionicons name="people" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>COLLECTION</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EvolutionLab')}
        >
          <Ionicons name="trending-up" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>EVOLUTION</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WorkoutScreen')}
        >
          <Ionicons name="fitness" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>EARN GEMS</Text>
        </TouchableOpacity>
      </View>
      
      {/* Modals */}
      <PityDetailsModal
        visible={showPityDetails}
        onClose={() => setShowPityDetails(false)}
        pityStats={gachaStats}
      />
      
      <BannerDetailsModal
        visible={showBannerDetails}
        onClose={() => setShowBannerDetails(false)}
      />
      
      <EnhancedPullResultsModal
        visible={showResults}
        results={pullResults}
        onClose={() => setShowResults(false)}
      />
    </ScrollView>
  );
};

// ==============================================================================
// FEATURED BANNER CARD
// ==============================================================================

const FeaturedBannerCard = ({ onPress }) => {
  const bannerAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(bannerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(bannerAnimation, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]);
    
    Animated.loop(pulse).start();
  }, []);

  const glowOpacity = bannerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <TouchableOpacity style={styles.bannerCard} onPress={onPress}>
      <Animated.View 
        style={[
          styles.bannerGlow, 
          { opacity: glowOpacity },
        ]} 
      />
      
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>🌟 STRENGTH LEGENDS 🌟</Text>
        <Text style={styles.bannerSubtitle}>Featured Rate-Up Banner</Text>
        <Text style={styles.bannerDescription}>
          2x rates for legendary strength characters!
        </Text>
        
        <View style={styles.bannerTimerContainer}>
          <Ionicons name="time" size={16} color="#FFD700" />
          <Text style={styles.bannerTimeText}>12d 5h 23m remaining</Text>
        </View>
      </View>
      
      <View style={styles.bannerCharacters}>
        <Text style={styles.featuredCharacter}>🏔️💪</Text>
        <Text style={styles.featuredCharacter}>⚡🏋️</Text>
      </View>
    </TouchableOpacity>
  );
};

// ==============================================================================
// ENHANCED PULL BUTTON
// ==============================================================================

const PullButton = ({ type, cost, available, onPress, disabled, featured = false }) => {
  const [buttonAnim] = useState(new Animated.Value(1));
  
  const handlePressIn = () => {
    Animated.spring(buttonAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(buttonAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyle = type === 'single' 
    ? styles.singlePullButton 
    : [styles.tenPullButton, featured && styles.featuredPullButton];

  return (
    <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
      <TouchableOpacity
        style={[
          buttonStyle,
          !available && styles.disabledButton,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || !available}
        activeOpacity={0.8}
      >
        {featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>HOT!</Text>
          </View>
        )}
        
        <View style={styles.pullButtonContent}>
          <Text style={styles.pullButtonTitle}>
            {type === 'single' ? 'SINGLE SUMMON' : '10x SUMMON'}
          </Text>
          
          <View style={styles.costDisplay}>
            <Text style={styles.costIcon}>💎</Text>
            <Text style={styles.costAmount}>{cost}</Text>
          </View>
          
          <Text style={styles.pullButtonDescription}>
            {type === 'single' 
              ? 'Summon 1 character' 
              : 'Summon 10 characters'
            }
          </Text>
          
          {type === 'ten_pull' && (
            <View style={styles.guaranteeBadge}>
              <Text style={styles.guaranteeText}>★ GUARANTEED RARE+ ★</Text>
            </View>
          )}
        </View>
        
        {!available && (
          <View style={styles.insufficientOverlay}>
            <Text style={styles.insufficientText}>Insufficient Gems</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ==============================================================================
// MATERIALS INVENTORY
// ==============================================================================

const MaterialsInventory = () => {
  // const { state } = useUnifiedApp();
  
  // Mock materials data - replace with actual data from context
  const materials = [
    { id: 'strength_essence', name: 'Strength Essence', icon: '💪', count: 25, rarity: 'common' },
    { id: 'golden_protein', name: 'Golden Protein', icon: '🥇', count: 5, rarity: 'rare' },
    { id: 'crystal_focus', name: 'Crystal Focus', icon: '💎', count: 1, rarity: 'epic' },
    { id: 'legendary_spirit', name: 'Legendary Spirit', icon: '👑', count: 0, rarity: 'legendary' },
  ];

  return (
    <View style={styles.materialsContainer}>
      <Text style={styles.materialsTitle}>Evolution Materials</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {materials.map(material => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </ScrollView>
    </View>
  );
};

const MaterialCard = ({ material }) => {
  const getRarityColor = (rarity) => {
    switch (rarity) {
    case 'legendary': return '#FFD700';
    case 'epic': return '#9932CC';
    case 'rare': return '#4169E1';
    case 'common': return '#808080';
    default: return '#808080';
    }
  };

  return (
    <View style={[
      styles.materialCard,
      { borderColor: getRarityColor(material.rarity) },
    ]}>
      <Text style={styles.materialIcon}>{material.icon}</Text>
      <Text style={styles.materialName}>{material.name}</Text>
      <Text style={styles.materialCount}>×{material.count}</Text>
    </View>
  );
};

// ==============================================================================
// PITY DETAILS MODAL
// ==============================================================================

const PityDetailsModal = ({ visible, onClose, pityStats }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.pityModal}>
          <View style={styles.pityModalHeader}>
            <Text style={styles.pityModalTitle}>🎯 Pity System Explained</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.pityModalContent}>
            <View style={styles.pityExplanation}>
              <Text style={styles.pityExplanationTitle}>How Pity Works:</Text>
              <Text style={styles.pityExplanationText}>
                • After 90 pulls without a Legendary: GUARANTEED Legendary{'\n'}
                • After 30 pulls without Epic+: Increased Epic rates{'\n'}
                • After 10 pulls without Rare+: GUARANTEED Rare+{'\n'}
                • Rates increase gradually as you approach pity
              </Text>
            </View>
            
            <View style={styles.pityStats}>
              <Text style={styles.pityStatsTitle}>Your Statistics:</Text>
              
              <View style={styles.pityStatItem}>
                <Text style={styles.pityStatLabel}>Total Pulls:</Text>
                <Text style={styles.pityStatValue}>{pityStats.totalPulls}</Text>
              </View>
              
              <View style={styles.pityStatItem}>
                <Text style={styles.pityStatLabel}>Legendary Pity:</Text>
                <Text style={[styles.pityStatValue, { color: '#FFD700' }]}>
                  {pityStats.legendaryPity}/90
                </Text>
              </View>
              
              <View style={styles.pityStatItem}>
                <Text style={styles.pityStatLabel}>Next Guaranteed:</Text>
                <Text style={styles.pityStatValue}>
                  {90 - pityStats.legendaryPity} pulls
                </Text>
              </View>
            </View>
            
            <View style={styles.rateUpInfo}>
              <Text style={styles.rateUpTitle}>Current Rate Boosts:</Text>
              {pityStats.legendaryPity > 60 && (
                <Text style={styles.rateUpText}>
                  🔥 Legendary rate increased by {((pityStats.legendaryPity - 60) * 0.5).toFixed(1)}%
                </Text>
              )}
              {pityStats.legendaryPity <= 60 && (
                <Text style={styles.rateUpText}>
                  📊 Base rates active (rate-up starts at 60 pulls)
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ==============================================================================
// BANNER DETAILS MODAL
// ==============================================================================

const BannerDetailsModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.bannerModal}>
          <View style={styles.bannerModalHeader}>
            <Text style={styles.bannerModalTitle}>🌟 Strength Legends Banner</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.bannerModalContent}>
            <View style={styles.featuredCharactersSection}>
              <Text style={styles.featuredTitle}>Featured Characters:</Text>
              
              <View style={styles.featuredCharactersList}>
                <View style={styles.featuredCharacterItem}>
                  <Text style={styles.featuredCharacterIcon}>🏔️💪</Text>
                  <View>
                    <Text style={styles.featuredCharacterName}>The Iron Titan</Text>
                    <Text style={styles.featuredCharacterRarity}>★★★★★ Legendary</Text>
                    <Text style={styles.featuredCharacterDescription}>
                      Ultimate strength character with massive compound lift bonuses
                    </Text>
                  </View>
                </View>
                
                <View style={styles.featuredCharacterItem}>
                  <Text style={styles.featuredCharacterIcon}>⚡🏋️</Text>
                  <View>
                    <Text style={styles.featuredCharacterName}>Lightning Lifter</Text>
                    <Text style={styles.featuredCharacterRarity}>★★★★ Epic</Text>
                    <Text style={styles.featuredCharacterDescription}>
                      Speed-focused strength training with explosive power bonuses
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.bannerBonuses}>
              <Text style={styles.bonusesTitle}>Banner Bonuses:</Text>
              <Text style={styles.bonusText}>• 2x rate for featured characters</Text>
              <Text style={styles.bonusText}>• 50% chance featured when pulling rarity</Text>
              <Text style={styles.bonusText}>• +25% XP bonus for featured characters</Text>
              <Text style={styles.bonusText}>• Enhanced base stats (+20%)</Text>
            </View>
            
            <View style={styles.bannerTimerContainer}>
              <Text style={styles.timerTitle}>Time Remaining:</Text>
              <Text style={styles.timerText}>12 days, 5 hours, 23 minutes</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ==============================================================================
// ENHANCED PULL RESULTS MODAL
// ==============================================================================

const EnhancedPullResultsModal = ({ visible, results, onClose }) => {
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [showAllResults, setShowAllResults] = useState(false);
  const revealAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible && results.length > 0) {
      setCurrentResultIndex(0);
      setShowAllResults(false);
      
      // Staggered reveal animation
      Animated.timing(revealAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, results]);

  const handleNext = () => {
    if (currentResultIndex < results.length - 1) {
      setCurrentResultIndex(prev => prev + 1);
    } else {
      setShowAllResults(true);
    }
  };

  const handleSkipToAll = () => {
    setShowAllResults(true);
  };

  if (!visible || !results || results.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.resultsModalOverlay}>
        <View style={styles.resultsModal}>
          {!showAllResults ? (
            <SingleResultView 
              result={results[currentResultIndex]}
              resultNumber={currentResultIndex + 1}
              totalResults={results.length}
              onNext={handleNext}
              onSkip={handleSkipToAll}
              animation={revealAnimation}
            />
          ) : (
            <AllResultsView 
              results={results}
              onClose={onClose}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const SingleResultView = ({ result, resultNumber, totalResults, onNext, onSkip, animation }) => {
  const getRarityColor = (rarity) => {
    switch (rarity) {
    case 'legendary': return '#FFD700';
    case 'epic': return '#9932CC';
    case 'rare': return '#4169E1';
    case 'common': return '#808080';
    default: return '#808080';
    }
  };

  const getRarityEffect = (rarity) => {
    switch (rarity) {
    case 'legendary': return '✨🌟✨';
    case 'epic': return '⚡💫⚡';
    case 'rare': return '💎';
    case 'common': return '⭐';
    default: return '';
    }
  };

  return (
    <Animated.View style={[
      styles.singleResultContainer,
      { 
        transform: [{ 
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        }],
        opacity: animation,
      },
    ]}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultCounter}>{resultNumber} / {totalResults}</Text>
        {totalResults > 1 && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip to All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={[
        styles.characterReveal,
        { borderColor: getRarityColor(result.rarity) },
      ]}>
        <Text style={styles.rarityEffect}>{getRarityEffect(result.rarity)}</Text>
        <Text style={styles.characterArtwork}>{result.artwork}</Text>
        <Text style={styles.characterName}>{result.name}</Text>
        <Text style={[
          styles.characterRarity, 
          { color: getRarityColor(result.rarity) },
        ]}>
          {result.rarity.toUpperCase()}
        </Text>
        <Text style={styles.characterDescription}>{result.description}</Text>
      </View>
      
      {result.rarity !== 'common' && (
        <View style={styles.specialEffects}>
          <Text style={styles.specialEffectText}>
            🎉 {result.rarity.toUpperCase()} PULL! 🎉
          </Text>
          {result.name.includes('[Featured]') && (
            <Text style={styles.featuredPullText}>
              ⭐ FEATURED CHARACTER BONUS! ⭐
            </Text>
          )}
        </View>
      )}
      
      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>
          {resultNumber < totalResults ? 'NEXT' : 'VIEW ALL'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AllResultsView = ({ results, onClose }) => {
  const rarityCount = results.reduce((acc, result) => {
    acc[result.rarity] = (acc[result.rarity] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.allResultsContainer}>
      <View style={styles.allResultsHeader}>
        <Text style={styles.allResultsTitle}>🎉 SUMMON COMPLETE! 🎉</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.summaryStats}>
        <Text style={styles.summaryTitle}>Summary:</Text>
        <View style={styles.summaryRow}>
          {Object.entries(rarityCount).map(([rarity, count]) => (
            <View key={rarity} style={styles.summaryItem}>
              <Text style={styles.summaryRarity}>{rarity.toUpperCase()}</Text>
              <Text style={styles.summaryCount}>×{count}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <ScrollView style={styles.allResultsList}>
        <View style={styles.resultsGrid}>
          {results.map((result, index) => (
            <View key={index} style={styles.resultGridItem}>
              <Text style={styles.gridCharacterArt}>{result.artwork}</Text>
              <Text style={styles.gridCharacterName}>{result.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.claimButton} onPress={onClose}>
        <Text style={styles.claimButtonText}>CLAIM ALL CHARACTERS</Text>
      </TouchableOpacity>
    </View>
  );
};

// ==============================================================================
// STYLES
// ==============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Enhanced Header
  enhancedHeader: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  
  // Currency Display
  currencyDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 20,
  },
  currencyItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  currencyIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  currencyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Pity System
  pityContainer: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  pityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  pityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  pityBars: {
    gap: 10,
  },
  pityBarContainer: {
    gap: 5,
  },
  pityLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  pityBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pityFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  // Featured Banner
  bannerCard: {
    margin: 20,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  bannerGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFD700',
    borderRadius: 25,
    opacity: 0.3,
  },
  bannerContent: {
    padding: 20,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  bannerDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  bannerTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  bannerTimeText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '500',
  },
  bannerCharacters: {
    position: 'absolute',
    right: 20,
    top: 20,
    alignItems: 'center',
  },
  featuredCharacter: {
    fontSize: 30,
    marginBottom: 5,
  },
  
  // Pull Buttons
  pullSection: {
    paddingHorizontal: 20,
    gap: 15,
  },
  singlePullButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 20,
    position: 'relative',
  },
  tenPullButton: {
    backgroundColor: '#FF6347',
    borderRadius: 15,
    padding: 20,
    position: 'relative',
  },
  featuredPullButton: {
    backgroundColor: '#FFD700',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF1493',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  pullButtonContent: {
    alignItems: 'center',
  },
  pullButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  costDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  costIcon: {
    fontSize: 18,
  },
  costAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  pullButtonDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  guaranteeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  guaranteeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  insufficientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  insufficientText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Materials Inventory
  materialsContainer: {
    padding: 20,
  },
  materialsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  materialCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 100,
    borderWidth: 2,
  },
  materialIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  materialName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  materialCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Pity Modal
  pityModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  pityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  pityModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  pityModalContent: {
    padding: 20,
  },
  pityExplanation: {
    marginBottom: 20,
  },
  pityExplanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  pityExplanationText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  pityStats: {
    marginBottom: 20,
  },
  pityStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  pityStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pityStatLabel: {
    fontSize: 14,
    color: '#fff',
  },
  pityStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  rateUpInfo: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  rateUpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  rateUpText: {
    fontSize: 14,
    color: '#fff',
  },
  
  // Banner Modal
  bannerModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  bannerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  bannerModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerModalContent: {
    padding: 20,
  },
  featuredCharactersSection: {
    marginBottom: 20,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  featuredCharactersList: {
    gap: 15,
  },
  featuredCharacterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    gap: 15,
  },
  featuredCharacterIcon: {
    fontSize: 40,
  },
  featuredCharacterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  featuredCharacterRarity: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 5,
  },
  featuredCharacterDescription: {
    fontSize: 12,
    color: '#ccc',
  },
  bannerBonuses: {
    marginBottom: 20,
  },
  bonusesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  bonusText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  bannerTimerContainer: {
    backgroundColor: 'rgba(255,69,0,0.1)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 5,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Results Modal
  resultsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsModal: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
  },
  
  // Single Result View
  singleResultContainer: {
    padding: 30,
    alignItems: 'center',
    minHeight: 400,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  resultCounter: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  skipButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  characterReveal: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 30,
    borderWidth: 3,
    minWidth: 250,
  },
  rarityEffect: {
    fontSize: 30,
    marginBottom: 10,
  },
  characterArtwork: {
    fontSize: 80,
    marginBottom: 15,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  characterRarity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  characterDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  specialEffects: {
    marginTop: 20,
    alignItems: 'center',
  },
  specialEffectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  featuredPullText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF1493',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginTop: 30,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // All Results View
  allResultsContainer: {
    padding: 20,
    maxHeight: '90%',
  },
  allResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  allResultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryStats: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryRarity: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 3,
  },
  summaryCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  allResultsList: {
    flex: 1,
    marginBottom: 20,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  resultGridItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  gridCharacterArt: {
    fontSize: 30,
    marginBottom: 8,
  },
  gridCharacterName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  claimButton: {
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

// ==============================================================================
// EVOLUTION LAB COMPONENT
// ==============================================================================

export const EvolutionLab = ({ navigation }) => {
  const { characters } = useUnifiedApp();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  
  // Filter characters that can evolve
  const evolvableCharacters = characters.collection.filter(char => 
    char.rarity !== 'legendary' && char.level >= 20,
  );

  return (
    <View style={styles.evolutionContainer}>
      <View style={styles.evolutionHeader}>
        <Text style={styles.evolutionTitle}>🧪 EVOLUTION LAB 🧪</Text>
        <Text style={styles.evolutionSubtitle}>Transform your characters into legendary beings!</Text>
      </View>
      
      <ScrollView style={styles.evolutionContent}>
        {evolvableCharacters.length === 0 ? (
          <View style={styles.noEvolutionContainer}>
            <Text style={styles.noEvolutionIcon}>🔬</Text>
            <Text style={styles.noEvolutionText}>No characters ready for evolution</Text>
            <Text style={styles.noEvolutionSubtext}>
              Level your characters to 20+ and gather materials to unlock evolution!
            </Text>
          </View>
        ) : (
          <View style={styles.evolvableCharactersList}>
            {evolvableCharacters.map(character => (
              <EvolvableCharacterCard
                key={character.instance_id}
                character={character}
                onPress={() => {
                  setSelectedCharacter(character);
                  setShowEvolutionModal(true);
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
      
      <EvolutionModal
        visible={showEvolutionModal}
        character={selectedCharacter}
        onClose={() => setShowEvolutionModal(false)}
      />
    </View>
  );
};

const EvolvableCharacterCard = ({ character, onPress }) => {
  const getNextRarity = (currentRarity) => {
    switch (currentRarity) {
    case 'common': return 'rare';
    case 'rare': return 'epic';
    case 'epic': return 'legendary';
    default: return currentRarity;
    }
  };

  const nextRarity = getNextRarity(character.rarity);

  return (
    <TouchableOpacity style={styles.evolvableCard} onPress={onPress}>
      <View style={styles.evolutionPreview}>
        <View style={styles.currentCharacter}>
          <Text style={styles.evolutionCharacterArt}>{character.artwork}</Text>
          <Text style={styles.evolutionRarity}>{character.rarity.toUpperCase()}</Text>
        </View>
        
        <View style={styles.evolutionArrow}>
          <Ionicons name="arrow-forward" size={24} color="#FFD700" />
        </View>
        
        <View style={styles.nextCharacter}>
          <Text style={styles.evolutionCharacterArt}>{character.artwork}✨</Text>
          <Text style={styles.evolutionRarity}>{nextRarity.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.evolutionCardName}>{character.name}</Text>
      <Text style={styles.evolutionLevel}>Level {character.level}</Text>
      
      <View style={styles.evolutionProgress}>
        <Text style={styles.evolutionStatus}>Ready to evolve!</Text>
      </View>
    </TouchableOpacity>
  );
};

const EvolutionModal = ({ visible, character, onClose }) => {
  if (!visible || !character) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.evolutionModal}>
          <View style={styles.evolutionModalHeader}>
            <Text style={styles.evolutionModalTitle}>Character Evolution</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.evolutionModalContent}>
            <View style={styles.evolutionDetails}>
              <Text style={styles.evolutionCharacterName}>{character.name}</Text>
              
              <View style={styles.evolutionTransformation}>
                <View style={styles.beforeEvolution}>
                  <Text style={styles.transformationLabel}>Current</Text>
                  <Text style={styles.transformationArt}>{character.artwork}</Text>
                  <Text style={styles.transformationRarity}>{character.rarity.toUpperCase()}</Text>
                </View>
                
                <Ionicons name="arrow-forward" size={30} color="#FFD700" />
                
                <View style={styles.afterEvolution}>
                  <Text style={styles.transformationLabel}>After Evolution</Text>
                  <Text style={styles.transformationArt}>{character.artwork}✨</Text>
                  <Text style={styles.transformationRarity}>
                    {character.rarity === 'common' ? 'RARE' : 
                      character.rarity === 'rare' ? 'EPIC' : 'LEGENDARY'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.evolutionRequirements}>
                <Text style={styles.requirementsTitle}>Evolution Requirements:</Text>
                <View style={styles.requirement}>
                  <Text style={styles.requirementText}>✅ Level 20+ (Current: {character.level})</Text>
                </View>
                <View style={styles.requirement}>
                  <Text style={styles.requirementText}>• Golden Protein ×3</Text>
                </View>
                <View style={styles.requirement}>
                  <Text style={styles.requirementText}>• Strength Essence ×10</Text>
                </View>
                <View style={styles.requirement}>
                  <Text style={styles.requirementText}>• 500 Gems</Text>
                </View>
              </View>
              
              <View style={styles.evolutionBenefits}>
                <Text style={styles.benefitsTitle}>Evolution Benefits:</Text>
                <Text style={styles.benefitText}>• +30% to all base stats</Text>
                <Text style={styles.benefitText}>• Enhanced special ability</Text>
                <Text style={styles.benefitText}>• New visual effects</Text>
                <Text style={styles.benefitText}>• Increased XP gains</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.evolutionButtons}>
            <TouchableOpacity style={styles.cancelEvolutionButton} onPress={onClose}>
              <Text style={styles.cancelEvolutionText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmEvolutionButton}
              onPress={() => {
                // Handle evolution
                Alert.alert(
                  'Evolution Complete! 🎉',
                  `${character.name} has successfully evolved!`,
                  [{ text: 'Amazing!', onPress: onClose }],
                );
              }}
            >
              <Text style={styles.confirmEvolutionText}>EVOLVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Evolution Lab Styles
const evolutionStyles = StyleSheet.create({
  evolutionContainer: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  evolutionHeader: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  evolutionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  evolutionSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  evolutionContent: {
    flex: 1,
    padding: 20,
  },
  noEvolutionContainer: {
    alignItems: 'center',
    padding: 50,
  },
  noEvolutionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  noEvolutionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  noEvolutionSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  evolvableCharactersList: {
    gap: 15,
  },
  evolvableCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  evolutionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  currentCharacter: {
    alignItems: 'center',
  },
  nextCharacter: {
    alignItems: 'center',
  },
  evolutionArrow: {
    marginHorizontal: 20,
  },
  evolutionCharacterArt: {
    fontSize: 40,
    marginBottom: 5,
  },
  evolutionRarity: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  evolutionCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  evolutionLevel: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 10,
  },
  evolutionProgress: {
    alignItems: 'center',
  },
  evolutionStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  
  // Evolution Modal
  evolutionModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    margin: 20,
    maxHeight: '85%',
  },
  evolutionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  evolutionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  evolutionModalContent: {
    padding: 20,
  },
  evolutionDetails: {
    alignItems: 'center',
  },
  evolutionCharacterName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  evolutionTransformation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  beforeEvolution: {
    alignItems: 'center',
  },
  afterEvolution: {
    alignItems: 'center',
  },
  transformationLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  transformationArt: {
    fontSize: 60,
    marginBottom: 10,
  },
  transformationRarity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  evolutionRequirements: {
    width: '100%',
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 10,
  },
  requirement: {
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 14,
    color: '#fff',
  },
  evolutionBenefits: {
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  evolutionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  cancelEvolutionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelEvolutionText: {
    fontSize: 16,
    color: '#fff',
  },
  confirmEvolutionButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmEvolutionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

// Merge all styles
Object.assign(styles, evolutionStyles);

export default EnhancedGachaScreen;