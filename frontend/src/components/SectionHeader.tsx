import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  title: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
