# Gymmy

A comprehensive fitness tracking app with advanced gamification, built with React Native and Expo. Features a unique class-based progression system, gacha mechanics, character collection, and World of Warcraft-style leveling for weightlifting and cardio activities.

## 🎮 Core Features

### 🏋️ Advanced Workout Tracking
- **Exercise Categories**: Chest, Back, Legs, Shoulders, Biceps, Triceps, Abs
- **Detailed Exercise Library**: 40+ pre-defined exercises with progression tracking
- **Set/Rep/Weight Tracking**: Log sets, reps, and weight for each exercise
- **Cardio Integration**: Track duration, distance, heart rate, and pace
- **Workout Templates**: Pre-built and customizable workout routines
- **Notes & Ratings**: Add personal notes and rate workout satisfaction
- **Rest Day Management**: Track and manage rest days with notes

### 🎯 Class-Based Progression System
- **5 Unique Classes**: Powerlifter, Bodybuilder, Athlete, Yogi, Hybrid
- **Class Bonuses**: Specialized XP multipliers for different training styles
- **Skill Trees**: Unique progression paths for each class
- **Class Selection**: Choose your fitness path with permanent bonuses
- **Stats System**: Power, Technique, Endurance, Flexibility, Mental attributes

### 🎰 Gacha & Character Collection
- **Gacha System**: Pull characters with different rarities (Common to Legendary)
- **Character Collection**: Collect and display unique fitness characters
- **Currency System**: Earn gems through workouts and achievements
- **Pull Mechanics**: Single pulls (10 gems) and 10-pulls (90 gems)
- **Rarity System**: Common (60%), Rare (30%), Epic (8%), Legendary (2%)

### 🏆 Enhanced Gamification
- **WoW-Style Leveling**: Exponential XP curve with 100+ levels
- **Multiple XP Sources**: Workouts, achievements, quests, class bonuses
- **Achievement System**: 50+ achievements across 8 categories
- **Quest System**: Daily and weekly challenges with XP rewards
- **Muscle Group Mastery**: Separate progression for each muscle group
- **Rarity Indicators**: Visual progression from Common to Immortal

### 📊 Advanced Analytics & Progress
- **One-Rep Max Tracking**: Monitor strength gains over time
- **Progressive Overload**: Track weight increases and progression
- **Strength Levels**: Beginner, Intermediate, Advanced classifications
- **Body Weight Tracking**: Record and visualize weight trends
- **Workout Analytics**: Comprehensive statistics and charts
- **Class-Specific Stats**: Track progress within your chosen class
- **Workout Calendar**: Visual calendar with rest day integration

### 🎨 Social Features
- **Workout Posts**: Share your achievements with photos and captions
- **Post Verification**: Verify workout completion with photo evidence
- **Like System**: Interact with other users' workout posts
- **Community Features**: Build a fitness community

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/davidh216/workout-journal.git
   cd workout-journal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   - **Web**: Press `w` in the terminal
   - **iOS**: Press `i` in the terminal (requires iOS Simulator)
   - **Android**: Press `a` in the terminal (requires Android Studio)

## 🏗️ Project Structure

