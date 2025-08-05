# Gymmy

A comprehensive workout tracking app for weightlifting and cardio activities, built with React Native and Expo. Features an advanced gamification system with World of Warcraft-style leveling, achievements, quests, and muscle group mastery.

## Features

### 🏋️ Weightlifting Tracking
- **Exercise Categories**: Chest, Back, Legs, Shoulders, Biceps, Triceps, Abs
- **Detailed Exercise Library**: 40+ pre-defined exercises
- **Set/Rep/Weight Tracking**: Log sets, reps, and weight for each exercise
- **Notes**: Add personal notes for each exercise

### 🏃‍♂️ Cardio Tracking
- **Walking Activities**: Track duration, distance, heart rate, pace
- **Route Tracking**: GPS-based route recording
- **Intensity Levels**: Rate workout intensity
- **Notes**: Add notes about your cardio sessions

### 🎮 Advanced Gamification System
- **WoW-Style Leveling**: Exponential XP curve with 100+ levels
- **Experience Points**: Earn XP through workouts, achievements, and quests
- **Achievement System**: 50+ achievements across 8 categories
- **Quest System**: Daily and weekly challenges with XP rewards
- **Muscle Group Mastery**: Separate progression system for each muscle group
- **Rarity System**: Visual indicators (Common to Immortal) for levels

### 📊 Progress Monitoring
- **One-Rep Max Tracking**: Monitor strength gains over time
- **Progressive Overload**: Track weight increases
- **Strength Levels**: Beginner, Intermediate, Advanced classifications
- **Progress Visualization**: Charts and statistics
- **Body Weight Tracking**: Record and visualize weight trends

### 🎯 Workout Ratings & Analytics
- **Pre/Post Workout Ratings**: Mood and energy levels (0-10)
- **Workout Quality**: Rate overall workout satisfaction
- **Soreness Tracking**: Daily muscle group soreness ratings (0-10)
- **Analytics Dashboard**: Comprehensive workout statistics

### 📱 User Experience
- **Minimalist Design**: Clean, focused interface
- **Cross-Platform**: Works on mobile and web
- **Local Storage**: All data stored locally on your device
- **Settings**: Customizable preferences and units
- **Demo Mode**: Comprehensive test data for exploration

## Getting Started

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

## Project Structure

```
gym-journal/
├── App.js                 # Main app component with navigation
├── package.json           # Dependencies and scripts
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── src/
│   ├── components/
│   │   ├── AnalyticsCharts.js      # Progress visualization
│   │   ├── AnalyticsPreview.js     # Stats preview
│   │   ├── BodyWeightTracker.js    # Weight tracking
│   │   ├── EditWorkoutModal.js     # Workout editing
│   │   ├── GamificationStats.js    # Level and XP display
│   │   ├── MiniWeeklyChart.js      # Weekly progress
│   │   ├── MotivationalQuote.js    # Daily quotes
│   │   ├── SimpleCharts.js         # Basic charts
│   │   └── WorkoutCalendar.js      # Calendar view
│   ├── context/
│   │   └── AppContext.js           # Global state management
│   ├── screens/
│   │   ├── AchievementsScreen.js   # Achievement system
│   │   ├── DashboardScreen.js      # Main dashboard
│   │   ├── ProgressScreen.js       # Progress monitoring
│   │   ├── SettingsScreen.js       # App settings
│   │   └── WorkoutScreen.js        # Workout tracking
│   └── utils/
│       └── StorageManager.js       # Data persistence
└── README.md
```

## Usage

### Starting a Workout
1. Navigate to the **Workout** tab
2. Tap the "+" button in the top right
3. Select exercise categories (Chest, Back, etc.)
4. Add exercises to your workout
5. Log sets, reps, and weight
6. Finish workout when complete

### Gamification Features
1. **Level Up**: Complete workouts to earn XP and level up
2. **Achievements**: Unlock achievements for milestones
3. **Quests**: Complete daily and weekly challenges
4. **Muscle Mastery**: Progress individual muscle group levels

### Tracking Progress
1. Go to the **Progress** tab
2. View your overall level and XP progress
3. Check muscle group mastery levels
4. Monitor achievements and quests

### Daily Ratings
- Rate your mood and energy before/after workouts
- Track daily soreness for each muscle group
- Monitor workout quality and satisfaction

## Gamification System

### Experience Points (XP)
- **Base XP**: 100 XP per workout
- **Duration Bonus**: 1 XP per 3 minutes
- **Exercise Bonus**: 15 XP per exercise
- **Rating Bonus**: Up to 50 XP for high ratings (9+)
- **Streak Bonus**: Up to 100 XP for workout streaks
- **Template Bonus**: 50 XP for completing workout templates
- **Variety Bonus**: 25 XP for 5+ unique exercises

### Achievement Categories
- **Consistency**: Workout frequency milestones
- **Quality**: High-rated workout achievements
- **Variety**: Exercise diversity achievements
- **Weight Training**: Strength training milestones
- **Cardio**: Cardiovascular fitness achievements
- **Template Usage**: Workout template completions
- **Social**: Sharing and community features

### Quest System
- **Daily Quests**: Daily challenges with XP rewards
- **Weekly Quests**: Longer-term challenges
- **Progress Tracking**: Visual progress indicators
- **Completion Rewards**: XP bonuses for quest completion

## Data Management

### Local Storage
- All workout data is stored locally on your device
- No cloud synchronization required
- Data is private and secure

### Export/Import
- Export your data to JSON format
- Import data from backup files
- Clear all data if needed
- Demo mode with comprehensive test data

## Settings

### Preferences
- **Notifications**: Enable/disable workout reminders
- **Auto Save**: Automatically save workout data
- **Dark Mode**: Toggle dark/light theme
- **Units**: Switch between lbs and kg
- **Demo Mode**: Toggle comprehensive test data

### Tracking Options
- **Workout Ratings**: Enable/disable rating prompts
- **Soreness Ratings**: Enable/disable soreness tracking

## Exercise Categories

### Chest
- Incline Bench Press (Smith)
- Bench Press
- Cable Fly (Low/Middle/High)
- Incline Dumbbell Bench Press
- Dumbbell Bench Press
- Decline Bench Press

### Back
- Lat Pulldown (Wide-grip/Close-grip)
- Deadlift
- Upright Barbell Row
- Single Arm Dumbbell Row
- Bent-Over Rows
- Pull-Ups (Weighted)

### Legs
- Barbell Squat
- Seated Leg Press
- Seated Calf Raise
- Leg Extension

### Shoulders
- Standing Barbell Shoulder Press
- Seated Dumbbell Shoulder Press
- Face Pulls
- Bent Over Reverse Fly
- Lateral Raise
- Arnold Press

### Biceps
- Standing Barbell Bicep Curl
- Preacher Curls
- Hammer Curls
- Incline Dumbbell Curls

### Triceps
- Tricep Pushdowns
- Tricep Dips
- Skullcrushers

### Abs
- Hanging Leg Raises
- Upright Ab Pulldowns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ using React Native and Expo** 
