# Gymmy - Your Fitness Companion
**A comprehensive fitness tracking app with advanced gamification and personalized AI companions**

🎯 **Core Philosophy**: "1% Better Every Day" - Small, consistent improvements that compound into extraordinary transformations

---

## 📊 **PROJECT STATUS: Phase 3 Ready**

### ✅ **FOUNDATION COMPLETE** (Phases 0-2)
**Achievement**: 98.5% improvement in code quality with unified architecture

- **Code Quality**: 3,289 issues → 50 issues (98.5% reduction)
- **Unified Architecture**: 5 integrated Multi-Gymmy core systems  
- **Component Refactoring**: Large files split into focused, maintainable modules
- **Type Safety**: 95% TypeScript coverage with comprehensive definitions
- **Cross-Platform**: Seamless iOS/Android/Web experience
- **User Segmentation**: 7 personalized fitness companion experiences

### 🚀 **CURRENT PHASE: Enhanced Multi-Gymmy UI** 
**Status**: Ready to execute with comprehensive planning complete

**📋 [View Complete Documentation](docs/current/)** - All Phase 3 planning documents

#### Planned Features:
- **Visual Character System**: Immersive sprites, animations, and progression indicators
- **Advanced Team Management**: Drag-and-drop interface with real-time synergy visualization  
- **Enhanced Gacha Experience**: Pull animations, banner rotation, and celebration effects
- **Collection & Evolution Hub**: Comprehensive character management and growth planning

#### Success Targets:
- 5+ characters collected per user monthly | 80%+ gacha engagement rate  
- 70%+ team management adoption | 90%+ user satisfaction with visual systems

---

## 🎮 **CORE FEATURES**

### 🏋️ **Advanced Workout Tracking**
- **Exercise Categories**: Chest, Back, Legs, Shoulders, Biceps, Triceps, Abs
- **40+ Exercises**: Pre-defined library with progression tracking
- **Comprehensive Logging**: Sets, reps, weight, cardio metrics, notes, ratings
- **Smart Templates**: Pre-built and customizable workout routines

### 🎯 **Class-Based Progression System**
- **5 Unique Classes**: Powerlifter, Bodybuilder, Athlete, Yogi, Hybrid
- **Specialized Bonuses**: XP multipliers for different training styles
- **WoW-Style Leveling**: Exponential XP curve with 100+ levels
- **Skill Trees**: Unique progression paths for each class

### 🎰 **Multi-Gymmy Character System**
- **7 Personalized Companions**: Each adapted to your fitness values and goals
- **Character Collection**: Gacha mechanics with rare and legendary characters
- **Team Building**: Strategic combinations with synergy bonuses
- **Character Growth**: Progression through workout activities and achievements

### 📊 **Personalized Experience**
Transform based on your fitness values:
- 💪 **Power Gymmy** (Strength Seekers) - PRs and progressive overload focus
- 🔥 **Blaze Gymmy** (Calorie Crushers) - Energy expenditure and fat burning
- ⚖️ **Transform Gymmy** (Body Optimizers) - Body composition and aesthetics
- 🧘 **Zen Gymmy** (Wellness Seekers) - Mindfulness and mind-body connection
- 🏃 **Pace Gymmy** (Endurance Athletes) - Performance times and race goals
- 🎯 **Steady Gymmy** (Habit Builders) - Consistency and routine building
- 🤝 **Rally Gymmy** (Social Enthusiasts) - Community and shared accountability

---

## 🗓️ **DEVELOPMENT ROADMAP**

### ✅ **PHASES 0-2 COMPLETE**
- **Phase 0**: Technical foundation and core gamification *(Weeks 1-4)*
- **Phase 1**: User segmentation with 7 personalized companions *(Weeks 5-10)*  
- **Phase 2**: Multi-Gymmy foundation systems integration *(Weeks 11-18)*

**Achievement**: Unified architecture with 5 core Multi-Gymmy systems ready for rich UI experiences

### 🚀 **PHASE 3: ENHANCED MULTI-GYMMY UI** *(Weeks 19-26)*
**Status**: Ready to execute with comprehensive planning

**📋 Documentation**: [PRD](docs/current/PRD_PHASE3.md) | [Implementation Plan](docs/current/IMPLEMENTATION_ROADMAP.md) | [Technical Guide](docs/current/TECHNICAL_GUIDE.md) | [Testing Framework](docs/current/TESTING_FRAMEWORK.md)

