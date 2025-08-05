# Gymmy

A comprehensive fitness tracking app with advanced gamification, built with React Native and Expo. Features a unique class-based progression system, gacha mechanics, character collection, and World of Warcraft-style leveling for weightlifting and cardio activities.

**🎯 Core Philosophy: "1% Better Every Day"** - Gymmy champions the power of small, consistent improvements that compound into extraordinary transformations over time.

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
- **Multi-Gymmy System**: Collect different types of Gymmy companions (Coming Soon!)
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
- **1% Better Tracking**: Micro-improvement detection and celebration
- **One-Rep Max Tracking**: Monitor strength gains over time
- **Progressive Overload**: Track weight increases and progression
- **Strength Levels**: Beginner, Intermediate, Advanced classifications
- **Body Weight Tracking**: Record and visualize weight trends
- **Workout Analytics**: Comprehensive statistics and charts
- **Class-Specific Stats**: Track progress within your chosen class
- **Workout Calendar**: Visual calendar with rest day integration

### 🎨 Social Features (Coming Soon!)
- **Workout Posts**: Share your achievements with photos and captions
- **Post Verification**: Verify workout completion with photo evidence
- **Like System**: Interact with other users' workout posts
- **Community Features**: Build a fitness community
- **Virtual Events**: Compete in Spartan races and marathons with AI opponents

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

## 🎯 User Segments & Personalization

Gymmy adapts to celebrate what YOU value most in fitness:

### 🏋️ The Strength Seekers (Power & PRs)
**Values**: Personal records, strength milestones, progressive overload
**1% Better**: +5lbs on lifts, +1 rep at current weight, improved form

### 🔥 The Calorie Crushers (Cardio & Fat Loss)
**Values**: Energy expenditure, fat burning, metabolic health
**1% Better**: +10 calories burned, +30 seconds cardio, improved pace

### ⚖️ The Body Optimizers (Weight & Composition)
**Values**: Body transformation, healthy weight management
**1% Better**: Progress toward body goals, improved measurements

### 🧘 The Flexibility & Wellness Seekers
**Values**: Mobility, mental health, mind-body connection
**1% Better**: +10 seconds flexibility hold, improved sleep quality

### 🏃‍♀️ The Endurance Athletes (Performance & Times)
**Values**: Athletic performance, race times, endurance capacity
**1% Better**: Faster pace, longer distance, improved race splits

### 🎯 The Habit Builders (Consistency & Lifestyle)
**Values**: Sustainable routines, showing up consistently
**1% Better**: +1 day consistency streak, completing planned workouts

### 🤝 The Social Fitness Enthusiasts
**Values**: Community, motivation through others, shared accountability
**1% Better**: Supporting others' goals, group workout participation

## 🗓️ Development Roadmap

### 🎯 PHASE 0: FOUNDATION & PLANNING *(Weeks 1-4)*
**Status**: ✅ **COMPLETE** - Core app foundation established

- [x] Technical architecture and TypeScript integration
- [x] Component architecture and design system
- [x] Testing framework setup
- [x] Core gamification features (classes, XP, achievements)
- [x] Basic workout tracking and analytics
- [x] Local data storage with AsyncStorage

### 🎯 PHASE 1: USER SEGMENTATION & ONBOARDING *(Weeks 5-10)*
**Status**: ✅ **COMPLETE** - Revolutionary personalization system deployed!

#### 🏆 Major Achievements:
- [x] **Complete User Segmentation System**: 7 distinct user types with sophisticated classification
- [x] **Interactive Survey System**: 7-question survey with 49 weighted response options
- [x] **Adaptive Dashboard Experiences**: Completely different layouts for each segment
- [x] **Dynamic Gymmy Personalities**: 280+ contextual messages across 7 unique companions
- [x] **Personalized Goal Generation**: Goals that align with individual user values
- [x] **Enhanced State Management**: Full segmentation integration in AppContext
- [x] **Beautiful Onboarding Flow**: Welcome → Survey → Results → Personalized Dashboard
- [x] **Cross-Platform Integration**: Seamless experience across iOS/Android/Web

