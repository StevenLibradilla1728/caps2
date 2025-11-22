// components/AchievementBadge.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, FONTS, SIZES } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  item: {
    name: string;
    desc: string;
    unlocked: boolean;
  };
  onPress?: () => void;
};

export default function AchievementBadge({ item, onPress }: Props) {
  const { colors } = useTheme();
  
  const isUnlocked = item.unlocked;
  const cardColor = isUnlocked ? colors.card : colors.background;
  const iconColor = isUnlocked ? colors.primary : colors.subtext;
  const textColor = isUnlocked ? colors.text : colors.subtext;
  const opacity = isUnlocked ? 1 : 0.7;

  return (
    // 1. The Touchable is the 50% "slot" with padding
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={!onPress || !isUnlocked} // Disable press if no handler or not unlocked
    >
      {/* 2. The <View> is the visible card */}
      <View style={[
        styles.card, 
        { backgroundColor: cardColor, opacity: opacity },
        !isUnlocked && { borderColor: colors.subtext, borderWidth: 1 }
      ]}>
        <Ionicons 
          name={isUnlocked ? "shield-checkmark" : "shield-outline"} 
          size={30} 
          color={iconColor} 
        />
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.desc, { color: colors.subtext }]} numberOfLines={2}>{item.desc}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '50%', // <-- creates the 2-column grid
    padding: 4,     // <-- creates the gap between cards
  },
  card: {
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140, 
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: '100%', // Take up the full 50% slot
  },
  name: {
    ...FONTS.h3,
    marginTop: 8,
    textAlign: 'center',
  },
  desc: {
    ...FONTS.body4,
    textAlign: 'center',
    marginTop: 2,
  },
});