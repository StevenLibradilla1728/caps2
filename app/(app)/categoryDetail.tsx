// app/(app)/categoryDetail.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { GUEST_PLANT_MAP, SavedPlant } from '../../constants/StaticData';
import { API_BASE_URL } from '../../constants/Config';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const categoryName = Array.isArray(name) ? name[0] : name; // Ensure string
  
  const { colors } = useTheme();
  const { isGuest } = useAuth();
  const [plants, setPlants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlantsByCategory();
  }, [categoryName]);

  const fetchPlantsByCategory = async () => {
      if (!categoryName) return;
      setIsLoading(true);

      if (isGuest) {
          // --- GUEST MODE: Filter from full 35-plant static map ---
          const allPlants = Array.from(GUEST_PLANT_MAP.values());
          const filtered = allPlants.filter(p => p.category === categoryName);
          setPlants(filtered);
          setIsLoading(false);
      } else {
          // --- LOGGED-IN MODE: Fetch from new API ---
          try {
              const response = await fetch(`${API_BASE_URL}/get_plants_by_category.php?category=${encodeURIComponent(categoryName)}`);
              const data = await response.json();
              if (Array.isArray(data)) {
                  setPlants(data);
              } else {
                  setPlants([]);
              }
          } catch (error) {
              console.error("Failed to fetch category plants:", error);
              setPlants([]);
          } finally {
              setIsLoading(false);
          }
      }
  };

  const renderPlantItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.plantCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(app)/plantDetail?id=${item.plant_id}`)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/100' }} 
        style={styles.plantImage} 
      />
      <View style={styles.plantInfo}>
        <Text style={[styles.plantName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.plantClass, { color: colors.subtext }]}>{item.classification}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerTitle: categoryName || 'Category',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
        }}
      />
      {isLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
             <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={plants}
          renderItem={renderPlantItem}
          keyExtractor={(item) => item.plant_id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={60} color={colors.subtext} style={{opacity: 0.5, marginBottom: 10}} />
              <Text style={[styles.emptyText, { color: colors.subtext }]}>No plants found in this category.</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: SIZES.padding },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { ...FONTS.h3, textAlign: 'center', opacity: 0.7 },
  plantCard: {
    borderRadius: SIZES.radius,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  plantImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius / 2,
    backgroundColor: '#f0f0f0',
  },
  plantInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  plantName: {
    ...FONTS.h3,
    marginBottom: 4,
  },
  plantClass: {
    ...FONTS.body4,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});