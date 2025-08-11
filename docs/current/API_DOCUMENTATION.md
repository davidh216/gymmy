# 🔧 **API DOCUMENTATION**
# Phase 3 Core Systems API Reference
**Agent**: Documentation Agent | **Timeline**: Week 27, Days 1-2  
**Objective**: Complete API documentation for all core systems

---

## 📋 **API OVERVIEW**

### **Scope**
- **5 Core Systems**: CharacterGrowth, TeamManagement, AdvancedGacha, ProgressionTracker, PullAnalytics
- **Method Documentation**: All public methods with parameters and return types
- **Usage Examples**: Comprehensive examples for all API calls
- **Error Handling**: Error scenarios and recovery patterns
- **Integration Patterns**: Cross-system API integration

### **Success Criteria**
- All API methods documented with clear descriptions
- Parameter types and validation rules specified
- Return types and data structures documented
- Error handling patterns clearly explained
- Integration examples provided

---

## 🎯 **CHARACTER GROWTH SYSTEM API**

### **Overview**
The CharacterGrowthSystem manages character experience, level progression, and growth across all fitness activities. It provides real-time character development tracking and milestone celebrations.

### **Core Methods**

#### **`addExperience(characterId: string, amount: number, source: string)`**
Adds experience to a character from a specific source and triggers growth events.

**Parameters:**
- `characterId` (string): Unique character identifier
- `amount` (number): Experience amount to add (positive integer)
- `source` (string): Source of experience (workout, achievement, gacha, etc.)

**Returns:** `Promise<CharacterGrowthData>`

**Example:**
```typescript
import { CharacterGrowthSystem } from '../context/systems/CharacterGrowthSystem';

const characterGrowthSystem = new CharacterGrowthSystem();

// Add experience from workout
const growthData = await characterGrowthSystem.addExperience(
  'character_123',
  150,
  'strength_workout'
);

console.log(growthData);
// Returns: {
//   characterId: 'character_123',
//   previousLevel: 5,
//   currentLevel: 6,
//   experienceGained: 150,
//   totalExperience: 2150,
//   levelUp: true,
//   milestones: ['reached_level_6', 'strength_milestone']
// }
```

#### **`calculateLevel(experience: number)`**
Calculates character level based on experience points using the progression formula.

**Parameters:**
- `experience` (number): Total experience points

**Returns:** `number`

**Example:**
```typescript
const level = characterGrowthSystem.calculateLevel(2500);
// Returns: 8

const level2 = characterGrowthSystem.calculateLevel(500);
// Returns: 3
```

#### **`getCharacterGrowth(characterId: string)`**
Retrieves comprehensive growth data for a specific character.

**Parameters:**
- `characterId` (string): Unique character identifier

**Returns:** `Promise<CharacterGrowthData>`

**Example:**
```typescript
const growthData = await characterGrowthSystem.getCharacterGrowth('character_123');
// Returns: {
//   characterId: 'character_123',
//   currentLevel: 6,
//   totalExperience: 2150,
//   experienceToNext: 350,
//   growthRate: 1.2,
//   milestones: [...],
//   recentActivity: [...]
// }
```

#### **`calculateExperienceToNext(characterId: string)`**
Calculates experience required to reach the next level.

**Parameters:**
- `characterId` (string): Unique character identifier

**Returns:** `Promise<number>`

**Example:**
```typescript
const expToNext = await characterGrowthSystem.calculateExperienceToNext('character_123');
// Returns: 350
```

#### **`getGrowthMilestones(characterId: string)`**
Retrieves all growth milestones for a character.

**Parameters:**
- `characterId` (string): Unique character identifier

**Returns:** `Promise<GrowthMilestone[]>`

**Example:**
```typescript
const milestones = await characterGrowthSystem.getGrowthMilestones('character_123');
// Returns: [
//   { id: 'level_5', type: 'level', achieved: true, date: '2024-12-01' },
//   { id: 'strength_100', type: 'stat', achieved: true, date: '2024-12-01' },
//   { id: 'level_10', type: 'level', achieved: false, progress: 0.6 }
// ]
```

#### **`updateGrowthRate(characterId: string, newRate: number)`**
Updates the growth rate for a character based on activity patterns.

