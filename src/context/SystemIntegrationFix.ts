// src/context/SystemIntegrationFix.ts
// Fixes for cross-system communication and integration issues

import { useEffect, useCallback, useRef } from 'react';

/**
 * System Integration Manager - Fixes communication between contexts
 */
export class SystemIntegrationManager {
  private static instance: SystemIntegrationManager;
  private eventBus: Map<string, Array<(data: any) => void>> = new Map();
  private errorQueue: Array<{ system: string; error: Error; timestamp: number }> = [];
  private healthChecks: Map<string, { status: 'healthy' | 'degraded' | 'failed'; lastCheck: number }> = new Map();

  static getInstance(): SystemIntegrationManager {
    if (!SystemIntegrationManager.instance) {
      SystemIntegrationManager.instance = new SystemIntegrationManager();
    }
    return SystemIntegrationManager.instance;
  }

  /**
   * Register system health check
   */
  registerSystem(systemName: string): void {
    this.healthChecks.set(systemName, {
      status: 'healthy',
      lastCheck: Date.now()
    });
  }

  /**
   * Subscribe to system events
   */
  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.eventBus.has(event)) {
      this.eventBus.set(event, []);
    }
    this.eventBus.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventBus.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emit system event with error handling
   */
  emit(event: string, data: any): void {
    try {
      const callbacks = this.eventBus.get(event);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            this.logError('EventCallback', error as Error);
          }
        });
      }
    } catch (error) {
      this.logError('EventEmission', error as Error);
    }
  }

  /**
   * Log system error
   */
  logError(system: string, error: Error): void {
    this.errorQueue.push({
      system,
      error,
      timestamp: Date.now()
    });

    // Update system health
    this.healthChecks.set(system, {
      status: 'degraded',
      lastCheck: Date.now()
    });

    // Clean old errors (keep last 100)
    if (this.errorQueue.length > 100) {
      this.errorQueue.splice(0, this.errorQueue.length - 100);
    }

    console.error(`System Error in ${system}:`, error);
  }

  /**
   * Get system health status
   */
  getSystemHealth(): Record<string, any> {
    const now = Date.now();
    const health: Record<string, any> = {};

    this.healthChecks.forEach((check, system) => {
      const timeSinceCheck = now - check.lastCheck;
      const isStale = timeSinceCheck > 30000; // 30 seconds

      health[system] = {
        status: isStale ? 'failed' : check.status,
        lastCheck: check.lastCheck,
        timeSinceCheck,
        isStale
      };
    });

    return health;
  }

  /**
   * Clear errors for system
   */
  clearErrors(system?: string): void {
    if (system) {
      this.errorQueue = this.errorQueue.filter(error => error.system !== system);
      this.healthChecks.set(system, {
        status: 'healthy',
        lastCheck: Date.now()
      });
    } else {
      this.errorQueue = [];
      this.healthChecks.forEach((_, systemName) => {
        this.healthChecks.set(systemName, {
          status: 'healthy',
          lastCheck: Date.now()
        });
      });
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(system?: string, limit: number = 10): Array<any> {
    let errors = this.errorQueue;
    
    if (system) {
      errors = errors.filter(error => error.system === system);
    }

    return errors
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(error => ({
        system: error.system,
        message: error.error.message,
        timestamp: error.timestamp,
        stack: error.error.stack
      }));
  }
}

/**
 * Hook for system integration
 */
export const useSystemIntegration = (systemName: string) => {
  const manager = useRef(SystemIntegrationManager.getInstance());
  const subscriptions = useRef<Array<() => void>>([]);

  useEffect(() => {
    // Register system
    manager.current.registerSystem(systemName);

    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.current.forEach(unsubscribe => unsubscribe());
      subscriptions.current = [];
    };
  }, [systemName]);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    const unsubscribe = manager.current.subscribe(event, callback);
    subscriptions.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  const emit = useCallback((event: string, data: any) => {
    manager.current.emit(event, data);
  }, []);

  const logError = useCallback((error: Error) => {
    manager.current.logError(systemName, error);
  }, [systemName]);

  const clearErrors = useCallback(() => {
    manager.current.clearErrors(systemName);
  }, [systemName]);

  return {
    subscribe,
    emit,
    logError,
    clearErrors,
    getHealth: () => manager.current.getSystemHealth(),
    getErrors: (limit?: number) => manager.current.getRecentErrors(systemName, limit)
  };
};

/**
 * Context integration fixes
 */
export const useContextSyncFix = () => {
  const integration = useSystemIntegration('ContextSync');

  // Fix for workout-character integration
  const syncWorkoutWithCharacters = useCallback(async (workoutData: any) => {
    try {
      integration.emit('workout:completed', workoutData);
      integration.emit('character:experience', {
        characterIds: workoutData.activeCharacters || [],
        experience: calculateExperience(workoutData)
      });
    } catch (error) {
      integration.logError(error as Error);
    }
  }, [integration]);

  // Fix for gacha-collection sync
  const syncGachaWithCollection = useCallback(async (pullResults: any) => {
    try {
      integration.emit('gacha:pull_completed', pullResults);
      integration.emit('collection:characters_added', {
        characters: pullResults.characters || []
      });
    } catch (error) {
      integration.logError(error as Error);
    }
  }, [integration]);

  // Fix for team-stats sync
  const syncTeamWithStats = useCallback(async (teamData: any) => {
    try {
      integration.emit('team:updated', teamData);
      integration.emit('stats:team_effectiveness', {
        teamId: teamData.id,
        effectiveness: calculateTeamEffectiveness(teamData)
      });
    } catch (error) {
      integration.logError(error as Error);
    }
  }, [integration]);

  return {
    syncWorkoutWithCharacters,
    syncGachaWithCollection,
    syncTeamWithStats,
    ...integration
  };
};

// Utility functions
const calculateExperience = (workoutData: any): number => {
  const baseDuration = workoutData.duration || 30;
  const difficulty = workoutData.difficulty || 1;
  const rating = workoutData.rating || 75;
  
  return Math.floor((baseDuration * difficulty * rating) / 100);
};

const calculateTeamEffectiveness = (teamData: any): number => {
  // Simplified team effectiveness calculation
  const characters = teamData.characters || [];
  if (characters.length === 0) return 0;
  
  const averageLevel = characters.reduce((sum: number, char: any) => sum + (char.level || 1), 0) / characters.length;
  const synergyBonus = teamData.synergies ? teamData.synergies.length * 0.1 : 0;
  
  return Math.min(100, (averageLevel * 10) + (synergyBonus * 100));
};

export default SystemIntegrationManager;