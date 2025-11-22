// components/ExploreCard.tsx
import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme, FONTS, SIZES } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: string[];
  locked?: boolean; // New prop to handle guest mode styling internally
};

export default function ExploreCard({ icon, title, subtitle, onPress, colors, locked = false }: Props) {
  const { colors: themeColors } = useTheme();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      style={[styles.container, locked && styles.locked]} // Apply locked opacity here
    >
      <LinearGradient
        colors={colors}
        style={styles.gradient}
      >
        <Ionicons name={icon} size={25} color={themeColors.card} /> 
        <Text style={[styles.title, { color: themeColors.card }]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.subtitle, { color: themeColors.card }]} numberOfLines={1}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '33%', 
    padding: 5, // Slightly more padding for better spacing
  },
  locked: {
    opacity: 0.6, // Dim the card if locked
  },
  gradient: {
    padding: 16,
    borderRadius: SIZES.radius,
    height: 100, // FIXED HEIGHT ensures they are all the same size
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    ...FONTS.h3,
    fontSize: 13,
    fontWeight: 'semibold',
    marginTop: 'auto', // Pushes title down if icon is at top
    marginBottom: 4,
  },
  subtitle: {
    ...FONTS.body4,
    fontSize: 12,
    opacity: 0.9,
  },
});