#### 🎨 User Experience Transformation:
**Before**: Generic fitness app with one-size-fits-all approach
**After**: 7 specialized fitness companions with unique personalities:

- 💪 **Power Gymmy** for Strength Seekers - "Ready to move some serious weight today?"
- 🔥 **Blaze Gymmy** for Calorie Crushers - "Time to ignite that metabolic fire!"
- ⚖️ **Transform Gymmy** for Body Optimizers - "Transformation happens one choice at a time!"
- 🧘 **Zen Gymmy** for Wellness Seekers - "Balance is strength, peace is power!"
- 🏃 **Pace Gymmy** for Endurance Athletes - "Every mile is a victory!"
- 🎯 **Steady Gymmy** for Habit Builders - "Consistency is your superpower!"
- 🤝 **Rally Gymmy** for Social Enthusiasts - "Together we're stronger!"

#### Success Metrics Achieved:
- 🎯 **100% Personalization Coverage**: Every UI element adapts to user segment
- 📊 **7 Unique Dashboard Layouts**: Metrics and goals tailored to user values  
- 💬 **280+ Contextual Messages**: Dynamic companion responses to user actions
- 🎨 **Segment-Specific Themes**: Visual design matches user personality
- ⚡ **3-Minute Onboarding**: Beautiful, engaging survey experience

### 🎯 PHASE 2: MULTI-GYMMY SYSTEM *(Weeks 11-18)*
**Status**: 🚀 **READY TO START** - Expanding the companion universe

#### Planned Features:
- [ ] **Gymmy Collection System**: Multiple Gymmy types with unique personalities and specialties
- [ ] **Enhanced Gacha Mechanics**: Pull different Gymmys + items/gear for your companions
- [ ] **Team Management Interface**: Build squads of specialized Gymmys with strategic combinations
- [ ] **Gymmy Synergies & Bonuses**: Team effects and collaborative workout benefits
- [ ] **Character Evolution System**: Gymmys grow stronger and unlock abilities as you progress
- [ ] **Seasonal Gymmy Events**: Limited-time companions and special challenges

#### Multi-Gymmy Vision:
Transform from "one personalized companion" to "a team of specialized fitness friends":
- **Rookie Gymmys**: Starting companions for new users
- **Specialist Gymmys**: Advanced companions focused on specific training types
- **Legendary Gymmys**: Ultra-rare companions with unique abilities and personalities
- **Seasonal Gymmys**: Event-exclusive companions with special themes
- **Community Gymmys**: Social companions that enhance group features

#### Success Metrics:
- 5+ Gymmys collected per user within first month
- 80%+ gacha engagement rate  
- 70%+ team management feature adoption

### 🎯 PHASE 3: 1% BETTER CORE SYSTEM *(Weeks 19-26)*
**Status**: 📋 **PLANNED** - Micro-improvement mastery

#### Planned Features:
- [ ] **Micro-Progress Detection**: AI-powered small improvement recognition
- [ ] **Adaptive Goal Engine**: Dynamic goals that evolve with user progress
- [ ] **Universal Metrics Framework**: 1% better tracking for all fitness values
- [ ] **Celebration System**: Tiered celebrations from micro to macro wins
- [ ] **Motivation Engine**: Contextual encouragement and support

### 🎯 PHASE 4: COMPETITIVE EVENTS SYSTEM *(Weeks 27-36)*
**Status**: 📋 **PLANNED** - Virtual competitions and AI opponents

#### Planned Features:
- [ ] **Virtual Event Infrastructure**: Spartan races, marathons, strength competitions
- [ ] **AI Competitor System**: Diverse AI personalities and adaptive difficulty
- [ ] **Real-Time Competition**: Live leaderboards and pacing
- [ ] **Event Leaderboards**: Compete against AI and real users
- [ ] **Performance Analytics**: Detailed competition statistics

