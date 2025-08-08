// src/components/multi-gymmy-ui/team-management/index.ts
// Sprint 2: Team Management UI Components
// Central barrel export for all team management components

// Core team builder components
export { default as TeamBuilder } from './TeamBuilder';
export { default as CharacterSlot } from './CharacterSlot';
export { default as DragDropArea } from './DragDropArea';

// Synergy visualization components
export { default as SynergyVisualizer } from './SynergyVisualizer';
export { default as ConnectionLines } from './ConnectionLines';

// Team preset management
export { default as TeamPresetManager } from './TeamPresetManager';
export { default as TeamSaveLoad } from './TeamSaveLoad';

// Performance analytics
export { default as TeamAnalyticsDashboard } from './TeamAnalyticsDashboard';
export { default as EffectivenessMetrics } from './EffectivenessMetrics';

// Modular components
export * from './components/TeamBuilderModals';
export * from './components/TeamBuilderRenders';
export * from './components/PresetManagerComponents';

// Team management utilities
export * from './utils';