**Parameters:**
- `characterId` (string): Unique character identifier
- `newRate` (number): New growth rate multiplier (0.5 - 2.0)

**Returns:** `Promise<void>`

**Example:**
```typescript
await characterGrowthSystem.updateGrowthRate('character_123', 1.5);
// Character will gain 50% more experience from activities
```

### **Error Handling**

#### **Common Error Scenarios**
```typescript
// Invalid character ID
try {
  await characterGrowthSystem.addExperience('invalid_id', 100, 'workout');
} catch (error) {
  console.error('Character not found:', error.message);
}

// Negative experience amount
try {
  await characterGrowthSystem.addExperience('character_123', -50, 'workout');
} catch (error) {
  console.error('Invalid experience amount:', error.message);
}

// Invalid source
try {
  await characterGrowthSystem.addExperience('character_123', 100, 'invalid_source');
} catch (error) {
  console.error('Invalid experience source:', error.message);
}
```

---

## 👥 **TEAM MANAGEMENT SYSTEM API**

### **Overview**
The TeamManagementSystem enables users to build, optimize, and manage character teams with advanced synergy calculations and analytics. It provides real-time team effectiveness tracking and optimization recommendations.

### **Core Methods**

#### **`calculateSynergies(team: Character[])`**
Calculates team synergies and bonuses based on character combinations.

**Parameters:**
- `team` (Character[]): Array of characters in team

**Returns:** `Promise<TeamSynergyData>`

**Example:**
```typescript
import { TeamManagementSystem } from '../context/systems/TeamManagementSystem';

const teamManagementSystem = new TeamManagementSystem();

const synergies = await teamManagementSystem.calculateSynergies(team);
// Returns: {
//   totalBonus: 25,
//   activeSynergies: [
//     { type: 'strength', bonus: 15, characters: ['char1', 'char2'] },
//     { type: 'endurance', bonus: 10, characters: ['char2', 'char3'] }
//   ],
//   teamEffectiveness: 0.85,
//   recommendations: ['Add strength character for +10 bonus']
// }
```

#### **`optimizeTeam(characters: Character[], criteria: string)`**
Optimizes team composition based on specified criteria.

**Parameters:**
- `characters` (Character[]): Available characters
- `criteria` (string): Optimization criteria (strength, endurance, balance, etc.)

**Returns:** `Promise<OptimizedTeam>`

**Example:**
```typescript
const optimizedTeam = await teamManagementSystem.optimizeTeam(
  availableCharacters,
  'strength'
);
// Returns: {
//   team: [character1, character2, character3, character4],
//   effectiveness: 0.92,
//   synergies: [...],
//   reasoning: 'Optimized for maximum strength output'
// }
```

#### **`addCharacterToTeam(teamId: string, characterId: string, slotIndex: number)`**
Adds a character to a specific team slot.

**Parameters:**
- `teamId` (string): Team identifier
- `characterId` (string): Character identifier
- `slotIndex` (number): Slot position (0-based)

**Returns:** `Promise<TeamData>`

**Example:**
```typescript
const updatedTeam = await teamManagementSystem.addCharacterToTeam(
  'team_123',
  'character_456',
  2
);
// Returns updated team data with character in slot 2
```

#### **`removeCharacterFromTeam(teamId: string, slotIndex: number)`**
Removes a character from a specific team slot.

**Parameters:**
- `teamId` (string): Team identifier
- `slotIndex` (number): Slot position to clear

**Returns:** `Promise<TeamData>`

**Example:**
```typescript
const updatedTeam = await teamManagementSystem.removeCharacterFromTeam(
  'team_123',
  2
);
// Returns updated team data with slot 2 cleared
```

#### **`saveTeamPreset(team: TeamData, name: string)`**
Saves a team configuration as a preset for later use.

**Parameters:**
- `team` (TeamData): Team configuration to save
- `name` (string): Preset name

**Returns:** `Promise<TeamPreset>`

**Example:**
```typescript
const preset = await teamManagementSystem.saveTeamPreset(
  currentTeam,
  'Strength Team'
);
// Returns: {
//   id: 'preset_123',
//   name: 'Strength Team',
//   team: [...],
//   createdAt: '2024-12-01T10:00:00Z',
//   effectiveness: 0.88
// }
```

