import React, { useState, useEffect } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // ScrollView,
  // TouchableOpacity,
  // RefreshControl,
  // Dimensions,
  // AccessibilityInfo,
  // 
} from 'react-native';
import {
  // DESIGN_TOKENS,
  // getSegmentColor
} from '../../../../constants/designTokens';

const { width } = Dimensions.get('window');

// Types for analytics data
interface ImprovementData {
  id: string;
  dimension: string;
  improvement_percentage: number;
  confidence_score: number;
  detected_at: string;
  validation_status: 'pending' | 'validated' | 'rejected' | 'needs_review';
}

interface AnalyticsData {
  user_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  total_improvements: number;
  improvements_by_dimension: Record<string, number>;
  average_improvement_percentage: number;
  largest_improvement: ImprovementData;
  detection_accuracy: number;
  validation_success_rate: number;
  current_streak: number;
  weekly_goal: number;
  weekly_progress: number;
}

interface ImprovementAnalyticsProps {
  data: AnalyticsData;
  userSegment?: string;
  onRefresh?: () => Promise<void>;
  onExport?: () => void;
  onShare?: () => void;
  onTimeframeChange?: (timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time') => void;
}

const ImprovementAnalytics: React.FC<ImprovementAnalyticsProps> = ({
  data,
  userSegment,
  onRefresh,
  onExport,
  onShare,
  onTimeframeChange,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState(data.period);

  // Get segment color
  // const segmentColor = ...; // Quick fix: commented unused variable

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleTimeframeChange = (timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time') => {
    setSelectedTimeframe(timeframe);
    if (onTimeframeChange) {
      onTimeframeChange(timeframe);
    }
  };

  const getTimeframeLabel = (timeframe: string) => {
    const labels = {
      daily: 'Today',
      weekly: 'This Week',
      monthly: 'This Month',
      all_time: 'All Time',
    };
    return labels[timeframe] || timeframe;
  };

  const getImprovementTrend = () => {
    // const weeklyProgress = ...; // Quick fix: commented unused variable
    // const weeklyGoal = ...; // Quick fix: commented unused variable
    
    if (weeklyProgress >= weeklyGoal) {
      return { trend: 'exceeding', message: 'Exceeding your weekly goal!' };
    } else if (weeklyProgress >= weeklyGoal * 0.8) {
      return { trend: 'on_track', message: 'On track to meet your goal!' };
    } else {
      return { trend: 'behind', message: 'Keep pushing to reach your goal!' };
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Your 1% Better Journey</Text>
      <Text style={styles.subtitle}>Celebrating every step forward</Text>
      
      {/* Timeframe selector */}
      <View style={styles.timeframeSelector}>
        {(['daily', 'weekly', 'monthly', 'all_time'] as const).map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeButton,
              selectedTimeframe === timeframe && { backgroundColor: segmentColor },
            ]}
            onPress={() => handleTimeframeChange(timeframe)}
            accessible={true}
            accessibilityLabel={`View ${getTimeframeLabel(timeframe)} data`}
            accessibilityHint={`Shows improvement data for ${getTimeframeLabel(timeframe)}`}
          >
            <Text
              style={[
                styles.timeframeText,
                selectedTimeframe === timeframe && { color: DESIGN_TOKENS.colors.textInverse },
              ]}
            >
              {getTimeframeLabel(timeframe)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{data.total_improvements}</Text>
        <Text style={styles.statLabel}>Total Improvements</Text>
        <Text style={styles.statPeriod}>{getTimeframeLabel(selectedTimeframe)}</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{data.average_improvement_percentage.toFixed(1)}%</Text>
        <Text style={styles.statLabel}>Average Gain</Text>
        <Text style={styles.statPeriod}>Per improvement</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{data.current_streak}</Text>
        <Text style={styles.statLabel}>Current Streak</Text>
        <Text style={styles.statPeriod}>Days</Text>
      </View>
    </View>
  );

  const renderWeeklyGoal = () => {
    // const trend = ...; // Quick fix: commented unused variable
    // const progressPercentage = ...; // Quick fix: commented unused variable

    return (
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Weekly Goal Progress</Text>
          <Text style={styles.goalProgress}>
            {data.weekly_progress} / {data.weekly_goal}
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: segmentColor,
                },
              ]}
            />
          </View>
        </View>
        
        <Text style={[styles.goalMessage, { color: segmentColor }]}>
          {trend.message}
        </Text>
      </View>
    );
  };

