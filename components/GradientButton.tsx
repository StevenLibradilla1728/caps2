// components/GradientButton.tsx
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, SIZES, FONTS } from '../constants/Theme'; // 1. Import useTheme

type Props = {
  title: string;
  onPress: () => void;
};

export default function GradientButton({ title, onPress }: Props) {
  const { colors } = useTheme(); // 2. Get colors from hook

  return (
    <TouchableOpacity onPress={onPress} style={styles.shadow}>
      <LinearGradient
        // Use dynamic colors
        colors={[colors.primary, colors.primary]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.button}
      >
        
        <Text style={[styles.buttonText, { color: colors.card }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: SIZES.radius * 1.5,
    alignItems: 'center',
  },
  buttonText: {
    ...FONTS.h3,
    fontWeight: 'bold',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
});