#### **`loadTeamPreset(presetId: string)`**
Loads a saved team preset.

**Parameters:**
- `presetId` (string): Preset identifier

**Returns:** `Promise<TeamData>`

**Example:**
```typescript
const team = await teamManagementSystem.loadTeamPreset('preset_123');
// Returns the team configuration from the preset
```

#### **`getTeamAnalytics(teamId: string, timeRange: string)`**
Retrieves comprehensive analytics for a team.

**Parameters:**
- `teamId` (string): Team identifier
- `timeRange` (string): Time range for analytics (day, week, month)

**Returns:** `Promise<TeamAnalytics>`

**Example:**
```typescript
const analytics = await teamManagementSystem.getTeamAnalytics(
  'team_123',
  'week'
);
// Returns: {
//   effectiveness: 0.85,
//   usageTime: 1200, // minutes
//   performance: [...],
//   recommendations: [...],
//   trends: [...]
// }
```

#### **`updateTeamEffectiveness(teamId: string, activityData: ActivityData)`**
Updates team effectiveness based on recent activity.

**Parameters:**
- `teamId` (string): Team identifier
- `activityData` (ActivityData): Recent activity data

**Returns:** `Promise<void>`

**Example:**
```typescript
await teamManagementSystem.updateTeamEffectiveness('team_123', {
  workoutType: 'strength',
  duration: 45,
  intensity: 8,
  exercises: ['squats', 'deadlifts']
});
```

### **Error Handling**

#### **Common Error Scenarios**
```typescript
// Invalid team size
try {
  await teamManagementSystem.addCharacterToTeam('team_123', 'char_456', 10);
} catch (error) {
  console.error('Invalid slot index:', error.message);
}

// Character already in team
try {
  await teamManagementSystem.addCharacterToTeam('team_123', 'char_456', 0);
} catch (error) {
  console.error('Character already in team:', error.message);
}

// Team not found
try {
  await teamManagementSystem.getTeamAnalytics('invalid_team', 'week');
} catch (error) {
  console.error('Team not found:', error.message);
}
```

---

## 🎰 **ADVANCED GACHA SYSTEM API**

### **Overview**
The AdvancedGachaSystem manages gacha pulls, banner rotations, and pull analytics. It provides sophisticated pull mechanics with pity systems and celebration effects.

### **Core Methods**

#### **`performPull(bannerId: string, pullType: 'single' | 'multi')`**
Performs a gacha pull on the specified banner with advanced mechanics.

**Parameters:**
- `bannerId` (string): Banner identifier
- `pullType` (string): Type of pull (single or multi)

**Returns:** `Promise<PullResult>`

**Example:**
```typescript
import { AdvancedGachaSystem } from '../context/systems/AdvancedGachaSystem';

const advancedGachaSystem = new AdvancedGachaSystem();

const pullResult = await advancedGachaSystem.performPull(
  'banner_123',
  'multi'
);
// Returns: {
//   characters: [character1, character2, character3, character4, character5],
//   rarity: 'epic',
//   pityProgress: 45,
//   celebration: true,
//   banner: 'banner_123',
//   timestamp: '2024-12-01T10:00:00Z'
// }
```

#### **`getBannerRotation()`**
Gets current banner rotation schedule and availability.

**Returns:** `Promise<BannerRotationData>`

**Example:**
```typescript
const rotation = await advancedGachaSystem.getBannerRotation();
// Returns: {
//   current: {
//     id: 'banner_123',
//     name: 'Strength Banner',
//     endTime: '2024-12-08T00:00:00Z',
//     featured: ['char1', 'char2']
//   },
//   upcoming: [
//     { id: 'banner_124', name: 'Endurance Banner', startTime: '2024-12-08T00:00:00Z' }
//   ],
//   schedule: { rotationInterval: 7, timezone: 'UTC' }
// }
```

#### **`getPityProgress(bannerId: string)`**
Gets pity progress for a specific banner.

**Parameters:**
- `bannerId` (string): Banner identifier

