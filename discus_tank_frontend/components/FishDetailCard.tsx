import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FishDetailProps {
  id: number;
  length: number;
  height: number;
  thickness: number;
  volume: number;
}

export const FishDetailCard: React.FC<FishDetailProps> = ({ id, length, height, thickness, volume }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Fish ID: {id}</Text>
      <View style={styles.detailsRow}>
        <DetailItem label="Length" value={`${length.toFixed(2)} cm`} />
        <DetailItem label="Height" value={`${height.toFixed(2)} cm`} />
      </View>
      <View style={styles.detailsRow}>
        <DetailItem label="Thickness" value={`${thickness.toFixed(2)} cm`} />
        <DetailItem label="Volume" value={`${volume.toFixed(2)} cm³`} />
      </View>
    </View>
  );
};

const DetailItem = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.itemLabel}>{label}</Text>
    <Text style={styles.itemValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A233A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00E5FF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemContainer: {
    flex: 1,
  },
  itemLabel: {
    color: '#A0AABF',
    fontSize: 12,
  },
  itemValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});