**4 Sprint Development Plan**:
1. **Visual Character System** - Sprites, animations, progression indicators
2. **Team Management UI** - Drag-and-drop interface with synergy visualization  
3. **Enhanced Gacha Experience** - Pull animations, banner rotation, celebrations
4. **Collection & Evolution Hub** - Character management and growth planning

### 📋 **FUTURE PHASES** *(Weeks 27+)*
- **Phase 4**: 1% Better Core System with micro-improvement detection
- **Phase 5**: Competitive Events with virtual competitions  
- **Phase 6**: Social & Community features with sharing
- **Phase 7**: Polish & Launch preparation

---

## 🏗️ **TECHNICAL STACK**

### **Architecture Overview**
```
src/
├── components/          # Modular component architecture
│   ├── workout/        # 8 specialized workout components
│   ├── multi-gymmy/    # Character system UI components
│   └── common/         # Shared UI components
├── context/            # Unified state management
│   ├── UnifiedAppProvider.tsx  # Central coordinator
│   ├── contexts/       # 4 specialized contexts
│   ├── systems/        # 5 Multi-Gymmy core systems
│   └── managers/       # System coordination managers
├── screens/            # Screen components (refactored)
├── utils/              # Utility functions
└── constants/          # App constants and design tokens
```

**Key Systems**:
- **CharacterGrowthSystem**: Progression and evolution logic
- **TeamManagementSystem**: Strategic team building with synergies
- **AdvancedGachaSystem**: Enhanced pull mechanics and banner management
- **ProgressionTracker**: Cross-system progression coordination
- **PullAnalytics**: Gacha analytics and user insights

### **Core Technologies**
- **React Native**: 0.72.10 with Expo ~49.0.0
- **TypeScript**: 95% coverage with comprehensive type definitions
- **Context API**: Unified state management with specialized contexts
- **AsyncStorage**: Local data persistence with StorageManager
- **React Navigation**: Bottom Tab + Stack Navigator
- **Testing**: Jest with React Native Testing Library

---

## 🚀 **GETTING STARTED**

### **Prerequisites**
- Node.js (v14 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### **Installation**

1. **Clone and install**
   ```bash
   git clone https://github.com/davidh216/workout-journal.git
   cd workout-journal
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Run on platform**
   - **Web**: Press `w` | **iOS**: Press `i` | **Android**: Press `a`

### **Demo Mode**
- Toggle in UI (persists via AsyncStorage)
- Welcome screen: gear icon (top-right) 
- Dashboard: Demo pill (top-right)

---

## 🛠️ **DEVELOPMENT**

### **Code Quality Standards**
```bash
npm run lint          # ESLint checks
npm run lint:fix      # Auto-fix issues
npm run format        # Prettier formatting
npm test              # Run tests
npm run test:coverage # Test coverage
```

### **Development Guidelines**
- Function: ≤50 lines | Component: ≤200 lines | File: ≤500 lines
- Cyclomatic complexity: ≤10 | Test coverage: ≥80%
- TypeScript-first with comprehensive type definitions

---

## 🎯 **SUCCESS METRICS**

### **Achieved (Phases 0-2)**
- ✅ 98.5% code quality improvement (3,289 → 50 issues)
- ✅ 100% personalization coverage across UI elements
- ✅ 7 unique dashboard experiences for user segments
- ✅ 280+ contextual companion messages
- ✅ Cross-platform compatibility (iOS/Android/Web)

### **Target (Phase 3+)**
- 5+ characters collected per user monthly
- 80%+ gacha engagement rate
- 70%+ team management adoption
- 90%+ user satisfaction with visual systems
- 75%+ long-term engagement commitment

---

## 📄 **DOCUMENTATION**

- **[Current Documentation](docs/current/)** - Phase 3 planning and technical guides
- **[Archived Documentation](docs/archive/)** - Historical refactoring documentation
- **[Technical Handoff](HANDOFF.md)** - Developer onboarding guide

---

## 🤝 **CONTRIBUTING**

We welcome contributions from developers who believe in making fitness accessible and motivating!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-improvement`)
3. Follow coding standards and include tests
4. Test across platforms (iOS, Android, Web)
5. Submit PR with detailed description

---

**Built with ❤️ using React Native and Expo**

*Gymmy - Your personal fitness companion who believes in the power of 1% better every day!*