**Returns:** `Promise<PityData>`

**Example:**
```typescript
const pityData = await advancedGachaSystem.getPityProgress('banner_123');
// Returns: {
//   currentProgress: 45,
//   pityThreshold: 90,
//   guaranteedRarity: 'epic',
//   nextGuarantee: 45, // pulls until guarantee
//   bannerType: 'featured'
// }
```

#### **`getPullHistory(userId: string, timeRange: string)`**
Retrieves user's pull history with analytics.

**Parameters:**
- `userId` (string): User identifier
- `timeRange` (string): Time range for history (day, week, month, all)

**Returns:** `Promise<PullHistory[]>`

**Example:**
```typescript
const pullHistory = await advancedGachaSystem.getPullHistory(
  'user_123',
  'month'
);
// Returns: [
//   {
//     id: 'pull_123',
//     banner: 'banner_123',
//     characters: [character1],
//     rarity: 'rare',
//     timestamp: '2024-12-01T10:00:00Z',
//     pityProgress: 45
//   }
// ]
```

#### **`calculatePullRates(bannerId: string, pityProgress: number)`**
Calculates current pull rates based on pity progress.

**Parameters:**
- `bannerId` (string): Banner identifier
- `pityProgress` (number): Current pity progress

**Returns:** `Promise<PullRates>`

**Example:**
```typescript
const rates = await advancedGachaSystem.calculatePullRates('banner_123', 45);
// Returns: {
//   common: 0.70,
//   rare: 0.25,
//   epic: 0.04,
//   legendary: 0.01,
//   featured: 0.02
// }
```

#### **`getBannerInfo(bannerId: string)`**
Gets detailed information about a specific banner.

**Parameters:**
- `bannerId` (string): Banner identifier

**Returns:** `Promise<BannerInfo>`

**Example:**
```typescript
const bannerInfo = await advancedGachaSystem.getBannerInfo('banner_123');
// Returns: {
//   id: 'banner_123',
//   name: 'Strength Banner',
//   description: 'Focus on strength characters',
//   featured: [character1, character2],
//   rates: { common: 0.70, rare: 0.25, epic: 0.04, legendary: 0.01 },
//   startTime: '2024-12-01T00:00:00Z',
//   endTime: '2024-12-08T00:00:00Z',
//   pityThreshold: 90
// }
```

#### **`updatePityProgress(bannerId: string, pullCount: number)`**
Updates pity progress after pulls.

**Parameters:**
- `bannerId` (string): Banner identifier
- `pullCount` (number): Number of pulls made

**Returns:** `Promise<void>`

**Example:**
```typescript
await advancedGachaSystem.updatePityProgress('banner_123', 5);
// Updates pity progress by 5 for the banner
```

### **Error Handling**

#### **Common Error Scenarios**
```typescript
// Invalid banner ID
try {
  await advancedGachaSystem.performPull('invalid_banner', 'single');
} catch (error) {
  console.error('Banner not found:', error.message);
}

// Invalid pull type
try {
  await advancedGachaSystem.performPull('banner_123', 'invalid_type');
} catch (error) {
  console.error('Invalid pull type:', error.message);
}

// Banner expired
try {
  await advancedGachaSystem.performPull('expired_banner', 'single');
} catch (error) {
  console.error('Banner has expired:', error.message);
}
```

---

## 📊 **PROGRESSION TRACKER API**

### **Overview**
The ProgressionTracker tracks user progress across all fitness dimensions and activities. It provides comprehensive analytics and insights for personal development.

### **Core Methods**

#### **`trackProgress(activity: string, metrics: ProgressMetrics)`**
Tracks progress for a specific activity with detailed metrics.

**Parameters:**
- `activity` (string): Activity type (workout, achievement, milestone)
- `metrics` (ProgressMetrics): Progress metrics data

**Returns:** `Promise<ProgressData>`

