// src/components/multi-gymmy-ui/team-management/DragDropArea.tsx
// Drag and drop area for team management interactions

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { GymmyCharacter } from '../../../../context/types/MultiGymmyTypes';

const { width, height } = Dimensions.get('window');

interface DragDropAreaProps {
  children: React.ReactNode;
  onDrop: (character: GymmyCharacter, position: { x: number; y: number }) => void;
  isActive: boolean;
}

const DragDropArea: React.FC<DragDropAreaProps> = ({
  children,
  onDrop,
  isActive,
}) => {
  const [draggedItem, setDraggedItem] = useState<GymmyCharacter | null>(null);
  const [dropZones, setDropZones] = useState<Array<{ id: string; x: number; y: number; width: number; height: number }>>([]);
  
  const dragAnimation = useMemo(() => new Animated.Value(0), []);
  const scaleAnimation = useMemo(() => new Animated.Value(1), []);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => isActive,
    onMoveShouldSetPanResponder: () => isActive,
    onPanResponderGrant: (evt, gestureState) => {
      if (draggedItem) {
        Animated.parallel([
          Animated.timing(dragAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (draggedItem) {
        // Update drag position
        dragAnimation.setValue(gestureState.dy);
        
        // Check for drop zone intersections
        const dropPosition = { x: gestureState.moveX, y: gestureState.moveY };
        const intersectingZone = dropZones.find(zone => 
          dropPosition.x >= zone.x && 
          dropPosition.x <= zone.x + zone.width &&
          dropPosition.y >= zone.y && 
          dropPosition.y <= zone.y + zone.height
        );
        
        if (intersectingZone) {
          // Highlight drop zone
          highlightDropZone(intersectingZone.id);
        }
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (draggedItem) {
        const dropPosition = { x: gestureState.moveX, y: gestureState.moveY };
        
        // Find intersecting drop zone
        const intersectingZone = dropZones.find(zone => 
          dropPosition.x >= zone.x && 
          dropPosition.x <= zone.x + zone.width &&
          dropPosition.y >= zone.y && 
          dropPosition.y <= zone.y + zone.height
        );
        
        if (intersectingZone) {
          // Handle drop
          onDrop(draggedItem, dropPosition);
        }
        
        // Reset animations
        Animated.parallel([
          Animated.timing(dragAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        
        setDraggedItem(null);
        clearDropZoneHighlights();
      }
    },
  }), [draggedItem, isActive, dropZones, onDrop, dragAnimation, scaleAnimation]);

  const registerDropZone = (id: string, x: number, y: number, width: number, height: number) => {
    setDropZones(prev => [...prev, { id, x, y, width, height }]);
  };

  const unregisterDropZone = (id: string) => {
    setDropZones(prev => prev.filter(zone => zone.id !== id));
  };

  const highlightDropZone = (zoneId: string) => {
    // Implementation for highlighting drop zones
    // This would typically involve updating visual state
  };

  const clearDropZoneHighlights = () => {
    // Implementation for clearing drop zone highlights
    // This would typically involve resetting visual state
  };

  const startDrag = (character: GymmyCharacter) => {
    setDraggedItem(character);
  };

  return (
    <View 
      style={styles.container}
      {...panResponder.panHandlers}
    >
      {children}
      {draggedItem && (
        <Animated.View
          style={[
            styles.dragPreview,
            {
              transform: [
                { scale: scaleAnimation },
                { translateY: dragAnimation },
              ],
            },
          ]}
        >
          {/* Drag preview content */}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  dragPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    zIndex: 1000,
    pointerEvents: 'none',
  },
});

export default DragDropArea;
