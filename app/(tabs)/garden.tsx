// app/(tabs)/garden.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { SavedPlant } from '../../constants/StaticData';
import { API_BASE_URL } from '../../constants/Config';
import GardenTipsCarousel from '../../components/GardenTipsCarousel';

interface GardenSummary {
  total_plants: number;
  category_breakdown: { category: string, count: number }[];
  oldest_plant: string | null;
}

export default function GardenScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isGuest, user, guestGarden, updateGuestGarden } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<SavedPlant[]>([]);
  const [gardenPlants, setGardenPlants] = useState<SavedPlant[]>([]);
  const [summary, setSummary] = useState<GardenSummary | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); 

  // --- FETCH DATA ---
  const fetchMyGarden = async () => {
    setIsLoading(true);
    
    if (isGuest) {
      // Guest Mode: Filter local data
      const favs = guestGarden.filter(p => p.is_favorite);
      const garden = guestGarden.filter(p => !p.is_favorite);
      setFavorites(favs);
      setGardenPlants(garden);
      
      // Generate mock summary
      const herbCount = guestGarden.filter(p => p.category === 'Herb').length;
      setSummary({
        total_plants: guestGarden.length,
        oldest_plant: guestGarden.length > 0 ? guestGarden[guestGarden.length - 1].name : 'None',
        category_breakdown: [{ category: 'Herb', count: herbCount }]
      });
      setIsLoading(false);
    } else {
      // Online Mode: Fetch from MySQL
      try {
        const userId = user?.id || 0;
        const response = await fetch(`${API_BASE_URL}/get_my_garden.php?user_id=${userId}`);
        const data = await response.json();
        
        if (Array.isArray(data.plants)) {
           const favs = data.plants.filter((p: SavedPlant) => p.is_favorite);
           const garden = data.plants.filter((p: SavedPlant) => !p.is_favorite);
           setFavorites(favs);
           setGardenPlants(garden);
           setSummary(data.summary);
        } else {
            // Fallback if empty
            setFavorites([]); setGardenPlants([]);
        }
      } catch (error) {
        console.error("Failed to fetch garden:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useFocusEffect(useCallback(() => { fetchMyGarden(); }, [isGuest, user, guestGarden]));

  // --- HELPERS ---
  const handleRemove = (plant: SavedPlant) => {
      Alert.alert("Remove Plant", `Remove ${plant.name}?`, [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: async () => {
              if (isGuest) {
                  updateGuestGarden(guestGarden.filter(p => p.plant_id !== plant.plant_id));
              } else {
                  const fd = new FormData();
                  fd.append('action', 'remove'); fd.append('user_id', user?.id || '0'); fd.append('plant_id', plant.plant_id.toString());
                  await fetch(`${API_BASE_URL}/manage_garden_entry.php`, { method: 'POST', body: fd });
                  fetchMyGarden();
              }
          }}
      ]);
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf-outline" size={50} color={colors.subtext} style={{opacity: 0.5}} />
      <Text style={[styles.emptyText, { color: colors.subtext }]}>Your garden is empty.</Text>
      <Text style={[styles.emptySubtext, { color: colors.subtext }]}>Tap 'Scan' to add new plants.</Text>
    </View>
  );

  // --- RENDER ITEMS ---
  const renderListItem = ({ item }: { item: SavedPlant }) => (
    <TouchableOpacity style={[styles.plantCardList, { backgroundColor: colors.card }]} onPress={() => router.push(`/(app)/plantDetail?id=${item.plant_id}`)}>
      <Image source={{ uri: item.image_url }} style={styles.plantImage} />
      <View style={styles.plantInfo}>
        <Text style={[styles.plantName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.plantClass, { color: colors.subtext }]}>{item.classification}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item)} style={{padding: 8}}>
         <Ionicons name="trash-outline" size={20} color={colors.subtext} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  const renderGridItem = ({ item }: { item: SavedPlant }) => (
      <TouchableOpacity style={[styles.plantCardGrid, { backgroundColor: colors.card }]} onPress={() => router.push(`/(app)/plantDetail?id=${item.plant_id}`)}>
          <Image source={{ uri: item.image_url }} style={styles.plantImageGrid} />
          <View style={styles.gridOverlay}>
            <Text style={styles.plantNameGrid}>{item.name}</Text>
            {item.is_favorite && <Ionicons name="heart" size={16} color={colors.error} style={styles.gridFavorite} />}
          </View>
      </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>My Garden</Text>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} style={{padding: 8}}>
          <Ionicons name={viewMode === 'list' ? 'grid' : 'list'} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryItem}><Text style={[styles.summaryValue, { color: colors.text }]}>{summary?.total_plants || 0}</Text><Text style={[styles.summaryLabel, { color: colors.subtext }]}>Total Plants</Text></View>
          <View style={styles.summaryItem}><Text style={[styles.summaryValue, { color: colors.text }]}>{favorites.length}</Text><Text style={[styles.summaryLabel, { color: colors.subtext }]}>Favorites</Text></View>
          <View style={styles.summaryItem}><Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>{summary?.oldest_plant || '-'}</Text><Text style={[styles.summaryLabel, { color: colors.subtext }]}>First Plant</Text></View>
      </View>

      <GardenTipsCarousel />
      
      {isLoading ? (<ActivityIndicator size="large" color={colors.primary} style={{marginTop: 50}} />) : (
        <FlatList
            key={viewMode}
            numColumns={viewMode === 'grid' ? 2 : 1}
            data={[...favorites, ...gardenPlants]}
            renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
            keyExtractor={(item) => `plant-${item.plant_id}`}
            contentContainerStyle={{ paddingHorizontal: SIZES.padding, paddingBottom: 100 }}
            ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: - 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { ...FONTS.h1 },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: SIZES.padding, paddingVertical: 16, borderRadius: SIZES.radius, elevation: 3, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  summaryItem: { alignItems: 'center', width: '33%' },
  summaryValue: { ...FONTS.h3, fontWeight: 'bold' },
  summaryLabel: { ...FONTS.body4, fontSize: 12 },
  plantCardList: { borderRadius: SIZES.radius, marginBottom: 10, padding: 12, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  plantImage: { width: 60, height: 60, borderRadius: SIZES.radius },
  plantInfo: { flex: 1, marginLeft: 12 },
  plantName: { ...FONTS.h3, fontWeight: '600' },
  plantClass: { ...FONTS.body4, fontSize: 12 },
  plantCardGrid: { flex: 1, margin: 6, height: 160, borderRadius: SIZES.radius, overflow: 'hidden', elevation: 2 },
  plantImageGrid: { width: '100%', height: '100%' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 8, backgroundColor: 'rgba(0,0,0,0.3)' },
  plantNameGrid: { ...FONTS.h4, color: 'white', fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 },
  gridFavorite: { position: 'absolute', top: 8, right: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { ...FONTS.h3, marginTop: 16, fontWeight: '600' },
  emptySubtext: { ...FONTS.body4, marginTop: 4 },
});