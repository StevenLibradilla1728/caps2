// components/InfiniteCarousel.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { SIZES } from '../constants/Theme';

const { width } = Dimensions.get('window');
// Card width is 70% of screen, but we can make it a prop
const DEFAULT_CARD_WIDTH = width * 0.8;
const DEFAULT_CARD_SPACING = SIZES.padding;
const DEFAULT_SNAP_INTERVAL = DEFAULT_CARD_WIDTH + DEFAULT_CARD_SPACING;

type InfiniteCarouselProps = {
  data: any[];
  renderItem: (item: any) => React.ReactNode;
  cardWidth?: number;
  spacing?: number;
  autoScroll?: boolean;
};

export default function InfiniteCarousel({
  data,
  renderItem,
  cardWidth = DEFAULT_CARD_WIDTH,
  spacing = DEFAULT_CARD_SPACING,
  autoScroll = false
}: InfiniteCarouselProps) {
  
  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);
  const isAutoScrolling = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- State for dynamic data ---
  const [loopedData, setLoopedData] = useState<any[]>([]);
  const [baseLength, setBaseLength] = useState(0);

  // This effect runs when your API data (prop) changes
  useEffect(() => {
    if (data && data.length > 0) {
      setLoopedData([...data, ...data, ...data]); // Triple the data
      setBaseLength(data.length);
      activeIndexRef.current = data.length; // Start in the middle block

      // Go to the middle block
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: data.length,
          animated: false,
        });
      }, 50); // Small delay to ensure render

      if (autoScroll) startAutoScroll(data.length);
    }
  }, [data, autoScroll]); // Re-run if data or autoScroll prop changes

  const startAutoScroll = (length: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (!isAutoScrolling.current) return;

      let newIndex = activeIndexRef.current + 1;
      
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });

      // --- The "Infinite" magic ---
      if (newIndex >= length * 2) {
        // We've reached the end of the 2nd block
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: length, // Jump back to start of 2nd block
            animated: false,
          });
          activeIndexRef.current = length;
        }, 1000); 
      } else {
         activeIndexRef.current = newIndex;
      }

    }, 10000);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const onTouchStart = () => { isAutoScrolling.current = false; };
  const onTouchEnd = () => { isAutoScrolling.current = true; };

  const renderWrapper = ({ item, index }: { item: any, index: number }) => (
    <View style={{ 
        width: cardWidth,
        marginLeft: index === 0 ? spacing : 0,
        marginRight: spacing,
    }}>
      {renderItem({ item, index })}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={loopedData}
        renderItem={renderWrapper}
        keyExtractor={(_, index) => `infinite_${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + spacing}
        decelerationRate="fast"
        // --- START IN THE MIDDLE ---
        initialScrollIndex={baseLength}
        getItemLayout={(_, index) => ({
            length: cardWidth + spacing,
            offset: (cardWidth + spacing) * index - spacing,
            index,
        })}
        // --- PAUSE ON DRAG ---
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    marginVertical: SIZES.padding / 15,
  },
});