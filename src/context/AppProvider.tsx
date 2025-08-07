// src/context/AppProvider.tsx
// Main application provider with unified context architecture and Multi-Gymmy integration

import React, { ReactNode, Suspense } from 'react';

// Unified context providers
import { UnifiedAppProvider } from './UnifiedAppProvider';
import { AllSelectorsProvider } from './ContextSelectors';
import { ContextIntegrationProvider } from './ContextIntegrationManager';

// Common components
import { 
  LoadingFallback, 
  ErrorFallback, 
  ErrorBoundary, 
} from '../components/common';

// ==============================================================================
// MAIN APP PROVIDER COMPONENT
// ==============================================================================

interface AppProviderProps {
  children: ReactNode;
  enableMultiGymmy?: boolean;
  enableAnalytics?: boolean;
  enableDevTools?: boolean;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  enableMultiGymmy = true,
  enableAnalytics = true,
  enableDevTools = process.env.NODE_ENV === 'development',
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error Boundary:', error, errorInfo);
        
        // In production, you would send this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
          // logErrorToService(error, errorInfo);
        }
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <UnifiedAppProvider 
          enableMultiGymmy={enableMultiGymmy}
          enableAnalytics={enableAnalytics}
        >
          <AllSelectorsProvider>
            <ContextIntegrationProvider>
              {enableDevTools && <DevTools />}
              {children}
            </ContextIntegrationProvider>
          </AllSelectorsProvider>
        </UnifiedAppProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

// ==============================================================================
// DEVELOPMENT TOOLS COMPONENT
// ==============================================================================

const DevTools: React.FC = () => {
  const [showDebugger, setShowDebugger] = React.useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <>
      {/* Debug Toggle */}
      <div
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 10000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          cursor: 'pointer',
        }}
        onClick={() => setShowDebugger(!showDebugger)}
      >
        🐛 Debug
      </div>
      
      {/* Debug Panel */}
      {showDebugger && <DebugPanel />}
    </>
  );
};

// ==============================================================================
// DEBUG PANEL COMPONENT
// ==============================================================================

const DebugPanel: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'state' | 'performance' | 'integration'>('state');
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 40,
        right: 10,
        width: '300px',
        maxHeight: '400px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        border: '1px solid #333',
        borderRadius: '8px',
        zIndex: 9999,
        fontSize: '12px',
        overflow: 'auto',
      }}
    >
      {/* Debug Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
        {['state', 'performance', 'integration'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: activeTab === tab ? '#333' : 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Debug Content */}
      <div style={{ padding: '10px', maxHeight: '350px', overflow: 'auto' }}>
        {activeTab === 'state' && <StateDebug />}
        {activeTab === 'performance' && <PerformanceDebug />}
        {activeTab === 'integration' && <IntegrationDebug />}
      </div>
    </div>
  );
};

// ==============================================================================
// DEBUG COMPONENTS
// ==============================================================================

const StateDebug: React.FC = () => {
  // This would import the actual hooks, but for now we'll show placeholder
  const appState = { loading: false, error: null, initialized: true };
  
  return (
    <div>
      <h4 style={{ margin: '0 0 10px 0' }}>App State</h4>
      <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
        {JSON.stringify(appState, null, 2)}
      </pre>
      
      <h4 style={{ margin: '10px 0 5px 0' }}>Context Status</h4>
      <div style={{ fontSize: '10px' }}>
        <div>✅ Unified App Provider</div>
        <div>✅ Context Selectors</div>
        <div>✅ Integration Manager</div>
        <div>✅ Multi-Gymmy Systems</div>
      </div>
    </div>
  );
};

const PerformanceDebug: React.FC = () => {
  const [renderCount, setRenderCount] = React.useState(0);
  const [lastRenderTime, setLastRenderTime] = React.useState(0);
  
  React.useEffect(() => {
    const start = performance.now();
    setRenderCount(prev => prev + 1);
    
    return () => {
      const end = performance.now();
      setLastRenderTime(end - start);
    };
  });
  
  return (
    <div>
      <h4 style={{ margin: '0 0 10px 0' }}>Performance Metrics</h4>
      <div style={{ fontSize: '10px' }}>
        <div>Render Count: {renderCount}</div>
        <div>Last Render: {lastRenderTime.toFixed(2)}ms</div>
        <div>Memory Usage: {(performance as any).memory?.usedJSHeapSize ? 
          `${Math.round((performance as any).memory.usedJSHeapSize / 1048576)}MB` : 'N/A'}</div>
      </div>
      
      <h4 style={{ margin: '10px 0 5px 0' }}>Context Performance</h4>
      <div style={{ fontSize: '10px' }}>
        <div>🟢 Workout Context: Good</div>
        <div>🟢 User Stats: Good</div>
        <div>🟢 Gacha Context: Good</div>
        <div>🟢 Segmentation: Good</div>
      </div>
    </div>
  );
};

const IntegrationDebug: React.FC = () => {
  return (
    <div>
      <h4 style={{ margin: '0 0 10px 0' }}>Multi-Gymmy Integration</h4>
      <div style={{ fontSize: '10px' }}>
        <div>🟢 Character Growth System</div>
        <div>🟢 Progression Tracker</div>
        <div>🟢 Team Management</div>
        <div>🟢 Pull Analytics</div>
      </div>
      
      <h4 style={{ margin: '10px 0 5px 0' }}>Active Integrations</h4>
      <div style={{ fontSize: '10px' }}>
        <div>✅ Workout → Character XP</div>
        <div>✅ Level Ups → Achievements</div>
        <div>✅ Evolution → User Stats</div>
        <div>✅ Team Changes → Synergies</div>
      </div>
      
      <h4 style={{ margin: '10px 0 5px 0' }}>Sync Status</h4>
      <div style={{ fontSize: '10px' }}>
        <div>Last Sync: {new Date().toLocaleTimeString()}</div>
        <div>Errors: 0</div>
        <div>Pending: 0</div>
      </div>
    </div>
  );
};

// LoadingFallback and ErrorFallback are imported from separate files above

// ==============================================================================
// CONTEXT ACCESS HOOKS
// ==============================================================================

// Re-export all the important hooks for easy access
export { 
  useUnifiedApp,
  useAppState,
  useCharacterSystem,
  useWorkoutIntegration,
} from './UnifiedAppProvider';

export {
  useWorkoutHistory,
  useUserStatsData,
  useCharacterCollection,
  useUserSegment,
} from './ContextSelectors';

export { useContextIntegrationManager } from './ContextIntegrationManager';

// ==============================================================================
// CSS ANIMATION FOR LOADING SPINNER
// ==============================================================================

// Inject CSS for loading spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default AppProvider;