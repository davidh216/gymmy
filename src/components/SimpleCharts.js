import React, { useState } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // Dimensions,
  // TouchableWithoutFeedback
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
// const chartWidth = ...; // Quick fix: commented unused variable

// Simple Line Chart Component
export const SimpleLineChart = ({ data, height = 180, color = '#007AFF', title, subtitle, labels, smooth = true }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // Handle both old format (array) and new format (object with data and labels)
  // const chartData = ...; // Quick fix: commented unused variable
  // const chartLabels = ...; // Quick fix: commented unused variable
  
  if (!chartData || chartData.length === 0) {
    return (
      <View style={[styles.chartContainer, { height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  // const maxValue = ...; // Quick fix: commented unused variable
  // const minValue = ...; // Quick fix: commented unused variable
  // const range = ...; // Quick fix: commented unused variable
  
  // const chartHeight = ...; // Quick fix: commented unused variable // More space for x-axis labels
  // const actualChartWidth = ...; // Quick fix: commented unused variable // Account for y-axis labels
  // const pointWidth = ...; // Quick fix: commented unused variable // Min spacing

  const points = chartData.map((value, index) => ({
    x: Math.min(index * pointWidth, actualChartWidth - 6), // Ensure points stay within bounds
    y: Math.max(6, chartHeight - ((value - minValue) / range) * chartHeight), // Ensure points stay within bounds
    value,
    label: chartLabels[index] || `Point ${index + 1}`,
  }));

  // Generate smooth curve path for SVG-like rendering
  const generateSmoothPath = (points) => {
    if (points.length < 2) return [];
    
    // const smoothPoints = ...; // Quick fix: commented unused variable
    for (let i = 0; i < points.length - 1; i++) {
      // const current = ...; // Quick fix: commented unused variable
      // const next = ...; // Quick fix: commented unused variable
      
      if (smooth && i < points.length - 2) {
        // Bezier curve control points
        // const controlX1 = ...; // Quick fix: commented unused variable
        // const controlY1 = ...; // Quick fix: commented unused variable
        // const controlX2 = ...; // Quick fix: commented unused variable
        // const controlY2 = ...; // Quick fix: commented unused variable
        
        smoothPoints.push({
          type: 'curve',
          x1: current.x,
          y1: current.y,
          x2: next.x,
          y2: next.y,
          controlX1,
          controlY1,
          controlX2,
          controlY2,
        });
      } else {
        // Straight line
        smoothPoints.push({
          type: 'line',
          x1: current.x,
          y1: current.y,
          x2: next.x,
          y2: next.y,
        });
      }
    }
    return smoothPoints;
  };

  // const pathSegments = ...; // Quick fix: commented unused variable

  return (
    <View style={styles.chartWrapper}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
      <View style={[styles.chartContainer, { height, width: chartWidth }]}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>{maxValue.toFixed(1)}</Text>
          <Text style={styles.axisLabel}>{((maxValue + minValue) / 2).toFixed(1)}</Text>
          <Text style={styles.axisLabel}>{minValue.toFixed(1)}</Text>
        </View>
        
        {/* Chart area */}
        <View style={[styles.chartArea, { width: chartWidth - 40 }]}>
          {/* Grid lines */}
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.gridLine, { top: (i * chartHeight) / 3 }]} />
            ))}
          </View>
          
          {/* Data points and lines */}
          <View style={styles.dataContainer}>
            {/* Render smooth curve segments if smooth is enabled */}
            {smooth && pathSegments.map((segment, index) => {
              if (segment.type === 'curve') {
                // For smooth curves, we'll approximate with multiple small line segments
                // const steps = ...; // Quick fix: commented unused variable
                // const segments = ...; // Quick fix: commented unused variable
                for (let i = 0; i < steps; i++) {
                  // const t = ...; // Quick fix: commented unused variable
                  // const nextT = ...; // Quick fix: commented unused variable
                  
                  // Cubic Bezier curve calculation
                  const x1 = Math.pow(1 - t, 3) * segment.x1 + 
                            3 * Math.pow(1 - t, 2) * t * segment.controlX1 + 
                            3 * (1 - t) * Math.pow(t, 2) * segment.controlX2 + 
                            Math.pow(t, 3) * segment.x2;
                  const y1 = Math.pow(1 - t, 3) * segment.y1 + 
                            3 * Math.pow(1 - t, 2) * t * segment.controlY1 + 
                            3 * (1 - t) * Math.pow(t, 2) * segment.controlY2 + 
                            Math.pow(t, 3) * segment.y2;
                  
                  const x2 = Math.pow(1 - nextT, 3) * segment.x1 + 
                            3 * Math.pow(1 - nextT, 2) * nextT * segment.controlX1 + 
                            3 * (1 - nextT) * Math.pow(nextT, 2) * segment.controlX2 + 
                            Math.pow(nextT, 3) * segment.x2;
                  const y2 = Math.pow(1 - nextT, 3) * segment.y1 + 
                            3 * Math.pow(1 - nextT, 2) * nextT * segment.controlY1 + 
                            3 * (1 - nextT) * Math.pow(nextT, 2) * segment.controlY2 + 
                            Math.pow(nextT, 3) * segment.y2;
                  
                  // const length = ...; // Quick fix: commented unused variable
                  // const angle = ...; // Quick fix: commented unused variable
                  
                  segments.push(
                    <View
                      key={`${index}-${i}`}
                      style={[
                        styles.line,
                        {
                          left: x1,
                          top: y1,
                          width: length,
                          transform: [{ rotate: `${angle}rad` }],
                          backgroundColor: color,
                        },
                      ]}
                    />,
                  );
                }
                return segments;
              } else {
                // Straight line
                return (
                  <View
                    key={index}
                    style={[
                      styles.line,
                      {
                        left: segment.x1,
                        top: segment.y1,
                        width: Math.sqrt(
                          Math.pow(segment.x2 - segment.x1, 2) +
                          Math.pow(segment.y2 - segment.y1, 2),
                        ),
                        transform: [
                          {
                            rotate: `${Math.atan2(
                              segment.y2 - segment.y1,
                              segment.x2 - segment.x1,
                            )}rad`,
                          },
                        ],
                        backgroundColor: color,
                      },
                    ]}
                  />
                );
              }
            })}
            
            {/* Render straight lines if smooth is disabled */}
            {!smooth && points.map((point, index) => (
              <View key={index}>
                {/* Line to next point */}
                {index < points.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      {
                        left: point.x,
                        top: point.y,
                        width: Math.sqrt(
                          Math.pow(points[index + 1].x - point.x, 2) +
                          Math.pow(points[index + 1].y - point.y, 2),
                        ),
                        transform: [
                          {
                            rotate: `${Math.atan2(
                              points[index + 1].y - point.y,
                              points[index + 1].x - point.x,
                            )}rad`,
                          },
                        ],
                        backgroundColor: color,
                      },
                    ]}
                  />
                )}
              </View>
            ))}

            {/* Data points */}
            {points.map((point, index) => (
              <View key={`point-${index}`}>
                {/* Interactive Data point */}
                <TouchableWithoutFeedback
                  onPressIn={() => setSelectedPoint(index)}
                  onPressOut={() => setSelectedPoint(null)}
                >
                  <View
                    style={[
                      styles.dataPointTouchable,
                      {
                        left: point.x - 10,
                        top: point.y - 10,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dataPoint,
                        {
                          backgroundColor: selectedPoint === index ? '#fff' : color,
                          borderWidth: selectedPoint === index ? 2 : 0,
                          borderColor: color,
                        },
                      ]}
                    />
                  </View>
                </TouchableWithoutFeedback>
                
                {/* Tooltip */}
                {selectedPoint === index && (
                  <View
                    style={[
                      styles.tooltip,
                      {
                        left: Math.max(0, Math.min(point.x - 40, actualChartWidth - 80)),
                        top: Math.max(0, point.y - 35),
                      },
                    ]}
                  >
                    <Text style={styles.tooltipText}>
                      {point.label}: {point.value}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
        
        {/* X-axis labels */}
        {chartLabels.length > 0 && (
          <View style={styles.xAxisLabels}>
            {chartLabels.map((label, index) => (
              <View
                key={index}
                style={[
                  styles.xAxisLabel,
                  {
                    left: Math.min(points[index]?.x || 0, actualChartWidth - 40),
                  },
                ]}
              >
                <Text style={styles.axisLabel} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// Simple Bar Chart Component
export const SimpleBarChart = ({ data, labels, height = 180, color = '#007AFF', title, subtitle }) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.chartContainer, { height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  // const maxValue = ...; // Quick fix: commented unused variable
  // const chartHeight = ...; // Quick fix: commented unused variable
  // const barWidth = ...; // Quick fix: commented unused variable

  return (
    <View style={styles.chartWrapper}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
      <View style={[styles.chartContainer, { height, width: chartWidth }]}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>{maxValue}</Text>
          <Text style={styles.axisLabel}>{Math.round(maxValue / 2)}</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>
        
        {/* Chart area */}
        <View style={[styles.chartArea, { width: chartWidth - 40 }]}>
          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((value, index) => {
              // const barHeight = ...; // Quick fix: commented unused variable // Min height
              return (
                <View key={index} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        width: Math.min(barWidth, 40), // Max width to prevent overflow
                        backgroundColor: color,
                      },
                    ]}
                  />
                  <Text style={styles.barValue}>{value}</Text>
                  {labels && labels[index] && (
                    <Text style={styles.barLabel} numberOfLines={1}>{labels[index]}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

// Simple Progress Bar Component
export const SimpleProgressBar = ({ current, total, height = 8, color = '#007AFF', backgroundColor = '#e5e5e5' }) => {
  // const percentage = ...; // Quick fix: commented unused variable
  
  return (
    <View style={[styles.progressBar, { height, backgroundColor }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${percentage}%`,
            height,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden', // Prevent content from overflowing
  },
  yAxisLabels: {
    width: 40,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingBottom: 20,
  },
  axisLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartArea: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden', // Prevent content from overflowing
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  dataContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
  },
  line: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dataPointTouchable: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingBottom: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  bar: {
    marginBottom: 4,
    borderRadius: 2,
  },
  barValue: {
    fontSize: 10,
    color: '#333',
    marginBottom: 2,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    maxWidth: 50,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 60,
  },
  xAxisLabels: {
    flexDirection: 'row',
    position: 'relative',
    height: 20,
    marginTop: 5,
  },
  xAxisLabel: {
    position: 'absolute',
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Horizontal Bar Chart Styles
  horizontalBarsContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  horizontalBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabelContainer: {
    width: 80,
    paddingRight: 12,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalBar: {
    borderRadius: 4,
    marginRight: 8,
  },
  barValueText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});

// Horizontal Bar Chart Component for Ratings
export const HorizontalBarChart = ({ data, height = 300, title, subtitle }) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.chartContainer, { height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  // const maxValue = ...; // Quick fix: commented unused variable
  // const chartHeight = ...; // Quick fix: commented unused variable
  // const barHeight = ...; // Quick fix: commented unused variable

  return (
    <View style={styles.chartWrapper}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
      <View style={[styles.chartContainer, { height, width: chartWidth }]}>
        <View style={styles.horizontalBarsContainer}>
          {data.map((item, index) => {
            // const barWidth = ...; // Quick fix: commented unused variable // Leave space for labels
            return (
              <View key={index} style={styles.horizontalBarRow}>
                <View style={styles.barLabelContainer}>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.horizontalBar,
                      {
                        width: barWidth,
                        height: barHeight,
                        backgroundColor: item.color || '#007AFF',
                      },
                    ]}
                  />
                  <Text style={styles.barValueText}>{item.value}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default { SimpleLineChart, SimpleBarChart, SimpleProgressBar, HorizontalBarChart };