```
gymmy/
├── App.js                          # Main app with navigation setup
├── package.json                    # Dependencies and scripts
├── app.json                       # Expo configuration
├── src/
│   ├── components/
│   │   ├── AchievementQuestDisplay.js  # Achievement and quest UI
│   │   ├── AnalyticsCharts.js          # Progress visualization
│   │   ├── AnalyticsPreview.js         # Stats preview
│   │   ├── BodyWeightTracker.js        # Weight tracking
│   │   ├── CharacterDetailModal.js     # Character details
│   │   ├── ClassDashboardWidget.js     # Class-specific dashboard
│   │   ├── EditWorkoutModal.js         # Workout editing
│   │   ├── EnhancedGamificationStats.js # Advanced stats display
│   │   ├── GachaComponents.js          # Gacha pull interface
│   │   ├── GamificationStats.js        # Level and XP display
│   │   ├── MiniWeeklyChart.js          # Weekly progress
│   │   ├── MotivationalQuote.js        # Daily quotes
│   │   ├── QuestDisplay.js             # Quest tracking
│   │   ├── SimpleCharts.js             # Basic charts
│   │   └── WorkoutCalendar.js          # Calendar view with rest days
│   ├── context/
│   │   ├── AppContext.tsx              # Global state management
│   │   ├── GameData.ts                 # Game constants and data
│   │   ├── GameLogic.ts                # Game calculation functions
│   │   ├── GameReducer.ts              # State reducer logic
│   │   ├── index.ts                    # Context exports
│   │   └── types.ts                    # TypeScript type definitions
│   ├── screens/
│   │   ├── AchievementsScreen.js       # Achievement system
│   │   ├── CharacterCollectionScreen.js # Character collection
│   │   ├── ClassSelectionScreen.js     # Class selection
│   │   ├── DashboardScreen.js          # Main dashboard
│   │   ├── GachaScreen.js             # Gacha pulls
│   │   ├── ProgressScreen.js           # Progress monitoring
│   │   ├── PullResults.js              # Gacha results
│   │   ├── SettingsScreen.js           # App settings
│   │   └── WorkoutScreen.js            # Workout tracking
│   ├── utils/
│   │   └── StorageManager.js           # Data persistence
│   └── constants/
│       └── designTokens.js             # Design system constants
└── README.md
```

## 🎯 Usage Guide

### Getting Started
1. **Choose Your Class**: Select from 5 unique fitness classes
2. **Start Working Out**: Track your exercises and progress
3. **Earn Currency**: Complete workouts to earn gems
4. **Pull Characters**: Use gems to pull characters in the gacha
5. **Level Up**: Progress through the class system and unlock bonuses
6. **Track Rest Days**: Add rest days to your calendar for recovery

### Class System
- **Powerlifter**: Strength-focused with compound lift bonuses
- **Bodybuilder**: Aesthetics-focused with isolation exercise bonuses
- **Athlete**: Performance-focused with cardio and functional bonuses
- **Yogi**: Balance-focused with flexibility and mindfulness bonuses
- **Hybrid**: Versatile with balanced bonuses across all areas

### Gacha System
- **Single Pull**: 10 gems for one character
- **10-Pull**: 90 gems for 10 characters (guaranteed rare+)
- **Rarity Rates**: Common (60%), Rare (30%), Epic (8%), Legendary (2%)
- **Character Collection**: View and manage your collected characters

### Workout Tracking
1. Navigate to the **Workout** tab
2. Tap the "+" button to start a new workout
3. Select exercise categories and add exercises
4. Log sets, reps, and weight for each exercise
5. Complete the workout to earn XP and gems

### Progress Monitoring
1. Go to the **Progress** tab
2. View your overall level and class progression
3. Check muscle group mastery levels
4. Monitor achievements and quests
5. Track class-specific statistics

### Rest Day Management
1. Use the **Workout Calendar** to view your schedule
2. Tap on any date to add a rest day
3. Add optional notes about your recovery activities
4. Rest days are visually distinguished from workout days

## 🎮 Gamification System

### Experience Points (XP)
- **Base XP**: 100 XP per workout
- **Duration Bonus**: 1 XP per 3 minutes
- **Exercise Bonus**: 15 XP per exercise
- **Rating Bonus**: Up to 50 XP for high ratings (9+)
- **Streak Bonus**: Up to 100 XP for workout streaks
- **Class Bonuses**: Multipliers based on your chosen class
- **Template Bonus**: 50 XP for completing workout templates
- **Variety Bonus**: 25 XP for 5+ unique exercises

### Class-Specific Bonuses
- **Powerlifter**: 2.0x compound lift XP, 1.5x strength training XP
- **Bodybuilder**: 1.8x isolation XP, 2.0x aesthetic XP
- **Athlete**: 2.0x cardio XP, 1.7x functional XP
- **Yogi**: 2.2x flexibility XP, 2.0x balance XP
- **Hybrid**: 1.5x variety XP, 1.4x adaptability XP

