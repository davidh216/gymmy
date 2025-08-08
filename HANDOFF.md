## Gymmy (Gym Journal) — Technical Handoff

**Last Updated:** 2025-08-08  
**Current App Version:** 1.0.0 (Phase 2 complete; Multi-Gymmy systems fully integrated)  
**Framework:** React Native 0.72.10 with Expo ~49.x  
**Platforms:** iOS, Android, Web  
**Data Storage:** AsyncStorage (local)  
**Architecture:** Unified context system with Multi-Gymmy integration

### Project Overview
Gymmy is a React Native/Expo fitness application featuring advanced workout tracking, a class-based progression system, gacha mechanics, character collection, and a personalization engine (7 user segments). The codebase has been refactored into a modular architecture with a unified provider layer and specialized contexts.

### Executive Summary
- ✅ **Unified Architecture**: Complete context refactor with UnifiedAppProvider coordinating all systems
- ✅ **Multi-Gymmy Foundation**: 5 core systems integrated for character management and team building
- ✅ **Cross-System Integration**: Workout activities feed into character progression seamlessly
- ✅ **Backward Compatibility**: Legacy API maintained through context bridge and selectors
- ✅ **Performance Optimized**: Context providers with proper memoization and selective re-renders
- ✅ **Type Safety**: Comprehensive TypeScript integration across all systems
- ✅ **Error Boundaries**: Custom RN-safe error handling and loading states

### Key Metrics (from README)
- **Architecture**: Unified context system with 4 specialized contexts + Multi-Gymmy systems
- **WorkoutScreen.js**: Reduced to ~543 lines and split into 8 focused components
- **Context System**: UnifiedAppProvider coordinates all contexts with cross-system integration
- **Multi-Gymmy Systems**: 5 core systems for character growth, team management, and advanced gacha
- **Code Quality**: 98.5% reduction in lint issues with comprehensive type safety
- **Performance**: Optimized context providers with selective re-renders

## Architecture Overview

### Unified Context System
```
AppProvider (ErrorBoundary + Suspense)
├── UnifiedAppProvider (central orchestrator + Multi-Gymmy integration)
│   ├── SegmentationProvider
│   ├── UserStatsProvider  
│   ├── GachaProvider (enhanced with Multi-Gymmy systems)
│   ├── WorkoutProvider (integrated with character progression)
│   ├── Multi-Gymmy Systems:
│   │   ├── CharacterGrowthSystem
│   │   ├── TeamManagementSystem
│   │   ├── AdvancedGachaSystem
│   │   ├── ProgressionTracker
│   │   └── PullAnalytics
│   └── ContextBridge (state synchronization + legacy compatibility)
└── NavigationContainer
    └── AppStackNavigator (OnboardingStack ↔ MainTabs + Modal screens)
```

Representative files:
- `src/context/AppProvider.tsx`
- `src/context/UnifiedAppProvider.tsx`
- `src/context/ContextIntegrationManager.tsx`
- `src/context/contexts/*` (Workout, UserStats, Gacha, Segmentation)
- `src/context/systems/*` (Multi-Gymmy systems)

### Navigation and Flow
- `App.js` defines:
  - Onboarding Stack: `Welcome` → `Survey` → `Results`
  - Main Tabs: `Dashboard`, `Workout`, `Progress`, `Settings`
  - Modal screens: `ClassSelection`, `Gacha`, `CharacterCollection`, `Achievements`
- Demo Mode is user-toggleable and persistent (see below); when enabled, survey is bypassed and demo data is seeded.

## Contexts, Hooks, and Backward Compatibility

- Primary exports: `src/context/index.ts`
  - `AppProvider`: wrap the application
  - `useApp`: legacy-compatible hook mapped to the unified context
  - Unified hooks: `useUnifiedApp`, `useAppState`, `useCharacterSystem`, `useWorkoutIntegration`
  - Specialized selectors/actions re-exported from `ContextSelectors`

Usage example:
```ts
import { AppProvider, useApp } from '@/src/context';
```

## Multi-Gymmy System Status

### ✅ Core Systems (Fully Integrated)
- **CharacterGrowthSystem**: Advanced character progression with workout-based experience
- **TeamManagementSystem**: Team building logic with character synergies and strategic combinations  
- **AdvancedGachaSystem**: Enhanced pull mechanics with pity system and banner management
- **ProgressionTracker**: Cross-system progression tracking with real-time updates
- **PullAnalytics**: Advanced analytics for gacha pulls with insights and recommendations

