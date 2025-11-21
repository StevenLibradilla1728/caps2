// components/HorizontalPlantCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme, FONTS, SIZES } from '../constants/Theme';
import { API_BASE_URL } from '../constants/Config'; 

// Add the helper function to build the full URL
const getFullUrl = (path: string | null) => {
    if (!path) return 'https://placehold.co/100x100/eeeeee/aaaaaa?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}/${path.replace(/^\//, '')}`;
};

export default function HorizontalPlantCard({ item, onPress }: { item: any, onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.card }]}>
      {/* 3. Apply the helper function to the image URI */}
      <Image source={{ uri: getFullUrl(item.image_url) }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.ailment, { color: colors.subtext }]} numberOfLines={1}>{item.ailment}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '105%', 
    height: 90,
    borderRadius: SIZES.radius * 1.5,
    padding: 4,
    paddingLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radius,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    ...FONTS.h4,
    fontWeight: 'bold',
  },
  ailment: {
    ...FONTS.body4,
    marginTop: 2,
  },
});
