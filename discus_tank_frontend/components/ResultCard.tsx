import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ResultCardProps {
  title: string;
  value: string | number;
  highlight?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, value, highlight }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#162032',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3B5C',
  },
  title: {
    color: '#A0AABF',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  highlight: {
    color: '#00E5FF',
  },
});
