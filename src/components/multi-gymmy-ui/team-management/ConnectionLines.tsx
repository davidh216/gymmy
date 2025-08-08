// src/components/multi-gymmy-ui/team-management/ConnectionLines.tsx
// Visual connection lines for synergy relationships

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Svg, Line } from 'react-native-svg';
import { SynergyConnection } from './utils/SynergyUtils';

const { width, height } = Dimensions.get('window');

interface ConnectionLinesProps {
  connections: SynergyConnection[];
  characterPositions: Record<string, { x: number; y: number }>;
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  connections,
  characterPositions,
}) => {
  const renderConnection = (connection: SynergyConnection) => {
    const sourcePos = characterPositions[connection.sourceCharacterId];
    const targetPos = characterPositions[connection.targetCharacterId];
    
    if (!sourcePos || !targetPos) return null;

    const strokeWidth = Math.max(1, connection.strength / 20);
    const opacity = connection.isActive ? 0.8 : 0.3;

    return (
      <Line
        key={connection.id}
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        stroke={connection.color}
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeDasharray={connection.isActive ? undefined : "5,5"}
      />
    );
  };

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {connections.map(renderConnection)}
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});

export default ConnectionLines;
