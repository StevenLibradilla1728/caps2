// components/TipsCarousel.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../constants/Theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7; 
const CARD_SPACING = SIZES.padding;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

// Accept data
export default function TipsCarousel({ data }: { data: any[] }) {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);

  // Create infinite loop data if data exists
  const loopedData = data.length > 0 ? [...data, ...data, ...data] : [];
  const startOffset = data.length * SNAP_INTERVAL;

  useEffect(() => {
    if (data.length === 0) return;
    // Start in the middle
    setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: startOffset - SIZES.padding, animated: false });
    }, 100);

    // Auto-scroll
    const timer = setInterval(() => {
        const nextOffset = ((activeIndexRef.current + 1) * SNAP_INTERVAL) - SIZES.padding;
        flatListRef.current?.scrollToOffset({ offset: nextOffset, animated: true });
        
        activeIndexRef.current += 1;
        
        // Reset if too far
        if (activeIndexRef.current >= data.length * 2) {
             setTimeout(() => {
                 flatListRef.current?.scrollToOffset({ offset: startOffset - SIZES.padding, animated: false });
                 activeIndexRef.current = data.length;
             }, 1000);
        }
    }, 5000);

    return () => clearInterval(timer);
  }, [data]);

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={[styles.card, { backgroundColor: colors.card, marginLeft: index === 0 ? SIZES.padding : 0, marginRight: CARD_SPACING }]}>
      <View style={[styles.iconBG, { backgroundColor: colors.secondary }]}>
        <Ionicons name={item.icon || 'leaf-outline'} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[styles.text, { color: colors.subtext }]} numberOfLines={4}>{item.content}</Text>
    </View>
  );

  if (data.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={loopedData}
        renderItem={renderItem}
        keyExtractor={(_, index) => `tip_${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: SNAP_INTERVAL, offset: SNAP_INTERVAL * index - SIZES.padding, index })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 180, marginVertical: SIZES.padding / 6 },
  card: {
    width: CARD_WIDTH, height: 150, borderRadius: SIZES.radius * 1.5,
    padding: 20, justifyContent: 'space-between', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5,
  },
  iconBG: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  title: { ...FONTS.h3, fontWeight: 'bold', marginTop: 10 },
  text: { ...FONTS.body4, lineHeight: 20 },
});