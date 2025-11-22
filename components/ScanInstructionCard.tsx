// components/ScanInstructionCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../constants/Theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

type Props = {
  item: {
    id: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    text: string;
  };
};

export default function ScanInstructionCard({ item }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, marginLeft: SIZES.padding }]}>
      <View style={[styles.iconBG, { backgroundColor: colors.secondary }]}>
        <Ionicons name={item.icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.text, { color: colors.subtext }]}>{item.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 160,
    borderRadius: SIZES.radius * 1.5,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  iconBG: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...FONTS.h3,
    fontWeight: 'bold',
    marginTop: 10,
  },
  text: {
    ...FONTS.body4,
    lineHeight: 20,
  },
});