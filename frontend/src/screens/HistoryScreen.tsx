import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { AppCard } from '../components/AppCard';
import { SectionHeader } from '../components/SectionHeader';
import { COLORS } from '../constants/theme';
import { getHistory, HistoryItem, clearHistory } from '../services/storage';
import { Clock, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react-native';

export const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all past diagnoses?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.headerRow}>
          <SectionHeader title="Past Diagnoses" />
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
              <Trash2 size={20} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>

        {history.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyText}>No previous diagnoses found.</Text>
          </AppCard>
        ) : (
          history.map((item) => (
            <AppCard key={item.id} style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <View style={styles.statusRow}>
                  {item.isHealthy ? (
                    <CheckCircle2 size={18} color={COLORS.success} />
                  ) : (
                    <AlertTriangle size={18} color={COLORS.danger} />
                  )}
                  <Text style={[
                    styles.predictionText,
                    { color: item.isHealthy ? COLORS.success : COLORS.danger }
                  ]}>
                    {item.isHealthy ? 'Healthy Fish' : item.prediction}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <Clock size={12} color={COLORS.textSecondary} />
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailLabel}>Confidence:</Text>
                <Text style={styles.detailValue}>{(item.confidence * 100).toFixed(1)}%</Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailLabel}>Symptoms Selected:</Text>
                <Text style={styles.detailValue}>{item.symptoms.length}</Text>
              </View>
            </AppCard>
          ))
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtn: {
    padding: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyCard: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flexShrink: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
