import React, { useState } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // ScrollView,
  // TouchableOpacity,
  // Modal,
  // Dimensions,
  // 
} from 'react-native';
import {
  // DESIGN_TOKENS,
  // getValidationColor
} from '../../../../constants/designTokens';

const { width, height } = Dimensions.get('window');

// Types for validation data
interface ValidationData {
  confidence_score: number;
  statistical_significance: number;
  validation_method: string;
  validation_status: 'pending' | 'validated' | 'rejected' | 'needs_review';
  evidence_points: EvidencePoint[];
  correlation_factors: CorrelationFactor[];
  peer_validation: boolean;
  research_citations: ResearchCitation[];
}

interface EvidencePoint {
  id: string;
  type: 'baseline_comparison' | 'trend_analysis' | 'statistical_test' | 'peer_review';
  title: string;
  description: string;
  value: number;
  unit: string;
  significance: 'high' | 'medium' | 'low';
}

interface CorrelationFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-1
  description: string;
}

interface ResearchCitation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  relevance_score: number;
  url?: string;
}

interface ScientificValidationDisplayProps {
  visible: boolean;
  validation: ValidationData;
  improvement: {
    dimension: string;
    improvement_percentage: number;
    baseline_value: number;
    current_value: number;
  };
  onClose: () => void;
  onLearnMore?: () => void;
}

