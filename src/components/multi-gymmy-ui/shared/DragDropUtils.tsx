// src/components/multi-gymmy-ui/shared/DragDropUtils.tsx
// Drag and drop utilities for character interaction and team management

import {
  // useRef,
  // useCallback,
  // useMemo
} from 'react';
import {
  // Animated,
  // PanGestureHandler,
  // State
} from 'react-native-gesture-handler';
import {
  // GymmyCharacter
} from '../../../context/types/MultiGymmyTypes';

// ==============================================================================
// TYPES AND INTERFACES
// ==============================================================================

export interface DragDropConfig {
  enabled?: boolean;
  threshold?: number;
  snapBackOnCancel?: boolean;
  hapticFeedback?: boolean;
  visualFeedback?: boolean;
}

export interface DropZone {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  accepts?: (character: GymmyCharacter) => boolean;
  onDrop?: (character: GymmyCharacter, position: { x: number; y: number }) => void;
  onHover?: (character: GymmyCharacter, isOver: boolean) => void;
}

export interface DragState {
  isDragging: boolean;
  dragPosition: { x: number; y: number };
  startPosition: { x: number; y: number };
  currentDropZone: DropZone | null;
}

// ==============================================================================
// DRAG AND DROP HOOK
// ==============================================================================

export const useDragDrop = (
  character: GymmyCharacter,
  dropZones: DropZone[] = [],
  config: DragDropConfig = {}
) => {
  const {
    enabled = true,
    threshold = 10,
    snapBackOnCancel = true,
    hapticFeedback = true,
    visualFeedback = true,
  } = config;

  // Animation values
  // const translateX = ...; // Quick fix: commented unused variable
  // const translateY = ...; // Quick fix: commented unused variable
  // const scale = ...; // Quick fix: commented unused variable
  // const opacity = ...; // Quick fix: commented unused variable

  // Drag state
  const dragState = useRef<DragState>({
    isDragging: false,
    dragPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    currentDropZone: null,
  });

  // ==============================================================================
  // UTILITY FUNCTIONS
  // ==============================================================================

  const isPointInBounds = useCallback((
    point: { x: number; y: number },
    bounds: { x: number; y: number; width: number; height: number }
  ): boolean => {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }, []);

  // const findDropZone = ...; // Quick fix: commented unused variable y: number }): DropZone | null => {
    for (const zone of dropZones) {
      if (isPointInBounds(position, zone.bounds)) {
        if (!zone.accepts || zone.accepts(character)) {
          return zone;
        }
      }
    }
    return null;
  }, [dropZones, character, isPointInBounds]);

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback) {
      // Implementation would depend on the haptic library used
      // For now, we'll just log it
      console.log('Haptic feedback triggered');
    }
  }, [hapticFeedback]);

  // ==============================================================================
  // DRAG HANDLERS
  // ==============================================================================

  const onGestureEvent = useCallback(
    Animated.event(
      [
        {
          nativeEvent: {
            translationX: translateX,
            translationY: translateY,
          },
        },
      ],
      {
        useNativeDriver: false,
        listener: (event: any) => {
          if (!enabled) return;

          const { translationX, translationY, absoluteX, absoluteY } = event.nativeEvent;
          
          dragState.current.dragPosition = {
            x: dragState.current.startPosition.x + translationX,
            y: dragState.current.startPosition.y + translationY,
          };

          // Check for drop zone hover
          // const currentZone = ...; // Quick fix: commented unused variable
          
          if (currentZone !== dragState.current.currentDropZone) {
            // Exit previous zone
            if (dragState.current.currentDropZone?.onHover) {
              dragState.current.currentDropZone.onHover(character, false);
            }
            
            // Enter new zone
            if (currentZone?.onHover) {
              currentZone.onHover(character, true);
              triggerHaptic();
            }
            
            dragState.current.currentDropZone = currentZone;
          }
        },
      }
    ),
    [enabled, translateX, translateY, findDropZone, character, triggerHaptic]
  );

  const onHandlerStateChange = useCallback(
    (event: any) => {
      if (!enabled) return;

      const { state, absoluteX, absoluteY, translationX, translationY } = event.nativeEvent;

      switch (state) {
        case State.BEGAN:
          dragState.current.isDragging = true;
          dragState.current.startPosition = { x: absoluteX, y: absoluteY };
          
          if (visualFeedback) {
            Animated.parallel([
              Animated.timing(scale, {
                toValue: 1.1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0.8,
                duration: 150,
                useNativeDriver: true,
              }),
            ]).start();
          }
          
          triggerHaptic();
          break;

        case State.ACTIVE:
          // Handled by onGestureEvent
          break;

        case State.END:
        case State.CANCELLED:
          dragState.current.isDragging = false;
          
          // const finalPosition = ...; // Quick fix: commented unused variable
          // const dropZone = ...; // Quick fix: commented unused variable
          
          if (dropZone && state === State.END) {
            // Successful drop
            if (dropZone.onDrop) {
              dropZone.onDrop(character, finalPosition);
            }
            triggerHaptic();
            
            // Animate to drop position or reset
            if (snapBackOnCancel) {
              Animated.parallel([
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                  toValue: 0,
                  useNativeDriver: true,
                }),
                Animated.timing(scale, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
              ]).start();
            }
          } else {
            // No drop zone or cancelled - snap back
            if (snapBackOnCancel) {
              Animated.parallel([
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                  toValue: 0,
                  useNativeDriver: true,
                }),
                Animated.timing(scale, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
              ]).start();
            }
          }
          
          // Clear current drop zone hover
          if (dragState.current.currentDropZone?.onHover) {
            dragState.current.currentDropZone.onHover(character, false);
          }
          dragState.current.currentDropZone = null;
          break;
      }
    },
    [enabled, scale, opacity, visualFeedback, findDropZone, character, triggerHaptic, snapBackOnCancel, translateX, translateY]
  );

  // ==============================================================================
  // ANIMATED STYLES
  // ==============================================================================

  const animatedStyle = useMemo(
    () => ({
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity,
    }),
    [translateX, translateY, scale, opacity]
  );

  // ==============================================================================
  // RETURN VALUES
  // ==============================================================================

  return {
    // Pan gesture handler props
    panHandlerProps: {
      onGestureEvent,
      onHandlerStateChange,
      enabled,
    },
    
    // Animated style for the draggable component
    animatedStyle,
    
    // Current drag state (read-only)
    dragState: {
      isDragging: dragState.current.isDragging,
      dragPosition: dragState.current.dragPosition,
      currentDropZone: dragState.current.currentDropZone,
    },
    
    // Control methods
    resetPosition: () => {
      translateX.setValue(0);
      translateY.setValue(0);
      scale.setValue(1);
      opacity.setValue(1);
    },
    
    // Animation values (for custom animations)
    animationValues: {
      translateX,
      translateY,
      scale,
      opacity,
    },
  };
};

