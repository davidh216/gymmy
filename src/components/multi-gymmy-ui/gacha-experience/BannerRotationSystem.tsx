import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Banner,
  DEFAULT_BANNERS,
  getCurrentBanner,
  getUpcomingBanners,
  getPastBanners,
  getBannerTimeUntilStart,
  formatTimeRemaining,
  getBannerStatus,
} from './utils/BannerUtils';
import { BannerCard } from './components/BannerCard';

interface BannerRotationSystemProps {
  onBannerSelect: (banner: Banner) => void;
  currentBannerId?: string;
}

const BannerRotationSystem: React.FC<BannerRotationSystemProps> = ({
  onBannerSelect,
  currentBannerId,
}) => {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [upcomingBanners, setUpcomingBanners] = useState<Banner[]>([]);
  const [pastBanners, setPastBanners] = useState<Banner[]>([]);
  const [selectedTab, setSelectedTab] = useState<'current' | 'upcoming' | 'past'>('current');
  
  // Animation values
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    updateBannerData();
    
    // Update banner data every minute
    const interval = setInterval(updateBannerData, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Animate in when component mounts
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const updateBannerData = () => {
    const current = getCurrentBanner(banners);
    const upcoming = getUpcomingBanners(banners, 3);
    const past = getPastBanners(banners, 5);
    
    setCurrentBanner(current);
    setUpcomingBanners(upcoming);
    setPastBanners(past);
  };
  
  const handleBannerSelect = (banner: Banner) => {
    const status = getBannerStatus(banner);
    
    if (status === 'ended') {
      Alert.alert(
        'Banner Ended',
        'This banner has ended. Check upcoming banners for new opportunities!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (status === 'upcoming') {
      const timeUntilStart = getBannerTimeUntilStart(banner);
      Alert.alert(
        'Banner Coming Soon',
        `This banner starts in ${formatTimeRemaining(timeUntilStart)}. Mark your calendar!`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    onBannerSelect(banner);
  };
  
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'current':
        return currentBanner ? (
          <View style={styles.tabContent}>
            <BannerCard
              banner={currentBanner}
              isSelected={currentBannerId === currentBanner.id}
              onPress={handleBannerSelect}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No active banners</Text>
            <Text style={styles.emptyStateSubtext}>Check upcoming banners for new opportunities!</Text>
          </View>
        );
      
      case 'upcoming':
        return (
          <View style={styles.tabContent}>
            {upcomingBanners.length > 0 ? (
              upcomingBanners.map(banner => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  onPress={handleBannerSelect}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>No upcoming banners</Text>
                <Text style={styles.emptyStateSubtext}>More banners will be announced soon!</Text>
              </View>
            )}
          </View>
        );
      
      case 'past':
        return (
          <View style={styles.tabContent}>
            {pastBanners.length > 0 ? (
              pastBanners.map(banner => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  onPress={handleBannerSelect}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="archive-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>No past banners</Text>
                <Text style={styles.emptyStateSubtext}>Banner history will appear here!</Text>
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnimation,
          transform: [{
            translateY: slideAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'current' && styles.activeTab]}
          onPress={() => setSelectedTab('current')}
        >
          <Ionicons
            name="flame"
            size={20}
            color={selectedTab === 'current' ? '#FF6B6B' : '#666'}
          />
          <Text style={[styles.tabText, selectedTab === 'current' && styles.activeTabText]}>
            Current
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Ionicons
            name="time"
            size={20}
            color={selectedTab === 'upcoming' ? '#4ECDC4' : '#666'}
          />
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'past' && styles.activeTab]}
          onPress={() => setSelectedTab('past')}
        >
          <Ionicons
            name="archive"
            size={20}
            color={selectedTab === 'past' ? '#A55EEA' : '#666'}
          />
          <Text style={[styles.tabText, selectedTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#333',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default BannerRotationSystem; 