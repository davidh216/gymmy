# Workout Journal

A comprehensive workout tracking app for weightlifting and cardio activities, built with React Native and Expo.

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

### 📊 Progress Monitoring
- **One-Rep Max Tracking**: Monitor strength gains over time
- **Progressive Overload**: Track weight increases
- **Strength Levels**: Beginner, Intermediate, Advanced classifications
- **Progress Visualization**: Charts and statistics

### 🎯 Workout Ratings
- **Pre/Post Workout Ratings**: Mood and energy levels (0-10)
- **Workout Quality**: Rate overall workout satisfaction
- **Soreness Tracking**: Daily muscle group soreness ratings (0-10)

### 📱 User Experience
- **Minimalist Design**: Clean, focused interface
- **Cross-Platform**: Works on mobile and web
- **Local Storage**: All data stored locally on your device
- **Settings**: Customizable preferences and units

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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
workout-journal/
├── App.js                 # Main app component with navigation
├── package.json           # Dependencies and scripts
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── src/
│   └── screens/
│       ├── DashboardScreen.js    # Main dashboard
│       ├── WorkoutScreen.js      # Workout tracking
│       ├── ProgressScreen.js     # Progress monitoring
│       └── SettingsScreen.js     # App settings
└── README.md
```

## Usage

### Starting a Workout
1. Navigate to the **Workout** tab
2. Tap "Begin Workout"
3. Select exercise categories (Chest, Back, etc.)
4. Add exercises to your workout
5. Log sets, reps, and weight
6. Finish workout when complete

### Tracking Progress
1. Go to the **Progress** tab
2. Add one-rep maxes for exercises
3. View strength levels and progress stats
4. Monitor your gains over time

### Daily Ratings
- Rate your mood and energy before/after workouts
- Track daily soreness for each muscle group
- Monitor workout quality and satisfaction

## Data Management

### Local Storage
- All workout data is stored locally on your device
- No cloud synchronization required
- Data is private and secure

### Export/Import
- Export your data to JSON format
- Import data from backup files
- Clear all data if needed

## Settings

### Preferences
- **Notifications**: Enable/disable workout reminders
- **Auto Save**: Automatically save workout data
- **Dark Mode**: Toggle dark/light theme
- **Units**: Switch between lbs and kg

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

**Built with ❤️ using React Native and Expo** "# workout-journal" 