**Example:**
```typescript
import { ProgressionTracker } from '../context/systems/ProgressionTracker';

const progressionTracker = new ProgressionTracker();

const progress = await progressionTracker.trackProgress('workout', {
  duration: 45,
  intensity: 8,
  exercises: ['squats', 'deadlifts', 'bench_press'],
  calories: 350,
  heartRate: { avg: 140, max: 165 },
  weights: { squats: 225, deadlifts: 315, bench_press: 185 }
});
// Returns: {
//   activityId: 'activity_123',
//   type: 'workout',
//   metrics: { ... },
//   experience: 150,
//   improvements: ['strength_increased', 'endurance_improved'],
//   timestamp: '2024-12-01T10:00:00Z'
// }
```

#### **`getProgressSummary(timeframe: string)`**
Gets progress summary for specified timeframe.

**Parameters:**
- `timeframe` (string): Timeframe (day, week, month, year)

**Returns:** `Promise<ProgressSummary>`

**Example:**
```typescript
const summary = await progressionTracker.getProgressSummary('month');
// Returns: {
//   workouts: 12,
//   totalTime: 540, // minutes
//   totalCalories: 4200,
//   improvements: [
//     { type: 'strength', value: '+15%', exercise: 'squats' },
//     { type: 'endurance', value: '+8%', metric: 'heart_rate' }
//   ],
//   milestones: ['reached_100_workouts', 'strength_goal_achieved'],
//   trends: [...]
// }
```

#### **`getActivityHistory(activityType: string, limit: number)`**
Retrieves activity history for specific activity type.

**Parameters:**
- `activityType` (string): Type of activity to retrieve
- `limit` (number): Number of activities to retrieve

**Returns:** `Promise<ActivityHistory[]>`

**Example:**
```typescript
const history = await progressionTracker.getActivityHistory('workout', 10);
// Returns: [
//   {
//     id: 'activity_123',
//     type: 'workout',
//     duration: 45,
//     intensity: 8,
//     experience: 150,
//     timestamp: '2024-12-01T10:00:00Z'
//   }
// ]
```

#### **`calculateImprovements(baseline: ProgressMetrics, current: ProgressMetrics)`**
Calculates improvements between baseline and current metrics.

**Parameters:**
- `baseline` (ProgressMetrics): Baseline metrics
- `current` (ProgressMetrics): Current metrics

**Returns:** `Promise<ImprovementData[]>`

**Example:**
```typescript
const improvements = await progressionTracker.calculateImprovements(
  baselineMetrics,
  currentMetrics
);
// Returns: [
//   { metric: 'strength', improvement: '+15%', exercise: 'squats' },
//   { metric: 'endurance', improvement: '+8%', type: 'cardio' }
// ]
```

#### **`setProgressGoal(goalType: string, target: number, timeframe: string)`**
Sets a progress goal with target and timeframe.

**Parameters:**
- `goalType` (string): Type of goal (strength, endurance, weight, etc.)
- `target` (number): Target value
- `timeframe` (string): Goal timeframe (week, month, year)

**Returns:** `Promise<ProgressGoal>`

**Example:**
```typescript
const goal = await progressionTracker.setProgressGoal(
  'strength',
  315, // target weight
  'month'
);
// Returns: {
//   id: 'goal_123',
//   type: 'strength',
//   target: 315,
//   current: 285,
//   progress: 0.75,
//   timeframe: 'month',
//   deadline: '2024-12-31T23:59:59Z'
// }
```

#### **`getProgressGoals()`**
Retrieves all active progress goals.

**Returns:** `Promise<ProgressGoal[]>`

**Example:**
```typescript
const goals = await progressionTracker.getProgressGoals();
// Returns: [
//   { id: 'goal_123', type: 'strength', target: 315, progress: 0.75 },
//   { id: 'goal_124', type: 'endurance', target: 30, progress: 0.60 }
// ]
```

#### **`updateProgressGoal(goalId: string, progress: number)`**
Updates progress for a specific goal.

**Parameters:**
- `goalId` (string): Goal identifier
- `progress` (number): Current progress value

**Returns:** `Promise<void>`

**Example:**
```typescript
await progressionTracker.updateProgressGoal('goal_123', 300);
// Updates strength goal progress to 300 lbs
```

### **Error Handling**

