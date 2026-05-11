import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { AppCard } from '../components/AppCard';
import { ResultCard } from '../components/ResultCard';
import { SectionHeader } from '../components/SectionHeader';
import { COLORS } from '../constants/theme';
import { CheckCircle2, AlertTriangle, Target, ListChecks, Percent } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type ResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface Props {
  navigation: ResultScreenNavigationProp;
  route: ResultScreenRouteProp;
}

export const ResultScreen: React.FC<Props> = ({ route }) => {
  const { result } = route.params;

  const getStatusColor = () => (result.is_healthy ? COLORS.success : COLORS.danger);
  const getStatusIcon = () => {
    if (result.is_healthy) {
      return <CheckCircle2 size={60} color={COLORS.success} />;
    }
    return <AlertTriangle size={60} color={COLORS.danger} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Main Status Overview */}
        <AppCard glow={true} style={[styles.mainStatusCard, { borderColor: getStatusColor() }]}>
          <View style={styles.statusIconContainer}>
            {getStatusIcon()}
          </View>
          <Text style={[styles.mainStatusTitle, { color: getStatusColor() }]}>
            {result.is_healthy ? 'Healthy Fish' : result.prediction}
          </Text>
          <Text style={styles.confidenceText}>
            Confidence: {(result.confidence * 100).toFixed(1)}%
          </Text>
        </AppCard>

        {/* Level 1 Explainability */}
        <SectionHeader title="Visual Detection (Level 1)" />
        {result.detections.length > 0 ? (
          result.detections.map((detection, index) => (
            <ResultCard 
              key={index} 
              title="Detected Class" 
              value={detection.display_name}
            >
              <View style={styles.detectionDetails}>
                <View style={styles.detailRow}>
                  <Target size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>
                    Confidence: {(detection.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
                <Text style={styles.bboxText}>
                  Bounding Box: [{detection.bbox.x1}, {detection.bbox.y1}, {detection.bbox.x2}, {detection.bbox.y2}]
                </Text>
              </View>
            </ResultCard>
          ))
        ) : (
          <AppCard>
            <Text style={styles.noDataText}>No disease bounding boxes detected.</Text>
          </AppCard>
        )}

        {/* Level 2 Explainability */}
        {!result.is_healthy && result.symptom_validation && (
          <>
            <SectionHeader title="Symptom Analysis (Level 2)" />
            
            <View style={styles.statsRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <ResultCard title="Match Rate" highlight>
                  <View style={styles.matchRateContainer}>
                    <Percent size={24} color={COLORS.primary} />
                    <Text style={styles.matchRateText}>
                      {result.symptom_validation.match_percentage.toFixed(0)}%
                    </Text>
                  </View>
                </ResultCard>
              </View>
            </View>

            <AppCard>
              <View style={styles.symptomListHeader}>
                <ListChecks size={20} color={COLORS.primary} />
                <Text style={styles.symptomListTitle}>Matched Symptoms</Text>
              </View>
              {result.symptom_validation.matched_symptoms_display.length > 0 ? (
                result.symptom_validation.matched_symptoms_display.map((symptom, i) => (
                  <Text key={`match-${i}`} style={styles.listItem}>• {symptom}</Text>
                ))
              ) : (
                <Text style={styles.noDataText}>No expected symptoms were matched.</Text>
              )}

              <View style={[styles.symptomListHeader, { marginTop: 20 }]}>
                <AlertTriangle size={20} color={COLORS.textSecondary} />
                <Text style={[styles.symptomListTitle, { color: COLORS.textSecondary }]}>
                  Unmatched Expected Symptoms
                </Text>
              </View>
              {result.symptom_validation.unmatched_symptoms_display.length > 0 ? (
                result.symptom_validation.unmatched_symptoms_display.map((symptom, i) => (
                  <Text key={`unmatch-${i}`} style={[styles.listItem, { color: COLORS.textSecondary }]}>
                    • {symptom}
                  </Text>
                ))
              ) : (
                <Text style={styles.noDataText}>All expected symptoms were present.</Text>
              )}
            </AppCard>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  mainStatusCard: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'rgba(22, 34, 65, 0.9)',
    borderWidth: 2,
  },
  statusIconContainer: {
    marginBottom: 15,
  },
  mainStatusTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  confidenceText: {
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    overflow: 'hidden',
  },
  detectionDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    color: COLORS.text,
    marginLeft: 8,
    fontSize: 14,
  },
  bboxText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  matchRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  matchRateText: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  symptomListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  symptomListTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  listItem: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 6,
    paddingLeft: 10,
  },
  noDataText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    paddingLeft: 10,
  },
});
