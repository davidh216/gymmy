import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Banner } from '../utils/BannerUtils';
import { PityStats } from '../utils/PityUtils';
import {
  PullSequenceController,
  BannerRotationSystem,
  PityProgressDisplay,
  PullHistoryViewer,
  CelebrationEffects,
  RarePullCelebration,
  RarityReveal,
} from '../index';

interface PullResult {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  character: string;
  isNew: boolean;
}

interface GachaModalsProps {
  // Modal visibility states
  showPullSequence: boolean;
  showBannerRotation: boolean;
  showPityDetails: boolean;
  showPullHistory: boolean;
  showCelebration: boolean;
  showRarityReveal: boolean;
  showRareCelebration: boolean;
  
  // Data
  selectedBanner: Banner | null;
  pullResults: PullResult[];
  pullHistory: any[];
  pityStats: PityStats;
  
  // Handlers
  onBannerSelect: (banner: Banner) => void;
  onPullComplete: () => void;
  onPullSkip: () => void;
  onRarityRevealComplete: () => void;
  onCelebrationComplete: () => void;
  onRareCelebrationComplete: () => void;
  onCloseBannerRotation: () => void;
  onClosePityDetails: () => void;
  onClosePullHistory: () => void;
}

export const GachaModals: React.FC<GachaModalsProps> = ({
  showPullSequence,
  showBannerRotation,
  showPityDetails,
  showPullHistory,
  showCelebration,
  showRarityReveal,
  showRareCelebration,
  selectedBanner,
  pullResults,
  pullHistory,
  pityStats,
  onBannerSelect,
  onPullComplete,
  onPullSkip,
  onRarityRevealComplete,
  onCelebrationComplete,
  onRareCelebrationComplete,
  onCloseBannerRotation,
  onClosePityDetails,
  onClosePullHistory,
}) => {
  return (
    <>
      {/* Banner Rotation Modal */}
      <Modal
        visible={showBannerRotation}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Banner Rotation</Text>
            <TouchableOpacity onPress={onCloseBannerRotation}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <BannerRotationSystem
            onBannerSelect={onBannerSelect}
            currentBannerId={selectedBanner?.id}
          />
        </View>
      </Modal>
      
      {/* Pull Sequence Modal */}
      <PullSequenceController
        visible={showPullSequence}
        pullResults={pullResults}
        onComplete={onPullComplete}
        onSkip={onPullSkip}
        pullType="single"
      />
      
      {/* Pity Details Modal */}
      <PityProgressDisplay
        pityStats={pityStats}
        showDetails={showPityDetails}
        onClose={onClosePityDetails}
      />
      
      {/* Pull History Modal */}
      <PullHistoryViewer
        visible={showPullHistory}
        pullHistory={pullHistory}
        onClose={onClosePullHistory}
      />
      
      {/* Rarity Reveal Modal */}
      <RarityReveal
        visible={showRarityReveal}
        rarity={pullResults[0]?.rarity || 'common'}
        characterName={pullResults[0]?.name || ''}
        characterEmoji={pullResults[0]?.character || ''}
        onComplete={onRarityRevealComplete}
        onSkip={onRarityRevealComplete}
      />
      
      {/* Celebration Effects Modal */}
      <CelebrationEffects
        visible={showCelebration}
        rarity={pullResults[0]?.rarity as 'rare' | 'epic' | 'legendary' || 'rare'}
        characterName={pullResults[0]?.name || ''}
        onComplete={onCelebrationComplete}
      />
      
      {/* Rare Pull Celebration Modal */}
      <RarePullCelebration
        visible={showRareCelebration}
        rarity="legendary"
        characterName="Power Gymmy"
        characterEmoji="💪"
        celebrationType="milestone"
        onComplete={onRareCelebrationComplete}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
}); 