import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { Check } from 'lucide-react-native';

interface SymptomCheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export const SymptomCheckbox: React.FC<SymptomCheckboxProps> = ({ label, checked, onToggle }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, checked && styles.containerChecked]} 
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Check size={16} color="#000" strokeWidth={3} />}
      </View>
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSecondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerChecked: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  labelChecked: {
    color: COLORS.primary,
  },
});
