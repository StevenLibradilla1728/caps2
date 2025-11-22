// components/DashboardCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, FONTS, SIZES } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  value: string;
  onPress?: () => void;
};

export default function DashboardCard({ icon, title, value, onPress }: Props) {
  const { colors } = useTheme(); 

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      disabled={!onPress}
    >
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.iconBackground, { backgroundColor: colors.secondary }]}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
        <Text style={[styles.title, { color: colors.subtext }]} numberOfLines={1}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '50%',
    padding: 5,
  },
  card: {
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    width: '100%',
    height: 150, // FIXED HEIGHT for uniformity
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconBackground: {
    padding: 12,
    borderRadius: 50,
    marginBottom: 12,
  },
  title: {
    ...FONTS.body4,
    fontSize: 12,
  },
  value: {
    ...FONTS.h2,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});