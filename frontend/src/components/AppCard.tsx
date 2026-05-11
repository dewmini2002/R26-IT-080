import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  glow?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({ children, style, glow = false }) => {
  return (
    <View 
      style={[
        styles.card, 
        glow ? SHADOWS.glow : SHADOWS.card,
        style
      ]} 
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
