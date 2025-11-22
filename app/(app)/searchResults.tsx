// app/(app)/searchResults.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { GUEST_PLANT_MAP } from '../../constants/StaticData';
import { API_BASE_URL } from '../../constants/Config';

// --- ENSURE 'export default' IS HERE ---
export default function SearchResultsScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams(); 
  const { colors } = useTheme();
  const { isGuest } = useAuth();
  
  const initialQuery = Array.isArray(query) ? query[0] : query;
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = async (text: string) => {
    if (!text || text.length < 2) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);

    if (isGuest) {
      const allPlants = Array.from(GUEST_PLANT_MAP.values());
      const filtered = allPlants.filter(plant =>
        plant.name.toLowerCase().includes(text.toLowerCase()) ||
        (plant.ailment && plant.ailment.toLowerCase().includes(text.toLowerCase()))
      );
      setResults(filtered);
      setIsLoading(false);
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/search_plants.php?query=${encodeURIComponent(text)}`);
        const data = await response.json();
        if (Array.isArray(data)) {
            setResults(data);
        } else {
            setResults([]);
        }
      } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
      } finally {
          setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (searchQuery) {
        performSearch(searchQuery);
    }
  }, []);

  const renderPlantItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.plantCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(app)/plantDetail?id=${item.plant_id}`)}
    >
      <Image 
        source={{ uri: item.image_url || 'https://placehold.co/100x100/eeeeee/888888?text=No+Image' }} 
        style={styles.plantImage} 
      />
      <View style={styles.plantInfo}>
        <Text style={[styles.plantName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.plantClass, { color: colors.subtext }]}>{item.classification}</Text>
        {item.ailment && <Text style={[styles.plantAilment, { color: colors.primary }]} numberOfLines={1}>{item.ailment}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
            <Ionicons name="search" size={20} color={colors.subtext} style={{marginRight: 8}} />
            <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search plants, ailments..."
            placeholderTextColor={colors.subtext}
            onSubmitEditing={() => performSearch(searchQuery)}
            returnKeyType="search"
            autoFocus={false} 
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setResults([]); }}>
                    <Ionicons name="close-circle" size={18} color={colors.subtext} />
                </TouchableOpacity>
            )}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderPlantItem}
          keyExtractor={(item) => item.plant_id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={60} color={colors.subtext} style={{opacity: 0.5, marginBottom: 10}} />
              <Text style={[styles.emptyText, { color: colors.subtext }]}>
                {searchQuery.length < 2 ? "Type at least 2 characters to search." : `No results found for "${searchQuery}".`}
              </Text>
            </View>
          )}
          contentContainerStyle={{ padding: SIZES.padding }}
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
    padding: SIZES.padding / 2,
    paddingTop: Platform.OS === 'android' ? 40 : 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  backButton: { padding: 8, marginRight: 5 },
  searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      height: 45,
      borderRadius: SIZES.radius,
      marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...FONTS.body3,
  },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { ...FONTS.h3, textAlign: 'center', opacity: 0.7 },
  plantCard: {
    borderRadius: SIZES.radius,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
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
  plantName: { ...FONTS.h3, marginBottom: 2 },
  plantClass: { ...FONTS.body4, fontStyle: 'italic', opacity: 0.8 },
  plantAilment: { ...FONTS.body4, fontSize: 11, marginTop: 4, fontWeight: '600' },
});