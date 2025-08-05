// src/components/OnboardingSurvey.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context';
import { 
  ONBOARDING_SURVEY_QUESTIONS, 
  getOrderedSurveyQuestions,
  validateSurveyCompletion,
  SURVEY_CONFIG 
} from '../context/SurveyQuestions';
import { SegmentationEngine } from '../context/SegmentationEngine';

const { width } = Dimensions.get('window');

export const OnboardingSurvey = ({ onComplete, onSkip }) => {
  const { userStats, updateUserStats } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [slideAnim] = useState(new Animated.Value(0));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderedQuestions = getOrderedSurveyQuestions();
  const currentQuestion = orderedQuestions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / orderedQuestions.length;

  useEffect(() => {
    // Animate in the question
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [currentQuestionIndex]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleNext = () => {
    if (!selectedOption) {
      Alert.alert('Selection Required', 'Please select an option before continuing.');
      return;
    }

    // Save response
    const newResponse = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.title,
      selectedOption: selectedOption.id,
      optionValue: selectedOption.value,
      segmentWeights: selectedOption.segmentWeights,
      timestamp: new Date().toISOString()
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Check if this is the last question
    if (currentQuestionIndex === orderedQuestions.length - 1) {
      handleSurveyComplete(updatedResponses);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      
      // Reset animation for next question
      slideAnim.setValue(0);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(null);
      
      // Remove the last response
      setResponses(responses.slice(0, -1));
      
      // Reset animation
      slideAnim.setValue(0);
    }
  };

  const handleSurveyComplete = async (finalResponses) => {
    setIsSubmitting(true);

    try {
      // Validate completion
      const validation = validateSurveyCompletion(finalResponses);
      if (!validation.isComplete) {
        Alert.alert('Survey Incomplete', 'Please complete all required questions.');
        setIsSubmitting(false);
        return;
      }

      // Calculate segment scores
      const segmentScores = SegmentationEngine.calculateSegmentScores(finalResponses);
      const segmentResult = SegmentationEngine.determinePrimarySegment(segmentScores);

      // Create survey record
      const surveyRecord = {
        id: `survey_${Date.now()}`,
        responses: finalResponses,
        calculatedSegments: segmentScores,
        recommendedSegment: segmentResult.primarySegment,
        confidence: segmentResult.confidence,
        completedAt: new Date().toISOString(),
        version: SURVEY_CONFIG.version
      };

      // Create segment profile
      const segmentProfile = SegmentationEngine.createSegmentProfile(
        surveyRecord,
        segmentResult.primarySegment,
        segmentResult.confidence,
        segmentResult.secondarySegment
      );

      // Generate personalized goals
      const personalizedGoals = SegmentationEngine.generatePersonalizedGoals(
        segmentResult.primarySegment,
        [], // No workout history yet for new users
        userStats.level || 1
      );

      // Update user stats with segmentation data
      const updatedUserStats = {
        ...userStats,
        segmentProfile,
        surveyHistory: [surveyRecord],
        personalizedGoals,
        segmentPreferences: getDefaultSegmentPreferences(segmentResult.primarySegment),
        segmentMetrics: getInitialSegmentMetrics()
      };

      await updateUserStats(updatedUserStats);

      // Call completion callback
      onComplete({
        segment: segmentResult.primarySegment,
        confidence: segmentResult.confidence,
        secondarySegment: segmentResult.secondarySegment,
        goals: personalizedGoals
      });

    } catch (error) {
      console.error('Error completing survey:', error);
      Alert.alert('Error', 'There was a problem saving your survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultSegmentPreferences = (segment) => {
    // Default preferences based on segment
    const basePreferences = {
      preferredMetrics: [],
      goalTimeframe: 'weekly',
      difficultyPreference: 'adaptive',
      celebrationStyle: 'moderate',
      reminderFrequency: 'daily',
      socialSharing: false,
      dashboardFocus: 'progress',
      chartTypes: ['line', 'bar'],
      'gymmy-personality': 'encouraging'
    };

    // Customize based on segment
    switch (segment) {
      case 'strength_seeker':
        return {
          ...basePreferences,
          preferredMetrics: ['weight_lifted', 'one_rep_max', 'total_volume'],
          celebrationStyle: 'enthusiastic',
          'gymmy-personality': 'coaching',
          dashboardFocus: 'progress'
        };
      case 'calorie_crusher':
        return {
          ...basePreferences,
          preferredMetrics: ['calories_burned', 'active_minutes', 'heart_rate_zones'],
          celebrationStyle: 'enthusiastic',
          'gymmy-personality': 'encouraging',
          dashboardFocus: 'analytics'
        };
      case 'body_optimizer':
        return {
          ...basePreferences,
          preferredMetrics: ['body_weight', 'measurements', 'progress_photos'],
          celebrationStyle: 'moderate',
          'gymmy-personality': 'analytical',
          dashboardFocus: 'progress'
        };
      case 'wellness_seeker':
        return {
          ...basePreferences,
          preferredMetrics: ['flexibility', 'stress_levels', 'sleep_quality'],
          celebrationStyle: 'minimal',
          'gymmy-personality': 'buddy',
          dashboardFocus: 'wellness'
        };
      case 'endurance_athlete':
        return {
          ...basePreferences,
          preferredMetrics: ['pace', 'distance', 'race_times'],
          celebrationStyle: 'moderate',
          'gymmy-personality': 'coaching',
          dashboardFocus: 'analytics'
        };
      case 'habit_builder':
        return {
          ...basePreferences,
          preferredMetrics: ['consistency', 'streaks', 'frequency'],
          celebrationStyle: 'enthusiastic',
          'gymmy-personality': 'encouraging',
          dashboardFocus: 'goals'
        };
      case 'social_enthusiast':
        return {
          ...basePreferences,
          preferredMetrics: ['social_engagement', 'group_workouts', 'community'],
          celebrationStyle: 'enthusiastic',
          'gymmy-personality': 'buddy',
          dashboardFocus: 'social',
          socialSharing: true
        };
      default:
        return basePreferences;
    }
  };

  const getInitialSegmentMetrics = () => ({
    dailyActiveRate: 0,
    weeklyRetentionRate: 0,
    goalCompletionRate: 0,
    featureUsageRates: {},
    satisfactionScore: 0,
    averageProgressRate: 0,
    milestoneHitRate: 0,
    consistencyScore: 0,
    lastCalculated: new Date().toISOString()
  });

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No questions available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { width: `${progress * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} of {orderedQuestions.length}
          </Text>
        </View>
        
        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.questionContainer,
            {
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
          {currentQuestion.description && (
            <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
          )}

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedOption?.id === option.id && styles.selectedOption,
                ]}
                onPress={() => handleOptionSelect(option)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    {option.emoji && (
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    )}
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionText,
                        selectedOption?.id === option.id && styles.selectedOptionText
                      ]}>
                        {option.text}
                      </Text>
                      {option.description && (
                        <Text style={[
                          styles.optionDescription,
                          selectedOption?.id === option.id && styles.selectedOptionDescription
                        ]}>
                          {option.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedOption?.id === option.id && styles.selectedRadio
                  ]}>
                    {selectedOption?.id === option.id && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={currentQuestionIndex === 0 ? '#ccc' : '#007AFF'} 
          />
          <Text style={[
            styles.navButtonText,
            currentQuestionIndex === 0 && styles.disabledButtonText
          ]}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={[
            styles.nextButton,
            !selectedOption && styles.disabledNextButton,
            isSubmitting && styles.submittingButton
          ]}
          disabled={!selectedOption || isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.nextButtonText}>Processing...</Text>
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex === orderedQuestions.length - 1 ? 'Complete' : 'Next'}
              </Text>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  progressContainer: {
    flex: 1,
    marginRight: 20,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    paddingVertical: 30,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
    lineHeight: 30,
  },
  questionDescription: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
  },
  selectedOptionDescription: {
    color: '#4a90e2',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  selectedRadio: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  disabledButtonText: {
    color: '#ccc',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  disabledNextButton: {
    backgroundColor: '#dee2e6',
  },
  submittingButton: {
    backgroundColor: '#6c757d',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 50,
  },
});