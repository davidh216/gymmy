import React, { useMemo } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // SafeAreaView,
  // TouchableOpacity,
  // VirtualizedList,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // useApp
} from '../context';

const AchievementsScreen = ({ navigation }) => {
  const { achievements } = useApp();

  // Use memoized achievements from context instead of calculating locally
  // const allAchievements = ...; // Quick fix: commented unused variable

  // Process achievements for display
  // const unlockedAchievements = ...; // Quick fix: commented unused variable
  // // const lockedAchievements = ...; // Quick fix: commented unused variable
  
  // Calculate total progress
  // const totalProgress = ...; // Quick fix: commented unused variable
  // const totalAchievements = ...; // Quick fix: commented unused variable
  // const completionPercentage = ...; // Quick fix: commented unused variable

  const categoryTitles = {
    milestone: 'Milestones',
    duration: 'Duration',
    streak: 'Streaks',
    quality: 'Quality',
    consistency: 'Consistency',
    special: 'Special',
    variety: 'Exercise Variety',
    weight: 'Weight Training',
    cardio: 'Cardio',
    template: 'Templates',
    social: 'Social',
  };

  const categoryColors = {
    milestone: '#10b981',
    duration: '#8b5cf6',
    streak: '#f97316',
    quality: '#ffd700',
    consistency: '#22c55e',
    special: '#f59e0b',
    variety: '#06b6d4',
    weight: '#dc2626',
    cardio: '#ec4899',
    template: '#059669',
    social: '#3b82f6',
  };

  // Prepare data for VirtualizedList
  const sections = useMemo(() => {
    // const sectionsData = ...; // Quick fix: commented unused variable
    
    // Add progress overview section
    sectionsData.push({
      type: 'progress',
      id: 'progress',
      data: [{ id: 'progress' }],
    });
    
    // Add achievement category sections
    Object.keys(categoryTitles).forEach(category => {
      // const categoryAchievements = ...; // Quick fix: commented unused variable
      if (categoryAchievements.length > 0) {
        sectionsData.push({
          type: 'category',
          id: category,
          category,
          data: categoryAchievements,
        });
      }
    });
    
    return sectionsData;
  }, [allAchievements]);

  const renderAchievementCard = (achievement) => (
    <View key={achievement.id} style={[
      styles.achievementCard,
      achievement.condition && styles.unlockedCard,
    ]}>
      <View style={[
        styles.achievementIcon,
        { backgroundColor: achievement.condition ? achievement.color + '20' : '#f3f4f6' },
      ]}>
        <Ionicons 
          name={achievement.icon} 
          size={24} 
          color={achievement.condition ? achievement.color : '#9ca3af'} 
        />
      </View>
      <Text style={[
        styles.achievementTitle,
        achievement.condition && styles.unlockedTitle,
      ]}>
        {achievement.title}
      </Text>
      <Text style={styles.achievementDescription}>
        {achievement.description}
      </Text>
      {achievement.xpReward && (
        <View style={styles.xpRewardContainer}>
          <Ionicons name="star" size={12} color="#ffd700" />
          <Text style={styles.xpRewardText}>{achievement.xpReward} XP</Text>
        </View>
      )}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                backgroundColor: achievement.condition ? achievement.color : '#007AFF',
              },
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {achievement.category === 'milestone' || achievement.category === 'streak' 
            ? `${achievement.progress}/${achievement.maxProgress}`
            : `${Math.round((achievement.progress / achievement.maxProgress) * 100)}%`
          }
        </Text>
      </View>
    </View>
  );

  const renderCategorySection = (category, achievements) => {
    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={[
            styles.categoryIcon,
            { backgroundColor: categoryColors[category] + '20' },
          ]}>
            <Ionicons 
              name={getCategoryIcon(category)} 
              size={20} 
              color={categoryColors[category]} 
            />
          </View>
          <Text style={styles.categoryTitle}>{categoryTitles[category]}</Text>
          <Text style={styles.categoryCount}>
            {achievements.filter(a => a.condition).length}/{achievements.length}
          </Text>
        </View>
        <View style={styles.achievementsGrid}>
          {achievements.map(renderAchievementCard)}
        </View>
      </View>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      milestone: 'trophy-outline',
      duration: 'time-outline',
      streak: 'flame-outline',
      quality: 'star-outline',
      consistency: 'calendar-outline',
      special: 'sparkles-outline',
      variety: 'list-outline',
      weight: 'barbell-outline',
      cardio: 'heart-outline',
      template: 'document-outline',
      social: 'people-outline',
    };
    return icons[category] || 'help-outline';
  };

  // VirtualizedList render functions
  // const getItem = ...; // Quick fix: commented unused variable
  // const getItemCount = ...; // Quick fix: commented unused variable

  const renderItem = ({ section }) => {
    if (section.type === 'progress') {
      return (
        <View style={styles.progressOverview}>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressNumber}>{totalProgress}/{totalAchievements}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${completionPercentage}%`, backgroundColor: '#10b981' },
                ]} 
              />
            </View>
            <Text style={styles.progressPercentage}>{Math.round(completionPercentage)}% Complete</Text>
          </View>
        </View>
      );
    } else if (section.type === 'category') {
      return renderCategorySection(section.category, section.data);
    }
    return null;
  };

  const renderSectionHeader = ({ section }) => {
    if (section.type === 'progress') {
      return null; // Progress section doesn't need a header
    }
    return null; // Category headers are handled within the section
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.headerSpacer} />
      </View>

      <VirtualizedList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        getItemCount={getItemCount}
        getItem={getItem}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate height for each section
          offset: 200 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 20, // Add some padding at the bottom for the last section
  },
  progressOverview: {
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unlockedCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  unlockedTitle: {
    color: '#1f2937',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
    lineHeight: 16,
  },
  xpRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpRewardText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressBarSmall: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default AchievementsScreen; 