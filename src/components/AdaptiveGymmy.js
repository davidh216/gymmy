// src/components/AdaptiveGymmy.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context';

export const AdaptiveGymmy = ({ context = 'general', workoutData = null }) => {
  const { getCurrentSegment, getSegmentConfig, state } = useApp();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(true);

  const segment = getCurrentSegment();
  const segmentConfig = getSegmentConfig();

  useEffect(() => {
    if (segment && segmentConfig) {
      const message = getContextualMessage(segment, context, workoutData, state.userStats);
      setCurrentMessage(message);
      
      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [segment, context, workoutData]);

  if (!segment || !segmentConfig || !showMessage) {
    return null;
  }

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowMessage(false);
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          borderLeftColor: segmentConfig.colorScheme 
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.gymmyInfo}>
          <View style={[styles.gymmyAvatar, { backgroundColor: segmentConfig.colorScheme + '20' }]}>
            <Text style={styles.gymmyEmoji}>
              {getGymmyEmoji(segment, context)}
            </Text>
          </View>
          <View style={styles.gymmyDetails}>
            <Text style={styles.gymmyName}>
              {getGymmyName(segment)}
            </Text>
            <Text style={styles.gymmyRole}>
              Your {segmentConfig.name} Companion
            </Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={16} color="#6c757d" />
        </TouchableOpacity>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.message}>{currentMessage}</Text>
        
        {getContextualAction(segment, context) && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: segmentConfig.colorScheme }]}
            onPress={() => handleAction(getContextualAction(segment, context))}
          >
            <Text style={styles.actionButtonText}>
              {getContextualAction(segment, context).text}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  function handleAction(action) {
    // Handle different action types
    switch (action.type) {
      case 'start_workout':
        // Navigate to workout
        break;
      case 'log_progress':
        // Navigate to progress logging
        break;
      case 'celebrate':
        // Show celebration animation
        break;
      default:
        break;
    }
  }
};

// Helper functions for generating contextual content
const getContextualMessage = (segment, context, workoutData, userStats) => {
  const messages = getSegmentMessages(segment);
  
  switch (context) {
    case 'workout_start':
      return messages.workoutStart[Math.floor(Math.random() * messages.workoutStart.length)];
    
    case 'workout_complete':
      return getWorkoutCompleteMessage(segment, workoutData);
    
    case 'goal_achieved':
      return messages.goalAchieved[Math.floor(Math.random() * messages.goalAchieved.length)];
    
    case 'streak_milestone':
      return getStreakMessage(segment, userStats);
    
    case 'motivation_needed':
      return messages.motivation[Math.floor(Math.random() * messages.motivation.length)];
    
    case 'general':
    default:
      return messages.general[Math.floor(Math.random() * messages.general.length)];
  }
};

