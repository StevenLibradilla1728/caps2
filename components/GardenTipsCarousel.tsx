// components/GardenTipsCarousel.tsx
import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../constants/Theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - (SIZES.padding * 2);

const TIPS = [
  { id: '1', icon: 'book-outline', title: 'Add Notes', text: 'Tap any plant in your garden to add personal notes on its growth or uses.' },
  { id: '2', icon: 'heart-outline', title: 'Use Favorites', text: 'Tap the heart icon to add a plant to your "Favorites" list for quick access.' },
  { id: '3', icon: 'share-outline', title: 'Share Your Garden', text: 'You can export your garden list as a PDF from your profile. (Coming Soon!)' },
];

export default function GardenTipsCarousel() {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  
  const renderItem = ({ item }: { item: typeof TIPS[0] }) => (
    <View style={[styles.card, { backgroundColor: colors.secondary, width: CARD_WIDTH }]}>
      <Ionicons name={item.icon as any} size={24} color={colors.primary} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.primary }]}>{item.title}</Text>
        <Text style={[styles.text, { color: colors.text }]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={TIPS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={CARD_WIDTH + SIZES.padding}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    marginTop: 10,
    marginBottom: 20,
  },
  card: {
    height: 120,
    borderRadius: SIZES.radius * 1.5,
    padding: 20,
    marginRight: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.h3,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  text: {
    ...FONTS.body4,
    lineHeight: 20,
    opacity: 0.9,
  },
});