### ✅ Integration Layer
- **UnifiedAppProvider**: All systems integrated with unified state management
- **Cross-System Hooks**: `useCharacterSystem`, `useWorkoutIntegration`, `useUnifiedApp`
- **Context Bridge**: Seamless compatibility with legacy components
- **Real-time Sync**: Workout activities automatically feed into character progression

### ✅ Available UI Components
- **GachaScreen**: Enhanced pull interface with Multi-Gymmy integration
- **CharacterCollectionScreen**: Character display with growth tracking
- **Multi-Gymmy Components**: Team builder, evolution screens, progression dashboard

### 🔄 Next Steps
- Enhanced visual character system with sprites and animations
- Advanced team management UI integration
- Seasonal banner system with limited-time characters

## Development & Quality

### Commands
```
npm start            # Expo dev server
npm run web          # Web platform
npm run android      # Android
npm run ios          # iOS
npm run lint         # ESLint
npm run lint:fix     # ESLint with autofix
npm test             # Jest tests
```

### Quality Targets
- Function ≤ 50 lines; Component ≤ 200 lines; File ≤ 500 lines
- Cyclomatic complexity ≤ 10; Aim for ≥70–80% coverage (see `jest.config.js`)

## Data and Storage
- AsyncStorage used for local persistence (segmentation state, survey history, goals, user stats)

## Onboarding and DEMO Mode
- Toggle locations (persisted via AsyncStorage):
  - Welcome screen: gear icon at top-right toggles Demo On/Off.
  - Dashboard: header pill at top-right shows “Demo On/Off,” tap to toggle.
- Implementation: stored in `appState.settings.demoMode` and mirrored in `appState.isDemo`. Managed via `updateSettings` and `setDemoMode` in the unified provider.

## Debug Tools (Web Only)
- The “🐛 Debug” toggle appears only when browser dev tools are open (F12) and is positioned bottom-right.
- It auto-hides when dev tools are closed.

## System Architecture Notes

### Multi-Gymmy Integration
- **Core Systems**: All 5 Multi-Gymmy systems are fully integrated and functional
- **UI Components**: Basic components available, enhanced visual system planned for next phase
- **Navigation**: Modal screens for gacha and character collection integrated in App.js
- **State Management**: Cross-system state synchronization through ContextIntegrationManager

### Development Environment
- **DevTools**: Web-only debug tools with dev console detection
- **Error Boundaries**: Custom React Native-safe error handling
- **Performance**: Context providers optimized with selective re-renders
- **Type Safety**: Comprehensive TypeScript coverage across all systems

### Documentation
- **Primary Docs**: README.md (user-facing), HANDOFF.md (technical handoff)
- **Legacy Files**: Some older documentation files exist but this HANDOFF.md is authoritative

## Testing & QA
- Manual validation in place for onboarding completion/skip, navigation reactivity, and context transitions.
- Monitor: Context re-render frequency, memory footprint of systems, and onboarding edge cases.

## Development Roadmap

### 🔄 Phase 2 Completion (Current)
- **Status**: Multi-Gymmy foundation systems integrated and functional
- **Remaining**: Enhanced UI components and visual character system
- **Timeline**: Foundation complete, UI enhancements in progress

### 🎯 Phase 3: Enhanced Multi-Gymmy UI
- Advanced team management interface with drag-and-drop
- Character sprites and evolution animations
- Enhanced gacha UI with pull effects and celebrations
- Seasonal banner system with limited-time events

### 🎯 Phase 4: 1% Better Core System
- Adaptive goal engine integrated with character progression
- Micro-improvement detection and celebration
- Cross-character workout bonuses and team synergies

### 🎯 Future Phases
- Competitive events and social features
- Performance monitoring and comprehensive testing
- Production deployment and scaling optimization

## Reference
- Repository: `https://github.com/davidh216/workout-journal`
- Entry points: `index.js` → `App.js` → `src/context/*` providers
- Key screens: `src/screens/*`; Components: `src/components/*`

This document reflects the current codebase (version 1.0.0) and supersedes older handoff notes.