const ScientificValidationDisplay: React.FC<ScientificValidationDisplayProps> = ({
  visible,
  validation,
  improvement,
  onClose,
  onLearnMore,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.9) return { level: 'Very High', color: DESIGN_TOKENS.colors.validation.high };
    if (score >= 0.8) return { level: 'High', color: DESIGN_TOKENS.colors.validation.high };
    if (score >= 0.7) return { level: 'Good', color: DESIGN_TOKENS.colors.validation.medium };
    if (score >= 0.6) return { level: 'Moderate', color: DESIGN_TOKENS.colors.validation.medium };
    return { level: 'Low', color: DESIGN_TOKENS.colors.validation.low };
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return DESIGN_TOKENS.colors.validation.high;
      case 'pending':
        return DESIGN_TOKENS.colors.validation.pending;
      case 'needs_review':
        return DESIGN_TOKENS.colors.validation.medium;
      case 'rejected':
        return DESIGN_TOKENS.colors.validation.low;
      default:
        return DESIGN_TOKENS.colors.validation.pending;
    }
  };

  const getSignificanceIcon = (significance: string) => {
    switch (significance) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return '📈';
      case 'negative':
        return '📉';
      case 'neutral':
        return '➡️';
      default:
        return '❓';
    }
  };

  const renderValidationSummary = () => {
    // const confidence = ...; // Quick fix: commented unused variable
    // const statusColor = ...; // Quick fix: commented unused variable

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>📊 Scientific Validation Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Confidence Level</Text>
            <Text style={[styles.summaryValue, { color: confidence.color }]}>
              {confidence.level}
            </Text>
            <Text style={styles.summaryDetail}>
              {(validation.confidence_score * 100).toFixed(0)}% confidence
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Statistical Significance</Text>
            <Text style={styles.summaryValue}>
              p &lt; {(validation.statistical_significance).toFixed(3)}
            </Text>
            <Text style={styles.summaryDetail}>
              {validation.statistical_significance < 0.05 ? 'Significant' : 'Not significant'}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Validation Status</Text>
            <Text style={[styles.summaryValue, { color: statusColor }]}>
              {validation.validation_status.charAt(0).toUpperCase() + validation.validation_status.slice(1)}
            </Text>
            <Text style={styles.summaryDetail}>
              {validation.validation_method}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Peer Validation</Text>
            <Text style={styles.summaryValue}>
              {validation.peer_validation ? '✅ Validated' : '⏳ Pending'}
            </Text>
            <Text style={styles.summaryDetail}>
              {validation.peer_validation ? 'Peer reviewed' : 'Awaiting review'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEvidencePoints = () => (
    <View style={styles.evidenceCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpandedSection(expandedSection === 'evidence' ? null : 'evidence')}
        accessible={true}
        accessibilityLabel="Evidence points section"
        accessibilityHint="Tap to expand or collapse evidence details"
      >
        <Text style={styles.sectionTitle}>🔍 Evidence Analysis</Text>
        <Text style={styles.expandIcon}>
          {expandedSection === 'evidence' ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expandedSection === 'evidence' && (
        <View style={styles.evidenceContent}>
          {validation.evidence_points.map((point) => (
            <View key={point.id} style={styles.evidenceItem}>
              <View style={styles.evidenceHeader}>
                <Text style={styles.evidenceIcon}>
                  {getSignificanceIcon(point.significance)}
                </Text>
                <Text style={styles.evidenceTitle}>{point.title}</Text>
                <Text style={styles.evidenceValue}>
                  {point.value} {point.unit}
                </Text>
              </View>
              <Text style={styles.evidenceDescription}>{point.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderCorrelationFactors = () => (
    <View style={styles.correlationCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpandedSection(expandedSection === 'correlation' ? null : 'correlation')}
        accessible={true}
        accessibilityLabel="Correlation factors section"
        accessibilityHint="Tap to expand or collapse correlation details"
      >
        <Text style={styles.sectionTitle}>🔗 Correlation Factors</Text>
        <Text style={styles.expandIcon}>
          {expandedSection === 'correlation' ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expandedSection === 'correlation' && (
        <View style={styles.correlationContent}>
          {validation.correlation_factors.map((factor, index) => (
            <View key={index} style={styles.correlationItem}>
              <View style={styles.correlationHeader}>
                <Text style={styles.correlationIcon}>
                  {getImpactIcon(factor.impact)}
                </Text>
                <Text style={styles.correlationFactor}>{factor.factor}</Text>
                <Text style={styles.correlationStrength}>
                  {(factor.strength * 100).toFixed(0)}%
                </Text>
              </View>
              <Text style={styles.correlationDescription}>{factor.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderResearchCitations = () => (
    <View style={styles.researchCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpandedSection(expandedSection === 'research' ? null : 'research')}
        accessible={true}
        accessibilityLabel="Research citations section"
        accessibilityHint="Tap to expand or collapse research details"
      >
        <Text style={styles.sectionTitle}>📚 Research Citations</Text>
        <Text style={styles.expandIcon}>
          {expandedSection === 'research' ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expandedSection === 'research' && (
        <View style={styles.researchContent}>
          {validation.research_citations.map((citation) => (
            <View key={citation.id} style={styles.citationItem}>
              <Text style={styles.citationTitle}>{citation.title}</Text>
              <Text style={styles.citationAuthors}>{citation.authors}</Text>
              <Text style={styles.citationJournal}>
                {citation.journal} ({citation.year})
              </Text>
              <Text style={styles.citationRelevance}>
                Relevance: {(citation.relevance_score * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scientific Validation</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessible={true}
            accessibilityLabel="Close validation display"
            accessibilityHint="Closes the scientific validation view"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderValidationSummary()}
          {renderEvidencePoints()}
          {renderCorrelationFactors()}
          {renderResearchCitations()}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            {onLearnMore && (
              <TouchableOpacity
                style={styles.learnMoreButton}
                onPress={onLearnMore}
                accessible={true}
                accessibilityLabel="Learn more about validation"
                accessibilityHint="Opens detailed information about scientific validation"
              >
                <Text style={styles.buttonText}>Learn More</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.lg,
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  headerTitle: {
    fontSize: DESIGN_TOKENS.fontSize.xl,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: DESIGN_TOKENS.spacing.md,
  },
  summaryCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    padding: DESIGN_TOKENS.spacing.lg,
    marginBottom: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.md,
  },
  sectionTitle: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.text,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.sm,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    color: DESIGN_TOKENS.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  summaryValue: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.text,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  summaryDetail: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    color: DESIGN_TOKENS.colors.textTertiary,
    textAlign: 'center',
  },
  evidenceCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    marginBottom: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.lg,
  },
  expandIcon: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  evidenceContent: {
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    paddingBottom: DESIGN_TOKENS.spacing.lg,
  },
  evidenceItem: {
    marginBottom: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  evidenceIcon: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  evidenceTitle: {
    flex: 1,
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.text,
  },
  evidenceValue: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  evidenceDescription: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    color: DESIGN_TOKENS.colors.textSecondary,
    lineHeight: DESIGN_TOKENS.fontSize.sm * 1.4,
  },
  correlationCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    marginBottom: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.md,
  },
  correlationContent: {
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    paddingBottom: DESIGN_TOKENS.spacing.lg,
  },
  correlationItem: {
    marginBottom: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
  },
  correlationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  correlationIcon: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  correlationFactor: {
    flex: 1,
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.text,
  },
  correlationStrength: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  correlationDescription: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    color: DESIGN_TOKENS.colors.textSecondary,
    lineHeight: DESIGN_TOKENS.fontSize.sm * 1.4,
  },
  researchCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    marginBottom: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.md,
  },
  researchContent: {
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    paddingBottom: DESIGN_TOKENS.spacing.lg,
  },
  citationItem: {
    marginBottom: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
  },
  citationTitle: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.text,
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  citationAuthors: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  citationJournal: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    color: DESIGN_TOKENS.colors.textTertiary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  citationRelevance: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    color: DESIGN_TOKENS.colors.textTertiary,
  },
  actionButtons: {
    padding: DESIGN_TOKENS.spacing.lg,
  },
  learnMoreButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    borderRadius: DESIGN_TOKENS.borderRadius.xl,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textInverse,
  },
});

export default ScientificValidationDisplay;
