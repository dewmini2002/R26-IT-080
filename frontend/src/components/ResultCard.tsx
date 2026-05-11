import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from './AppCard';
import { COLORS } from '../constants/theme';

interface ResultCardProps {
  title: string;
  value?: string | number;
  highlight?: boolean;
  children?: React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, value, highlight, children }) => {
  return (
    <AppCard style={highlight ? styles.highlightedCard : undefined} glow={highlight}>
      <Text style={styles.title}>{title}</Text>
      {value !== undefined && (
        <Text style={[styles.value, highlight && styles.highlightedValue]}>
          {value}
        </Text>
      )}
      {children && <View style={styles.content}>{children}</View>}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  title: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  value: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  highlightedCard: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  highlightedValue: {
    color: COLORS.primary,
  },
  content: {
    marginTop: 10,
  },
});
