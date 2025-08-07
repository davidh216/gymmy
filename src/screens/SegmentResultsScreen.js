// src/screens/SegmentResultsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEGMENT_CONFIGS } from '../context/segmentationTypes';

const { width, height } = Dimensions.get('window');

export const SegmentResultsScreen = ({ 
  route, 
  navigation,
  segment,
  confidence,
  secondarySegment,
  goals = [],
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const segmentConfig = SEGMENT_CONFIGS[segment];
  const secondaryConfig = secondarySegment ? SEGMENT_CONFIGS[secondarySegment] : null;

  useEffect(() => {
    // Orchestrated entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getConfidenceMessage = (confidence) => {
    if (confidence >= 80) return 'Perfect match! 🎯';
    if (confidence >= 60) return 'Great fit! 👍';
    if (confidence >= 40) return 'Good match! ✨';
    return 'Let\'s explore together! 🔍';
  };

  const getGradientColors = (segment) => {
    const colorMap = {
      strength_seeker: ['#FF6B35', '#F7931E'],
      calorie_crusher: ['#FF1744', '#FF5722'],
      body_optimizer: ['#7C4DFF', '#9C27B0'],
      wellness_seeker: ['#00BCD4', '#009688'],
      endurance_athlete: ['#4CAF50', '#8BC34A'],
      habit_builder: ['#FF9800', '#FFC107'],
      social_enthusiast: ['#E91E63', '#F06292'],
      unassigned: ['#9E9E9E', '#757575'],
    };
    return colorMap[segment] || colorMap.unassigned;
  };

  const handleContinue = () => {
    navigation.navigate('Dashboard');
  };

  const handleRetakeSurvey = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: segmentConfig?.colorScheme || '#007AFF' }]}>
          <Animated.View style={[styles.heroContent, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.heroTitle}>Meet Your Gymmy!</Text>
            <Text style={styles.heroSubtitle}>We've found your perfect fitness companion</Text>
            
            {/* Gymmy Avatar Placeholder */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.avatarEmoji}>💪</Text>
              </View>
            </View>
            
            <Text style={styles.segmentName}>{segmentConfig?.name}</Text>
            <Text style={styles.confidenceText}>{getConfidenceMessage(confidence)}</Text>
          </Animated.View>
        </View>

        {/* Segment Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Fitness Profile</Text>
          <Text style={styles.segmentDescription}>
            {segmentConfig?.description}
          </Text>
          
          <View style={styles.confidenceBar}>
            <Text style={styles.confidenceLabel}>Match Confidence</Text>
            <View style={styles.confidenceBarBackground}>
              <Animated.View 
                style={[
                  styles.confidenceBarFill,
                  { 
                    width: `${confidence}%`,
                    backgroundColor: segmentConfig?.colorScheme || '#007AFF',
                  },
                ]} 
              />
            </View>
            <Text style={styles.confidencePercentage}>{confidence}%</Text>
          </View>

          {secondarySegment && (
            <View style={styles.secondarySegment}>
              <Text style={styles.secondaryTitle}>Secondary Traits</Text>
              <Text style={styles.secondaryText}>
                You also show strong {secondaryConfig?.name.toLowerCase()} characteristics
              </Text>
            </View>
          )}
        </View>

        {/* What This Means */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This Means for You</Text>
          
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={24} color={segmentConfig?.colorScheme} />
              <Text style={styles.featureTitle}>Primary Focus</Text>
              <Text style={styles.featureDescription}>
                {segmentConfig?.primaryMetrics?.join(', ') || 'General fitness'}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="heart" size={24} color={segmentConfig?.colorScheme} />
              <Text style={styles.featureTitle}>Motivation Style</Text>
              <Text style={styles.featureDescription}>
                {segmentConfig?.['gymmy-personality']} coaching approach
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="fitness" size={24} color={segmentConfig?.colorScheme} />
              <Text style={styles.featureTitle}>Preferred Exercises</Text>
              <Text style={styles.featureDescription}>
                {segmentConfig?.preferredExercises?.slice(0, 2)?.join(', ') || 'Varied workouts'}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="star" size={24} color={segmentConfig?.colorScheme} />
              <Text style={styles.featureTitle}>Celebration Style</Text>
              <Text style={styles.featureDescription}>
                {segmentConfig?.celebrationStyle} recognition
              </Text>
            </View>
          </View>
        </View>

        {/* Your Personalized Goals */}
        {goals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your First Goals</Text>
            <Text style={styles.goalsDescription}>
              Based on your profile, here are some goals to get you started:
            </Text>
            
            {goals.slice(0, 3).map((goal, index) => (
              <View key={goal.id} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <View style={[styles.priorityBadge, 
                    goal.priority === 'high' && styles.highPriority,
                    goal.priority === 'medium' && styles.mediumPriority,
                    goal.priority === 'low' && styles.lowPriority,
                  ]}>
                    <Text style={styles.priorityText}>{goal.priority}</Text>
                  </View>
                </View>
                <Text style={styles.goalDescription}>{goal.description}</Text>
                <View style={styles.goalProgress}>
                  <Text style={styles.goalTarget}>
                    Target: {goal.targetValue} {goal.unit} ({goal.timeframe})
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ready to Start?</Text>
          <Text style={styles.nextStepsDescription}>
            Your personalized Gymmy experience is ready! Your dashboard, goals, and motivation 
            system have been customized just for you.
          </Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.benefitText}>Personalized dashboard and metrics</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.benefitText}>Custom goals that match your values</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.benefitText}>Gymmy companion tailored to your style</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.benefitText}>1% better tracking for your priorities</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: segmentConfig?.colorScheme || '#007AFF' }]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start My Journey</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleRetakeSurvey}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Retake Survey</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don&apos;t worry - you can always adjust your preferences and goals as you grow! 
            Gymmy evolves with you on your fitness journey.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 32,
    textAlign: 'center',
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  segmentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  segmentDescription: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
    marginBottom: 24,
  },
  confidenceBar: {
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  confidenceBarBackground: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidencePercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'right',
  },
  secondarySegment: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d',
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 14,
    color: '#6c757d',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 16,
  },
  goalsDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
    lineHeight: 20,
  },
  goalItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  highPriority: {
    backgroundColor: '#dc3545',
  },
  mediumPriority: {
    backgroundColor: '#ffc107',
  },
  lowPriority: {
    backgroundColor: '#28a745',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 18,
  },
  goalProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTarget: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  nextStepsDescription: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
    marginBottom: 20,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 12,
    flex: 1,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});