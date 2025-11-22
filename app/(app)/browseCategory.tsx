// app/(app)/browseCategory.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, 
  ActivityIndicator, TextInput, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { GUEST_CATEGORIES, GUEST_PLANT_MAP } from '../../constants/StaticData';
import { API_BASE_URL } from '../../constants/Config';

// Define categories for the horizontal scroller
// (Using static for speed, but can also be fetched from get_categories.php)
const CATEGORIES = [
  { name: "All", icon: "apps-outline" },
  { name: "Leafy", icon: "leaf-outline" },
  { name: "Herb", icon: "nutrition-outline" },
  { name: "Shrub", icon: "flower-outline" },
  { name: "Tree", icon: "leaf" },
  { name: "Vine", icon: "git-merge-outline" },
];

export default function BrowseCategoryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isGuest } = useAuth();
  
  const [plants, setPlants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // --- DATA FETCHING ---
  const fetchPlants = useCallback(async (category = "All", search = "") => {
    setIsLoading(true);
    
    if (isGuest) {
      // --- GUEST MODE ---
      let allPlants = Array.from(GUEST_PLANT_MAP.values());
      if (category !== "All") {
        allPlants = allPlants.filter(p => p.category === category);
      }
      if (search.length > 1) {
        allPlants = allPlants.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }
      setPlants(allPlants);
      setIsLoading(false);
    } else {
      // --- LOGGED-IN MODE ---
      try {
        const url = `${API_BASE_URL}/get_plants_advanced.php?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (Array.isArray(data)) setPlants(data);
      } catch (error) {
        console.error("Failed to fetch plants:", error);
        setPlants([]); // Clear on error
      } finally {
        setIsLoading(false);
      }
    }
  }, [isGuest]);

  // Initial fetch
  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // Handle category selection
  const selectCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    fetchPlants(categoryName, searchQuery);
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    fetchPlants(activeCategory, searchQuery);
  };

  // --- RENDER FUNCTIONS ---
  const renderCategoryTab = ({ item }: { item: typeof CATEGORIES[0] }) => {
    const isActive = activeCategory === item.name;
    return (
      <TouchableOpacity 
        style={[
          styles.tab, 
          isActive && { backgroundColor: colors.primary }
        ]}
        onPress={() => selectCategory(item.name)}
      >
        <Ionicons name={item.icon as any} size={18} color={isActive ? colors.card : colors.text} />
        <Text style={[styles.tabText, { color: isActive ? colors.card : colors.text }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPlantCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.plantCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(app)/plantDetail?id=${item.plant_id}`)}
    >
      <Image 
        source={{ uri: item.image_url || 'https://placehold.co/150' }} 
        style={styles.plantImage} 
        resizeMode="cover"
      />
      <View style={styles.plantInfo}>
        <Text style={[styles.plantName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.plantAilment, { color: colors.subtext }]} numberOfLines={1}>{item.ailment}</Text>
      </View>
      <View style={[styles.addButton, { backgroundColor: colors.secondary }]}>
        <Ionicons name="add" size={20} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Discover Plants</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.subtext} style={{marginLeft: 16}} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search plants, ailments..."
          placeholderTextColor={colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="options-outline" size={20} color={colors.card} />
        </TouchableOpacity>
      </View>

      {/* Category Scroller */}
      <View style={{ height: 60, marginTop: 10 }}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
        />
      </View>
      
      {/* Plant Grid */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={plants}
          renderItem={renderPlantCard}
          keyExtractor={(item) => item.plant_id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.subtext }]}>No plants found.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding / 2,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: { padding: 10 },
  headerTitle: { ...FONTS.h2, fontWeight: 'bold', marginLeft: 10 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    ...FONTS.body3,
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  filterButton: {
    padding: 10,
    margin: 6,
    borderRadius: SIZES.radius - 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  tabText: { ...FONTS.body4, fontWeight: 'bold', marginLeft: 8 },
  grid: {
    padding: SIZES.padding - 5,
  },
  plantCard: {
    flex: 1,
    margin: 5,
    borderRadius: SIZES.radius * 1.5,
    padding: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  plantImage: {
    width: '100%',
    height: 120,
    borderRadius: SIZES.radius,
  },
  plantInfo: {
    width: '100%',
    marginTop: 10,
  },
  plantName: {
    ...FONTS.h4,
    fontWeight: 'bold',
  },
  plantAilment: {
    ...FONTS.body4,
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...FONTS.h3,
  },
});