const getSegmentMessages = (segment) => {
  const messageBank = {
    strength_seeker: {
      general: [
        "Ready to move some serious weight today? 💪",
        "Every rep is building your empire. Let's dominate!",
        "Iron doesn't lie - let's see what you're made of!",
        "Time to turn iron into strength. You've got this!"
      ],
      workoutStart: [
        "Let's chase some PRs! Form first, then power! 🔥",
        "Time to make the weights your playground!",
        "Every lift is a step toward greatness. Let's go!",
        "Channel that inner beast - controlled aggression wins!"
      ],
      goalAchieved: [
        "BEAST MODE ACTIVATED! That PR was incredible! 🏆",
        "You just crushed that goal like it was nothing!",
        "Strength earned, respect given. You're unstoppable!",
        "The iron has been conquered. What's next, champion?"
      ],
      motivation: [
        "Champions are built in moments like this. Push through!",
        "Your future strong self is cheering you on right now!",
        "Consistency beats perfection. Show up, lift up!",
        "Every rep you don't take is a rep someone else will!"
      ]
    },
    
    calorie_crusher: {
      general: [
        "Ready to ignite that metabolic fire? 🔥",
        "Energy is everything - let's turn it up!",
        "Time to melt some calories and feel amazing!",
        "Your engine is warming up. Let's rev it!"
      ],
      workoutStart: [
        "Let's turn up the heat and torch those calories! 🔥",
        "Time to get that heart pumping and sweat flowing!",
        "Energy in, energy out - let's tip the scales!",
        "Ready to feel that burn? Let's light it up!"
      ],
      goalAchieved: [
        "ON FIRE! You just crushed that calorie goal! 🔥",
        "That metabolic furnace is running hot today!",
        "Energy unleashed! You're a calorie-crushing machine!",
        "Feeling that afterburn? That's success burning bright!"
      ],
      motivation: [
        "Every heartbeat is progress. Keep that fire burning!",
        "Your metabolism thanks you for every minute of effort!",
        "Energy creates energy. The more you give, the more you get!",
        "That sweat is just your awesomeness leaking out!"
      ]
    },
    
    body_optimizer: {
      general: [
        "Transformation happens one choice at a time ✨",
        "Your body is your masterpiece in progress!",
        "Consistency is the sculptor - let's keep chiseling!",
        "Every workout writes your transformation story!"
      ],
      workoutStart: [
        "Time to sculpt greatness! Every rep shapes your future!",
        "Your body is listening - let's give it clear instructions!",
        "Transformation mode: ON. Let's build something amazing!",
        "This workout is another chapter in your success story!"
      ],
      goalAchieved: [
        "TRANSFORMATION MILESTONE! You're becoming unstoppable! ⚖️",
        "That dedication is showing in every way!",
        "Your commitment is paying dividends. Keep investing!",
        "Progress made visible - you're rewriting your story!"
      ],
      motivation: [
        "Rome wasn't built in a day, but they worked on it every day!",
        "Your future self is thanking you for this effort right now!",
        "Small changes, compound results. Trust the process!",
        "Every workout is a vote for the person you're becoming!"
      ]
    },
    
    wellness_seeker: {
      general: [
        "Balance is strength, peace is power 🧘",
        "Let's nurture both body and mind today!",
        "Wellness is a journey, not a destination!",
        "Your inner and outer strength are growing together!"
      ],
      workoutStart: [
        "Let's flow with intention and move with mindfulness!",
        "Time to connect mind, body, and breath. You've got this!",
        "This movement is medicine for your soul!",
        "Let's create harmony between strength and serenity!"
      ],
      goalAchieved: [
        "CENTERED AND STRONG! That balance is beautiful! 🌿",
        "Your dedication to wellness is truly inspiring!",
        "Body and mind in harmony - that's true strength!",
        "You've found your flow and it's magnificent!"
      ],
      motivation: [
        "Progress in wellness is measured in peace, not just power!",
        "Every mindful moment is a step toward your best self!",
        "Flexibility of body, strength of mind - you're building both!",
        "Listen to your body, honor your limits, celebrate your growth!"
      ]
    },
    
    endurance_athlete: {
      general: [
        "Every mile is a victory, every step is progress! 🏃",
        "Endurance is earned through consistency and courage!",
        "Your limits are suggestions - let's rewrite them!",
        "Distance is just a number when your heart is strong!"
      ],
      workoutStart: [
        "Time to chase those horizons! Pace yourself for greatness!",
        "Let's build that engine - steady, strong, unstoppable!",
        "Every step forward is a step toward your potential!",
        "Find your rhythm and trust your training!"
      ],
      goalAchieved: [
        "DISTANCE DOMINATED! You just leveled up your endurance! 🏆",
        "That pace improvement is pure determination in action!",
        "Miles conquered, limits expanded - you're unstoppable!",
        "Your endurance engine is running at peak performance!"
      ],
      motivation: [
        "Champions are made in the miles when no one's watching!",
        "Your cardiovascular system is getting stronger every day!",
        "Endurance isn't just physical - it's mental resilience too!",
        "Every breath, every step, every heartbeat - it all counts!"
      ]
    },
    
    habit_builder: {
      general: [
        "Consistency is your superpower! 🎯",
        "Small steps daily create massive transformations!",
        "You're building habits that will change your life!",
        "Every day you show up, you're winning!"
      ],
      workoutStart: [
        "Another day, another opportunity to build greatness!",
        "Consistency compounds - let's make another deposit!",
        "This workout is your commitment to future you!",
        "Showing up is half the battle - you're already winning!"
      ],
      goalAchieved: [
        "STREAK STRONG! Your consistency is paying off! 📈",
        "Habit strength: MAXIMUM! You're unstoppable now!",
        "Day by day, choice by choice - look what you've built!",
        "That discipline is your foundation for everything!"
      ],
      motivation: [
        "Champions aren't made overnight - they're made every night!",
        "Your future self is built from today's choices!",
        "Consistency beats perfection every single time!",
        "Every small effort compounds into extraordinary results!"
      ]
    },
    
    social_enthusiast: {
      general: [
        "Together we're stronger! Let's lift each other up! 🤝",
        "Your energy inspires everyone around you!",
        "Community makes everything better - especially fitness!",
        "You're not just working out, you're building connections!"
      ],
      workoutStart: [
        "Let's show this workout what teamwork looks like!",
        "Your energy is contagious - spread those good vibes!",
        "Time to be the motivation someone else needs today!",
        "Every workout is better when we're in it together!"
      ],
      goalAchieved: [
        "COMMUNITY CHAMPION! Your success lifts everyone up! 🌟",
        "That achievement inspires everyone around you!",
        "Leading by example - that's true leadership!",
        "Your success creates ripples of motivation!"
      ],
      motivation: [
        "You're not just improving yourself - you're inspiring others!",
        "Every encouragement you give comes back multiplied!",
        "Together we rise, together we succeed!",
        "Your positive energy is a gift to your fitness community!"
      ]
    }
  };

  return messageBank[segment] || messageBank.strength_seeker;
};

