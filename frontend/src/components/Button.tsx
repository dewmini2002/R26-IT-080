import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  loading, 
  disabled, 
  variant = 'primary',
  icon
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        isPrimary && !disabled ? SHADOWS.glow : null,
      ]}
      onPress={onPress}
      disabled={Boolean(disabled || loading)}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#000' : COLORS.primary} />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text style={[
            styles.text, 
            isPrimary ? styles.textPrimary : styles.textSecondary,
            icon ? { marginLeft: 8 } : null
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 10,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textPrimary: {
    color: '#000',
  },
  textSecondary: {
    color: COLORS.primary,
  },
});