#### **Common Error Scenarios**
```typescript
// Invalid activity type
try {
  await progressionTracker.trackProgress('invalid_activity', metrics);
} catch (error) {
  console.error('Invalid activity type:', error.message);
}

// Invalid metrics
try {
  await progressionTracker.trackProgress('workout', { invalid: 'data' });
} catch (error) {
  console.error('Invalid metrics format:', error.message);
}

// Goal not found
try {
  await progressionTracker.updateProgressGoal('invalid_goal', 300);
} catch (error) {
  console.error('Goal not found:', error.message);
}
```

---

## 📈 **PULL ANALYTICS API**

### **Overview**
The PullAnalytics system provides comprehensive analytics and insights for gacha pulls and character collection. It offers personalized recommendations and trend analysis.

### **Core Methods**

#### **`analyzePullHistory(userId: string)`**
Analyzes user's pull history and provides comprehensive insights.

**Parameters:**
- `userId` (string): User identifier

**Returns:** `Promise<PullAnalyticsData>`

**Example:**
```typescript
import { PullAnalytics } from '../context/systems/PullAnalytics';

const pullAnalytics = new PullAnalytics();

const analytics = await pullAnalytics.analyzePullHistory('user_123');
// Returns: {
//   totalPulls: 150,
//   rarePulls: 12,
//   epicPulls: 3,
//   legendaryPulls: 1,
//   pityTriggers: 3,
//   averagePullsPerDay: 2.1,
//   favoriteBanners: ['banner_123', 'banner_124'],
//   pullTrends: [...],
//   recommendations: [...]
// }
```

#### **`getRecommendations(userId: string)`**
Gets personalized pull recommendations based on user behavior.

**Parameters:**
- `userId` (string): User identifier

**Returns:** `Promise<PullRecommendations>`

**Example:**
```typescript
const recommendations = await pullAnalytics.getRecommendations('user_123');
// Returns: {
//   recommendedBanners: [
//     { id: 'banner_123', reason: 'High pity progress', priority: 'high' },
//     { id: 'banner_124', reason: 'Missing featured character', priority: 'medium' }
//   ],
//   optimalPullTiming: '2024-12-05T10:00:00Z',
//   pullStrategy: 'Save for guaranteed epic',
//   resourceManagement: 'Focus on featured banners'
// }
```

#### **`calculatePullEfficiency(userId: string, timeRange: string)`**
Calculates pull efficiency and resource optimization.

**Parameters:**
- `userId` (string): User identifier
- `timeRange` (string): Time range for analysis (week, month, year)

**Returns:** `Promise<PullEfficiencyData>`

**Example:**
```typescript
const efficiency = await pullAnalytics.calculatePullEfficiency(
  'user_123',
  'month'
);
// Returns: {
//   efficiency: 0.85,
//   resourceUtilization: 0.92,
//   wasteRate: 0.08,
//   optimalPulls: 45,
//   actualPulls: 50,
//   recommendations: ['Reduce pulls on common banners']
// }
```

#### **`getPullTrends(userId: string, metric: string)`**
Analyzes pull trends for specific metrics.

**Parameters:**
- `userId` (string): User identifier
- `metric` (string): Metric to analyze (rarity, banner, timing)

**Returns:** `Promise<PullTrends>`

**Example:**
```typescript
const trends = await pullAnalytics.getPullTrends('user_123', 'rarity');
// Returns: {
//   trend: 'improving',
//   data: [
//     { date: '2024-11-01', rareRate: 0.15, epicRate: 0.03 },
//     { date: '2024-12-01', rareRate: 0.18, epicRate: 0.05 }
//   ],
//   prediction: 'Continued improvement expected'
// }
```

#### **`getBannerPerformance(bannerId: string)`**
Analyzes performance metrics for a specific banner.

**Parameters:**
- `bannerId` (string): Banner identifier

**Returns:** `Promise<BannerPerformance>`

**Example:**
```typescript
const performance = await pullAnalytics.getBannerPerformance('banner_123');
// Returns: {
//   totalPulls: 1250,
//   averagePullsPerUser: 8.3,
//   satisfaction: 0.87,
//   completionRate: 0.65,
//   revenue: 12500,
//   userFeedback: [...]
// }
```

#### **`predictNextPull(userId: string, bannerId: string)`**
Predicts the outcome of the next pull based on user history.