const getWorkoutCompleteMessage = (segment, workoutData) => {
  if (!workoutData) return "Great workout! You showed up and that's what matters!";
  
  const duration = Math.round(workoutData.duration || 0);
  const exerciseCount = workoutData.exercises?.length || 0;
  
  const completionMessages = {
    strength_seeker: [
      `${duration} minutes of pure power! ${exerciseCount} exercises conquered! 💪`,
      `Iron dominated! That ${duration}-minute session was legendary!`,
      `${exerciseCount} exercises crushed in ${duration} minutes. Beast mode activated!`
    ],
    calorie_crusher: [
      `${duration} minutes of fire! You torched it today! 🔥`,
      `That ${duration}-minute burn session was incredible!`,
      `${exerciseCount} exercises in ${duration} minutes - metabolic machine!`
    ],
    body_optimizer: [
      `${duration} minutes invested in your transformation! ✨`,
      `Another ${duration} minutes closer to your goals!`,
      `${exerciseCount} exercises shaping your future self!`
    ],
    wellness_seeker: [
      `${duration} minutes of mindful movement completed! 🧘`,
      `Body and mind aligned for ${duration} beautiful minutes!`,
      `${exerciseCount} movements of pure intention and strength!`
    ],
    endurance_athlete: [
      `${duration} minutes of endurance excellence! 🏃`,
      `That ${duration}-minute session built serious stamina!`,
      `Engine strengthened through ${duration} minutes of dedication!`
    ],
    habit_builder: [
      `Another day, another victory! ${duration} minutes of consistency! 🎯`,
      `${duration} minutes closer to unbreakable habits!`,
      `Day by day, workout by workout - you're building greatness!`
    ],
    social_enthusiast: [
      `${duration} minutes of awesome - time to share the victory! 🤝`,
      `That ${duration}-minute workout was inspiring!`,
      `${exerciseCount} exercises completed - your community is proud!`
    ]
  };

  const messages = completionMessages[segment] || completionMessages.strength_seeker;
  return messages[Math.floor(Math.random() * messages.length)];
};

const getStreakMessage = (segment, userStats) => {
  // Generate streak-specific messaging based on segment
  const streakCount = userStats.workoutStreak || 0;
  
  if (streakCount >= 7) {
    return `🔥 ${streakCount} days strong! Your consistency is legendary!`;
  } else if (streakCount >= 3) {
    return `💪 ${streakCount}-day streak building! Momentum is growing!`;
  } else {
    return `🎯 Every day counts! Keep building that streak!`;
  }
};

const getGymmyEmoji = (segment, context) => {
  const contextEmojis = {
    strength_seeker: {
      general: '💪',
      workout_start: '🔥',
      goal_achieved: '🏆',
      motivation_needed: '💯'
    },
    calorie_crusher: {
      general: '🔥',
      workout_start: '⚡',
      goal_achieved: '🌟',
      motivation_needed: '💥'
    },
    body_optimizer: {
      general: '✨',
      workout_start: '🎯',
      goal_achieved: '⚖️',
      motivation_needed: '📈'
    },
    wellness_seeker: {
      general: '🧘',
      workout_start: '🌿',
      goal_achieved: '☯️',
      motivation_needed: '🌸'
    },
    endurance_athlete: {
      general: '🏃',
      workout_start: '🎽',
      goal_achieved: '🥇',
      motivation_needed: '🚀'
    },
    habit_builder: {
      general: '🎯',
      workout_start: '📅',
      goal_achieved: '📈',
      motivation_needed: '⭐'
    },
    social_enthusiast: {
      general: '🤝',
      workout_start: '👥',
      goal_achieved: '🎉',
      motivation_needed: '💖'
    }
  };

  return contextEmojis[segment]?.[context] || contextEmojis[segment]?.general || '💪';
};

const getGymmyName = (segment) => {
  const names = {
    strength_seeker: 'Power Gymmy',
    calorie_crusher: 'Blaze Gymmy',
    body_optimizer: 'Transform Gymmy',
    wellness_seeker: 'Zen Gymmy',
    endurance_athlete: 'Pace Gymmy',
    habit_builder: 'Steady Gymmy',
    social_enthusiast: 'Rally Gymmy'
  };
  
  return names[segment] || 'Gymmy';
};

const getContextualAction = (segment, context) => {
  if (context === 'workout_complete') {
    return {
      type: 'celebrate',
      text: 'Share This Win!'
    };
  }
  
  if (context === 'motivation_needed') {
    return {
      type: 'start_workout',
      text: 'Let\'s Do This!'
    };
  }
  
  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gymmyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gymmyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gymmyEmoji: {
    fontSize: 20,
  },
  gymmyDetails: {
    flex: 1,
  },
  gymmyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  gymmyRole: {
    fontSize: 12,
    color: '#6c757d',
  },
  dismissButton: {
    padding: 4,
  },
  messageContainer: {
    gap: 12,
  },
  message: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});