### 🎯 PHASE 5: SOCIAL & COMMUNITY FEATURES *(Weeks 37-44)*
**Status**: 📋 **PLANNED** - Building the fitness community

#### Planned Features:
- [ ] **Community Platform**: User profiles, following, friend systems
- [ ] **Workout Sharing**: Celebrate achievements with the community
- [ ] **Group Challenges**: Team-based competitions and events
- [ ] **Social Gamification**: Community reputation and social achievements
- [ ] **Mentorship System**: Connect experienced users with beginners

### 🎯 PHASE 6: POLISH & LAUNCH PREPARATION *(Weeks 45-52)*
**Status**: 📋 **PLANNED** - Production-ready optimization

#### Planned Features:
- [ ] **Performance Optimization**: Speed, efficiency, and reliability improvements
- [ ] **Comprehensive Testing**: Security, load testing, and quality assurance
- [ ] **Accessibility Enhancement**: Full accessibility compliance
- [ ] **Launch Infrastructure**: Production deployment and monitoring
- [ ] **Marketing Preparation**: App store optimization and community building

## 🏗️ Project Structure

```
gymmy/
├── App.js                          # Main app with onboarding navigation
├── package.json                    # Dependencies and scripts
├── app.json                       # Expo configuration
├── src/
│   ├── components/
│   │   ├── AdaptiveDashboard.js        # NEW: Segment-specific dashboard layouts
│   │   ├── AdaptiveGymmy.js            # NEW: Dynamic companion with 280+ messages
│   │   ├── OnboardingSurvey.js         # NEW: Interactive 7-question survey
│   │   ├── AchievementQuestDisplay.js  # Achievement and quest UI
│   │   ├── AnalyticsCharts.js          # Progress visualization
│   │   ├── ClassDashboardWidget.js     # Class-specific dashboard
│   │   ├── GachaComponents.js          # Gacha pull interface
│   │   ├── GamificationStats.js        # Level and XP display
│   │   ├── WorkoutCalendar.js          # Calendar view with rest days
│   │   └── ... (additional components)
│   ├── context/
│   │   ├── AppContext.tsx              # ENHANCED: Global state with segmentation
│   │   ├── segmentationTypes.ts        # NEW: Complete type system for 7 user segments
│   │   ├── SegmentationEngine.ts       # NEW: Classification algorithms and goal generation
│   │   ├── SurveyQuestions.ts          # NEW: Question bank with weighted responses
│   │   ├── GameData.ts                 # Game constants and data
│   │   ├── GameLogic.ts                # Game calculation functions
│   │   ├── GameReducer.ts              # State reducer logic
│   │   └── types.ts                    # TypeScript type definitions
│   ├── screens/
│   │   ├── WelcomeScreen.js            # NEW: Beautiful onboarding entry point
│   │   ├── SegmentResultsScreen.js     # NEW: Personalization results celebration
│   │   ├── DashboardScreen.js          # UPDATED: Adaptive dashboard integration
│   │   ├── WorkoutScreen.js            # Workout tracking
│   │   ├── ProgressScreen.js           # Progress monitoring
│   │   ├── ClassSelectionScreen.js     # Class selection
│   │   ├── GachaScreen.js             # Gacha pulls
│   │   └── ... (additional screens)
│   ├── utils/
│   │   └── StorageManager.js           # Data persistence
│   └── constants/
│       └── designTokens.js             # Design system constants
└── README.md
```

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

## 📊 Success Metrics & KPIs

### Phase 0 Metrics ✅ ACHIEVED
- ✅ **Technical Foundation**: Complete TypeScript integration
- ✅ **Core Features**: All basic gamification features functional
- ✅ **Cross-Platform**: Works on iOS, Android, and Web
- ✅ **Data Persistence**: Reliable local storage system
- ✅ **User Experience**: Intuitive navigation and interface

