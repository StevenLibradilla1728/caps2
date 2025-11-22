// components/SettingsRow.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useTheme, FONTS, SIZES } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  isToggle?: boolean;
  value?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  disabled?: boolean;
};

export default function SettingsRow({ icon, title, isToggle = false, value, onToggle, onPress, disabled = false }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.row, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || isToggle}
    >
      <Ionicons name={icon} size={22} color={disabled ? colors.subtext : colors.primary} style={styles.icon} />
      <Text style={[styles.title, { color: disabled ? colors.subtext : colors.text }]}>{title}</Text>
      
      {isToggle ? (
        <Switch
          trackColor={{ false: colors.subtext, true: colors.primary }}
          thumbColor={colors.card}
          onValueChange={onToggle}
          value={value}
          disabled={disabled}
        />
      ) : (
        <Ionicons name="chevron-forward-outline" size={20} color={colors.subtext} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 16,
  },
  title: {
    ...FONTS.h3,
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});