import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // Modal,
  // ScrollView,
  // Animated
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // PityStats,
  // calculatePityProgress,
  // calculatePullsUntilGuaranteed,
  // calculatePityEfficiency,
  // getPityRecommendation
} from '../utils/PityUtils';
import {
  // PityBar
} from './PityBar';

interface PityDetailsModalProps {
  visible: boolean;
  pityStats: PityStats;
  progressAnimation: Animated.Value;
  pulseAnimation: Animated.Value;
  onClose: () => void;
}

export const PityDetailsModal: React.FC<PityDetailsModalProps> = ({
  visible,
  pityStats,
  progressAnimation,
  pulseAnimation,
  onClose,
}) => {
  // const pityProgress = ...; // Quick fix: commented unused variable
  // const pullsUntilGuaranteed = ...; // Quick fix: commented unused variable
  // const efficiency = ...; // Quick fix: commented unused variable
  // const recommendation = ...; // Quick fix: commented unused variable
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pity System Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Pity Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Progress</Text>
              <View style={styles.pityBarsContainer}>
                <PityBar
                  rarity="legendary"
                  progress={pityProgress.legendary}
                  progressAnimation={progressAnimation}
                  pulseAnimation={pulseAnimation}
                />
                <PityBar
                  rarity="epic"
                  progress={pityProgress.epic}
                  progressAnimation={progressAnimation}
                  pulseAnimation={pulseAnimation}
                />
                <PityBar
                  rarity="rare"
                  progress={pityProgress.rare}
                  progressAnimation={progressAnimation}
                  pulseAnimation={pulseAnimation}
                />
              </View>
            </View>
            
            {/* Pulls Until Guaranteed */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pulls Until Guaranteed</Text>
              <View style={styles.guaranteedContainer}>
                <View style={styles.guaranteedItem}>
                  <Text style={styles.guaranteedLabel}>Legendary</Text>
                  <Text style={styles.guaranteedCount}>{pullsUntilGuaranteed.legendary}</Text>
                </View>
                <View style={styles.guaranteedItem}>
                  <Text style={styles.guaranteedLabel}>Epic</Text>
                  <Text style={styles.guaranteedCount}>{pullsUntilGuaranteed.epic}</Text>
                </View>
                <View style={styles.guaranteedItem}>
                  <Text style={styles.guaranteedLabel}>Rare</Text>
                  <Text style={styles.guaranteedCount}>{pullsUntilGuaranteed.rare}</Text>
                </View>
              </View>
            </View>
            
            {/* Efficiency Analysis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Efficiency Analysis</Text>
              <View style={styles.efficiencyContainer}>
                <View style={styles.efficiencyItem}>
                  <Text style={styles.efficiencyLabel}>Overall Efficiency</Text>
                  <Text style={styles.efficiencyValue}>{Math.round(efficiency)}%</Text>
                </View>
                <View style={styles.efficiencyBar}>
                  <View
                    style={[
                      styles.efficiencyFill,
                      {
                        width: `${Math.min(efficiency, 100)}%`,
                        backgroundColor: efficiency >= 80 ? '#26DE81' : efficiency >= 60 ? '#FED330' : '#FF6B6B',
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
            
            {/* Recommendation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommendation</Text>
              <View style={styles.recommendationContainer}>
                <Ionicons name="bulb-outline" size={20} color="#4ECDC4" />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            </View>
            
            {/* Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Statistics</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Pulls</Text>
                  <Text style={styles.statValue}>{pityStats.totalPulls}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Last Legendary</Text>
                  <Text style={styles.statValue}>{pityStats.lastLegendaryPull} pulls ago</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Last Epic</Text>
                  <Text style={styles.statValue}>{pityStats.lastEpicPull} pulls ago</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Last Rare</Text>
                  <Text style={styles.statValue}>{pityStats.lastRarePull} pulls ago</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pityBarsContainer: {
    gap: 16,
  },
  guaranteedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  guaranteedItem: {
    alignItems: 'center',
    gap: 4,
  },
  guaranteedLabel: {
    fontSize: 12,
    color: '#666',
  },
  guaranteedCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  efficiencyContainer: {
    gap: 8,
  },
  efficiencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  efficiencyLabel: {
    fontSize: 14,
    color: '#666',
  },
  efficiencyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  efficiencyBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  efficiencyFill: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statsContainer: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
}); 