// ==============================================================================
// DROP ZONE UTILITIES
// ==============================================================================

export const createDropZone = (
  id: string,
  bounds: { x: number; y: number; width: number; height: number },
  options: {
    accepts?: (character: GymmyCharacter) => boolean;
    onDrop?: (character: GymmyCharacter, position: { x: number; y: number }) => void;
    onHover?: (character: GymmyCharacter, isOver: boolean) => void;
  } = {}
): DropZone => ({
  id,
  bounds,
  ...options,
});

// Predefined drop zone validators
export const DropZoneValidators = {
  // Accept any character
  acceptAll: () => true,
  
  // Accept only specific rarity
  rarityOnly: (rarity: string) => (character: GymmyCharacter) => 
    character.rarity === rarity,
  
  // Accept only specific specialization
  specializationOnly: (specialization: string) => (character: GymmyCharacter) => 
    character.specialization === specialization,
  
  // Accept only characters above certain level
  minLevel: (level: number) => (character: GymmyCharacter) => 
    character.level >= level,
  
  // Accept only evolved characters
  evolvedOnly: () => (character: GymmyCharacter) => 
    (character.evolution_stage || 0) > 0,
  
  // Custom validator
  custom: (validator: (character: GymmyCharacter) => boolean) => validator,
};

export default {
  useDragDrop,
  createDropZone,
  DropZoneValidators,
};