  const renderDimensionBreakdown = () => (
    <View style={styles.breakdownCard}>
      <Text style={styles.sectionTitle}>Improvements by Category</Text>
      {Object.entries(data.improvements_by_dimension).map(([dimension, count]) => (
        <View key={dimension} style={styles.dimensionRow}>
          <Text style={styles.dimensionName}>
            {dimension.charAt(0).toUpperCase() + dimension.slice(1)}
          </Text>
          <View style={styles.dimensionStats}>
            <Text style={styles.dimensionCount}>{count}</Text>
            <Text style={styles.dimensionLabel}>improvements</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAccuracyMetrics = () => (
    <View style={styles.metricsCard}>
      <Text style={styles.sectionTitle}>System Performance</Text>
      
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>Detection Accuracy</Text>
        <Text style={styles.metricValue}>
          {(data.detection_accuracy * 100).toFixed(1)}%
        </Text>
      </View>
      
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>Validation Success</Text>
        <Text style={styles.metricValue}>
          {(data.validation_success_rate * 100).toFixed(1)}%
        </Text>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {onExport && (
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={onExport}
          accessible={true}
          accessibilityLabel="Export analytics data"
          accessibilityHint="Exports your improvement data for external analysis"
        >
          <Text style={styles.buttonText}>Export Data</Text>
        </TouchableOpacity>
      )}
      
      {onShare && (
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={onShare}
          accessible={true}
          accessibilityLabel="Share progress"
          accessibilityHint="Shares your improvement progress with others"
        >
          <Text style={styles.buttonText}>Share Progress</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      accessible={true}
      accessibilityLabel="Improvement analytics dashboard"
      accessibilityHint="Shows your improvement progress and statistics"
    >
      {renderHeader()}
      {renderQuickStats()}
      {renderWeeklyGoal()}
      {renderDimensionBreakdown()}
      {renderAccuracyMetrics()}
      {renderActionButtons()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    padding: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.card,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  title: {
    fontSize: DESIGN_TOKENS.fontSize.xxxl,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.text,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  subtitle: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    color: DESIGN_TOKENS.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    padding: DESIGN_TOKENS.spacing.xs,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    alignItems: 'center',
  },
  timeframeText: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.md,
    marginHorizontal: DESIGN_TOKENS.spacing.xs,
    alignItems: 'center',
    ...DESIGN_TOKENS.shadows.sm,
  },
  statNumber: {
    fontSize: DESIGN_TOKENS.fontSize.xxxl,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.text,
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  statLabel: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    color: DESIGN_TOKENS.colors.textSecondary,
    textAlign: 'center',
  },
  statPeriod: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    color: DESIGN_TOKENS.colors.textTertiary,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.lg,
    margin: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  goalTitle: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.text,
  },
  goalProgress: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  progressBarContainer: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalMessage: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  breakdownCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.lg,
    margin: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.md,
  },
  sectionTitle: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.text,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  dimensionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  dimensionName: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    color: DESIGN_TOKENS.colors.text,
    flex: 1,
  },
  dimensionStats: {
    alignItems: 'flex-end',
  },
  dimensionCount: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.text,
  },
  dimensionLabel: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    color: DESIGN_TOKENS.colors.textTertiary,
  },
  metricsCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.lg,
    margin: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN_TOKENS.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.borderLight,
  },
  metricLabel: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    color: DESIGN_TOKENS.colors.text,
  },
  metricValue: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: DESIGN_TOKENS.spacing.lg,
    gap: DESIGN_TOKENS.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    borderRadius: DESIGN_TOKENS.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  shareButton: {
    backgroundColor: DESIGN_TOKENS.colors.celebration.secondary,
  },
  buttonText: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textInverse,
  },
});

export default ImprovementAnalytics;