**Parameters:**
- `userId` (string): User identifier
- `bannerId` (string): Banner identifier

**Returns:** `Promise<PullPrediction>`

**Example:**
```typescript
const prediction = await pullAnalytics.predictNextPull('user_123', 'banner_123');
// Returns: {
//   predictedRarity: 'rare',
//   confidence: 0.75,
//   pityProgress: 45,
//   recommended: true,
//   reasoning: 'High pity progress, good timing'
// }
```

#### **`getCollectionAnalytics(userId: string)`**
Analyzes character collection patterns and completeness.

**Parameters:**
- `userId` (string): User identifier

**Returns:** `Promise<CollectionAnalytics>`

**Example:**
```typescript
const collectionAnalytics = await pullAnalytics.getCollectionAnalytics('user_123');
// Returns: {
//   totalCharacters: 45,
//   uniqueCharacters: 42,
//   completionRate: 0.84,
//   missingCharacters: ['char_123', 'char_124'],
//   duplicates: 3,
//   collectionValue: 1250,
//   recommendations: ['Focus on missing rare characters']
// }
```

### **Error Handling**

#### **Common Error Scenarios**
```typescript
// User not found
try {
  await pullAnalytics.analyzePullHistory('invalid_user');
} catch (error) {
  console.error('User not found:', error.message);
}

// Insufficient data
try {
  await pullAnalytics.getRecommendations('new_user');
} catch (error) {
  console.error('Insufficient pull history:', error.message);
}

// Invalid metric
try {
  await pullAnalytics.getPullTrends('user_123', 'invalid_metric');
} catch (error) {
  console.error('Invalid metric:', error.message);
}
```

---

## 🔗 **CROSS-SYSTEM INTEGRATION**

### **Integration Patterns**

#### **Character Growth → Team Management**
```typescript
// Update team effectiveness when character gains experience
const growthData = await characterGrowthSystem.addExperience(
  characterId,
  experience,
  source
);

if (growthData.levelUp) {
  await teamManagementSystem.recalculateTeamEffectiveness(teamId);
  await teamManagementSystem.updateTeamAnalytics(teamId);
}
```

#### **Progression Tracker → All Systems**
```typescript
// Track progress and update all systems
const progress = await progressionTracker.trackProgress(activity, metrics);

// Update character growth
await characterGrowthSystem.addExperience(
  characterId,
  progress.experience,
  'workout'
);

// Update team effectiveness
await teamManagementSystem.updateTeamEffectiveness(teamId, progress);

// Update pull analytics
await pullAnalytics.recordActivity(userId, 'workout', progress);
```

#### **Gacha System → Collection Hub**
```typescript
// Add pulled character to collection
const pullResult = await advancedGachaSystem.performPull(bannerId, pullType);

if (pullResult.characters.length > 0) {
  for (const character of pullResult.characters) {
    await collectionHub.addCharacter(character);
  }
  
  // Update collection analytics
  await pullAnalytics.recordPull(userId, pullResult);
}
```

#### **Team Management → Character Visual**
```typescript
// Update character mood based on team performance
const teamAnalytics = await teamManagementSystem.getTeamAnalytics(teamId);

for (const character of team.characters) {
  const mood = calculateCharacterMood(teamAnalytics, character);
  await characterVisualSystem.updateCharacterMood(character.id, mood);
}
```

---

## 📊 **PERFORMANCE CONSIDERATIONS**

### **API Optimization Guidelines**
- Use caching for frequently accessed data
- Implement pagination for large datasets
- Use batch operations for multiple updates
- Optimize database queries with proper indexing
- Implement rate limiting for high-frequency calls

### **Error Recovery Patterns**
```typescript
// Retry pattern for network failures
const retryOperation = async (operation: Function, maxRetries: number = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Fallback pattern for system failures
const getCharacterData = async (characterId: string) => {
  try {
    return await characterGrowthSystem.getCharacterGrowth(characterId);
  } catch (error) {
    console.error('Character system unavailable, using fallback');
    return getFallbackCharacterData(characterId);
  }
};
```

---

**This API documentation provides comprehensive coverage of all core systems with detailed method descriptions, usage examples, and integration patterns for successful implementation.** 