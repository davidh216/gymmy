import React, { useState, useRef } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // ScrollView,
  // Alert,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // BannerDisplay,
  // PityProgressDisplay,
  // 
} from '../index';
import {
  // Banner,
  // DEFAULT_BANNERS
} from '../utils/BannerUtils';
import {
  // FeatureButton
} from '../components/FeatureButton';
import {
  // GachaModals
} from '../components/GachaModals';
import {
  // PullResult,
  // mockPityStats,
  // mockPullResults,
  // featureButtons
} from './GachaExampleData';

const GachaExperienceExample: React.FC = () => {
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(DEFAULT_BANNERS[0]);
  const [showPullSequence, setShowPullSequence] = useState(false);
  const [showBannerRotation, setShowBannerRotation] = useState(false);
  const [showPityDetails, setShowPityDetails] = useState(false);
  const [showPullHistory, setShowPullHistory] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showRarityReveal, setShowRarityReveal] = useState(false);
  const [showRareCelebration, setShowRareCelebration] = useState(false);
  
  const [userGems, setUserGems] = useState(1000);
  const [pullHistory, setPullHistory] = useState<any[]>([]);
  
  const handleBannerSelect = (banner: Banner) => {
    setSelectedBanner(banner);
    setShowBannerRotation(false);
  };
  
  const handlePull = (pullType: 'single' | 'multi') => {
    if (!selectedBanner) return;
    
    // const cost = ...; // Quick fix: commented unused variable
    
    if (userGems < cost) {
      Alert.alert(
        'Insufficient Gems',
        `You need ${cost} gems for this pull. You have ${userGems} gems.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setUserGems(prev => prev - cost);
    setShowPullSequence(true);
  };
  
  const handlePullComplete = () => {
    setShowPullSequence(false);
    // Add to pull history
    const newRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      characterName: mockPullResults[0].name,
      characterEmoji: mockPullResults[0].character,
      rarity: mockPullResults[0].rarity,
      bannerName: selectedBanner?.name,
      pullType: 'single' as const,
    };
    setPullHistory(prev => [newRecord, ...prev]);
  };
  
  const handlePullSkip = () => {
    setShowPullSequence(false);
    handlePullComplete();
  };
  
  const handleRarityRevealComplete = () => {
    setShowRarityReveal(false);
    if (mockPullResults[0].rarity !== 'common') {
      setShowCelebration(true);
    }
  };
  
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };
  
  const handleRareCelebrationComplete = () => {
    setShowRareCelebration(false);
  };
  
  const getFeatureButtonHandlers = () => [
    () => setShowBannerRotation(true),
    () => setShowPityDetails(true),
    () => setShowPullHistory(true),
    () => setShowRarityReveal(true),
    () => setShowCelebration(true),
    () => setShowRareCelebration(true),
  ];
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>🎰 Enhanced Gacha Experience</Text>
        <Text style={styles.subtitle}>Sprint 3 Demo - Pull Animation & Banner System</Text>
      </View>
      
      {/* Currency Display */}
      <View style={styles.currencyContainer}>
        <View style={styles.currencyItem}>
          <Text style={styles.currencyIcon}>💎</Text>
          <Text style={styles.currencyAmount}>{userGems}</Text>
        </View>
        <Text style={styles.currencyLabel}>Gems Available</Text>
      </View>
      
      {/* Feature Buttons */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Gacha Experience Features</Text>
        
        <View style={styles.buttonGrid}>
          {featureButtons.map((button, index) => (
            <FeatureButton
              key={index}
              icon={button.icon}
              iconColor={button.iconColor}
              title={button.title}
              subtitle={button.subtitle}
              onPress={getFeatureButtonHandlers()[index]}
            />
          ))}
        </View>
      </View>
      
      {/* Current Banner Display */}
      {selectedBanner && (
        <View style={styles.bannerSection}>
          <Text style={styles.sectionTitle}>Current Banner</Text>
          <BannerDisplay
            banner={selectedBanner}
            userGems={userGems}
            onPull={handlePull}
            onBannerInfo={() => Alert.alert('Banner Info', selectedBanner.description)}
          />
        </View>
      )}
      
      {/* Pity Progress */}
      <View style={styles.pitySection}>
        <PityProgressDisplay
          pityStats={mockPityStats}
          showDetails={false}
        />
      </View>
      
      {/* Pull Buttons */}
      <View style={styles.pullSection}>
        <Text style={styles.sectionTitle}>Test Pull Animations</Text>
        <View style={styles.pullButtons}>
          <TouchableOpacity
            style={[styles.pullButton, styles.singlePullButton]}
            onPress={() => handlePull('single')}
          >
            <Ionicons name="star-outline" size={24} color="#FFF" />
            <Text style={styles.pullButtonText}>Single Pull</Text>
            <Text style={styles.pullButtonCost}>{selectedBanner?.pullCost || 300} 💎</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.pullButton, styles.multiPullButton]}
            onPress={() => handlePull('multi')}
          >
            <Ionicons name="star" size={24} color="#FFF" />
            <Text style={styles.pullButtonText}>10x Pull</Text>
            <Text style={styles.pullButtonCost}>{(selectedBanner?.pullCost || 300) * 10} 💎</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Modals */}
      <GachaModals
        showPullSequence={showPullSequence}
        showBannerRotation={showBannerRotation}
        showPityDetails={showPityDetails}
        showPullHistory={showPullHistory}
        showCelebration={showCelebration}
        showRarityReveal={showRarityReveal}
        showRareCelebration={showRareCelebration}
        selectedBanner={selectedBanner}
        pullResults={mockPullResults}
        pullHistory={pullHistory}
        pityStats={mockPityStats}
        onBannerSelect={handleBannerSelect}
        onPullComplete={handlePullComplete}
        onPullSkip={handlePullSkip}
        onRarityRevealComplete={handleRarityRevealComplete}
        onCelebrationComplete={handleCelebrationComplete}
        onRareCelebrationComplete={handleRareCelebrationComplete}
        onCloseBannerRotation={() => setShowBannerRotation(false)}
        onClosePityDetails={() => setShowPityDetails(false)}
        onClosePullHistory={() => setShowPullHistory(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  currencyIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  currencyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currencyLabel: {
    fontSize: 14,
    color: '#666',
  },
  featuresContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bannerSection: {
    padding: 16,
  },
  pitySection: {
    paddingHorizontal: 16,
  },
  pullSection: {
    padding: 16,
  },
  pullButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pullButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  singlePullButton: {
    backgroundColor: '#4ECDC4',
  },
  multiPullButton: {
    backgroundColor: '#FF6B6B',
  },
  pullButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pullButtonCost: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GachaExperienceExample; 