### Achievement Categories
- **Consistency**: Workout frequency milestones
- **Quality**: High-rated workout achievements
- **Variety**: Exercise diversity achievements
- **Weight Training**: Strength training milestones
- **Cardio**: Cardiovascular fitness achievements
- **Template Usage**: Workout template completions
- **Social**: Sharing and community features
- **Class Mastery**: Class-specific achievements

### Quest System
- **Daily Quests**: Daily challenges with XP rewards
- **Weekly Quests**: Longer-term challenges
- **Progress Tracking**: Visual progress indicators
- **Completion Rewards**: XP bonuses for quest completion

## 💎 Currency & Economy

### Gems System
- **Earning Gems**: Complete workouts, achievements, and quests
- **Single Pull**: 10 gems
- **10-Pull**: 90 gems (10% discount)
- **Guaranteed Rarity**: 10-pulls guarantee at least one rare+ character

### Character Rarities
- **Common (60%)**: Basic characters with standard bonuses
- **Rare (30%)**: Enhanced characters with better bonuses
- **Epic (8%)**: Powerful characters with significant bonuses
- **Legendary (2%)**: Ultimate characters with maximum bonuses

## 📱 User Experience

### Modern UI/UX
- **Clean Design**: Minimalist, focused interface
- **Smooth Animations**: React Native Animated API
- **Responsive Layout**: Adapts to different screen sizes
- **Intuitive Navigation**: Bottom tab navigation with stack screens

### Cross-Platform Support
- **iOS**: Full native support
- **Android**: Complete Android compatibility
- **Web**: Full web browser support
- **Local Storage**: All data stored locally on your device

### Settings & Customization
- **Demo Mode**: Comprehensive test data for exploration
- **Data Management**: Export/import functionality
- **App Preferences**: Customizable settings
- **Reset Options**: Clear data or reset to demo data

## 🛠️ Technical Stack

### Core Technologies
- **React Native**: 0.72.10
- **Expo**: ~49.0.0
- **React Navigation**: Bottom Tab + Stack Navigator
- **AsyncStorage**: Local data persistence
- **React Context API**: Global state management
- **React Native Animated API**: UI animations
- **TypeScript**: Type safety for context and game logic

### Key Dependencies
- **@react-navigation/bottom-tabs**: Navigation
- **@react-navigation/stack**: Stack navigation
- **@react-native-async-storage/async-storage**: Data storage
- **@expo/vector-icons**: Icon library
- **react-native-safe-area-context**: Safe area handling

## 🚀 Development

### Available Scripts
- `npm start`: Start Expo development server
- `npm run web`: Run on web platform
- `npm run android`: Run on Android
- `npm run ios`: Run on iOS

### Data Management
- **Local Storage**: All data stored locally via AsyncStorage
- **Demo Data**: Comprehensive test data for development
- **Data Reset**: Function to clear and populate with test data
- **Cross-Platform**: Consistent data handling across platforms

## 🔧 Recent Updates & Fixes

### ✅ Completed Fixes
1. **WorkoutCalendar.js**: Fixed syntax errors and completed legend section
2. **AppContext.tsx**: Added missing rest day functions (`addRestDay`, `updateRestDay`, `removeRestDay`)
3. **ProgressScreen.js**: Fixed critical undefined property errors with comprehensive null checks
4. **DashboardScreen.js**: Fixed navigation to non-existent Analytics screen
5. **StorageManager import**: Added missing import in ProgressScreen
6. **Demo Mode Error**: Fixed undefined currencies property error in gacha system
7. **Type Safety**: Enhanced TypeScript integration for better error prevention
8. **Modular Architecture**: Separated game logic into dedicated modules

### 🎯 Current Status
- ✅ **All Components Functional**: No runtime errors
- ✅ **Rest Day Integration**: Complete rest day management system
- ✅ **Demo Mode Stable**: Error-free demo mode activation
- ✅ **Cross-Platform**: Works consistently on web and mobile
- ✅ **Type Safety**: Enhanced TypeScript integration
- ✅ **Performance**: Optimized with proper null checks and error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across platforms
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ using React Native and Expo**

*Gymmy - Level up your fitness journey!* 