### Phase 1 Metrics ✅ ACHIEVED
- ✅ **100% Personalization Coverage**: Every UI element adapts to user segment
- ✅ **7 Unique Experiences**: Completely different app for each user type
- ✅ **280+ Dynamic Messages**: Contextual Gymmy responses
- ✅ **3-minute Onboarding**: Beautiful, engaging survey flow
- ✅ **Segment Classification**: Sophisticated algorithm with confidence scores
- ✅ **Adaptive Goals**: Personalized objectives based on user values
- ✅ **Cross-Platform**: Seamless experience across all platforms

### Target Metrics by Future Phases

**Phase 2 (Multi-Gymmy)**:
- 5+ Gymmys collected per user within first month
- 80%+ gacha engagement rate
- 70%+ team management feature adoption

**Phase 3 (1% Better)**:
- 60%+ daily active user engagement
- 85%+ users report feeling motivated
- 80%+ 30-day retention rate

**Phase 4 (Events)**:
- 50%+ event participation rate
- 75%+ competition completion rate
- 4.0/5+ satisfaction with AI competitors

**Phase 5 (Social)**:
- 60%+ social feature adoption
- 40%+ community interaction rate
- 20%+ retention improvement from social features

**Phase 6 (Launch)**:
- 4.5+ stars app store rating
- <0.1% crash rate
- Target user acquisition cost achieved

## 🎮 Gamification Philosophy

### The "1% Better" Core
Every feature in Gymmy is designed around the principle that small, consistent improvements compound into extraordinary results. Whether you're:

- A powerlifter adding 5 pounds to your bench press
- A runner shaving 2 seconds off your mile time
- A yogi holding a pose 10 seconds longer
- A beginner completing one more pushup than yesterday

**Gymmy celebrates YOUR version of progress.**

### Universal Motivation System
- **Micro-Celebrations**: Every small win is acknowledged and celebrated
- **Progress Visualization**: See how 1% improvements compound over time
- **Adaptive Goals**: Challenges that grow with your abilities
- **Inclusive Design**: Success looks different for everyone, and that's perfect

## 🤝 Contributing

We welcome contributions from developers who believe in making fitness accessible and motivating for everyone!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-improvement`)
3. Follow our coding standards and include tests
4. Test thoroughly across platforms (iOS, Android, Web)
5. Submit a pull request with detailed description

### Development Guidelines
- Follow TypeScript best practices
- Maintain cross-platform compatibility
- Include comprehensive tests for new features
- Follow the established component architecture
- Prioritize accessibility in all UI components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join conversations about fitness, motivation, and app development
- **Documentation**: Comprehensive guides available in the `/docs` folder

## 🏆 Current Status

**✅ Stable Foundation**: Core app with gamification, workout tracking, and analytics
**🔄 Active Development**: User segmentation and personalization system
**🚀 Next Up**: Multi-Gymmy companion system and enhanced gacha mechanics

---

**Built with ❤️ using React Native and Expo**

*Gymmy - Your personal gym companion who believes in the power of 1% better every day!*

---

## 📈 Recent Updates

### Latest Changes (Current Sprint)
- ✅ Enhanced TypeScript integration across all context files
- ✅ Improved error handling and null safety
- ✅ Updated project structure for better maintainability
- ✅ Comprehensive roadmap planning completed
- 🔄 User segmentation system development in progress

### Coming This Sprint
- User discovery survey implementation
- Personalized dashboard variations
- Segment-specific goal generation
- Adaptive Gymmy personality system

### Quick Start for New Contributors
1. Review the [HANDOFF_DOCUMENT.md](HANDOFF_DOCUMENT.md) for detailed technical context
2. Set up the development environment following the installation steps above
3. Run the app in demo mode to explore all current features
4. Check the current sprint goals in Phase 1 of the roadmap
5. Join our development discussions to understand priorities and approach

**Ready to help people become 1% better every day? Let's build something amazing together!** 🚀