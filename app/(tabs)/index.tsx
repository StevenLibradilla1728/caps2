// app/(tabs)/index.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import ExploreCard from '../../components/ExploreCard';
import AchievementBadge from '../../components/AchievementBadge';
import { useAuth } from '../../hooks/useAuth';
import { Achievement, GUEST_PLANT_MAP, GUEST_ACHIEVEMENTS } from '../../constants/StaticData';
import { API_BASE_URL } from '../../constants/Config';
import WeatherWidget from '../../components/WeatherWidget';
import TipsCarousel from '../../components/TipsCarousel';
import HorizontalPlantCard from '../../components/HorizontalPlantCard';
import CommunityPostSmall from '../../components/CommunityPostSmall';
import InfiniteCarousel from '../../components/InfiniteCarousel'; 
import DashboardCard from '../../components/DashboardCard';

interface UserStats { score: number; rank_name: string; plants_saved: number; quizzes_done: number; total_scans: number; }

// --- FALLBACK DATA (ONLY FOR GUEST MODE) ---
const GUEST_TIPS = [
  { id: '1', title: 'Water Wisely', content: 'Check soil moisture before watering.', icon: 'water-outline' },
  { id: '2', title: 'Sunlight', content: 'Most herbs need 6 hours of sun.', icon: 'sunny-outline' },
];
const GUEST_FALLBACK_PLANTS = Array.from(GUEST_PLANT_MAP.values()).slice(0, 5);
const GUEST_FALLBACK_POSTS = [
  { post_id: 101, user_id: 0, username: 'Admin', profile_pic: null, content: 'Welcome to the community!', like_count: 10, created_at: new Date().toISOString(), images: [] },
];

// --- IMAGE URL HELPER ---
const getFullUrl = (path: string | null) => {
    if (!path) return 'https://placehold.co/100x100/eeeeee/aaaaaa?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}/${path.replace(/^\//, '')}`;
};

// --- AUTOCOMPLETE CARD (uses helper) ---
const PlantRecommendationCard = ({ item, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.recommendCard, { borderBottomColor: colors.background }]}>
      <Image source={{ uri: getFullUrl(item.image_url) }} style={styles.recommendImage} />
      <Text style={[styles.recommendText, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  )
};

export default function DashboardScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { isGuest, guestProfile, guestAchievements, user } = useAuth(); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState<any[]>([]); 
  const [dailyTip, setDailyTip] = useState<{ title: string, content: string } | null>(null);
  
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [newPlants, setNewPlants] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [careTips, setCareTips] = useState<any[]>([]); 
  
  const fetchDashboardData = async () => {
    setError(null);
    if (!userStats) setIsLoading(true);

    try {
      if (isGuest) {
        // --- GUEST MODE ---
        setDailyTip({ title: "Today's Tip: Ginger", content: "Ginger is great for nausea." });
        setUserStats(guestProfile.stats);
        setAchievements(GUEST_ACHIEVEMENTS);
        setRecentPosts([]); // Guests don't see community
        setNewPlants(GUEST_FALLBACK_PLANTS); 
        setRecentlyViewed(GUEST_FALLBACK_PLANTS); 
        setCareTips(GUEST_TIPS);
      } else {
        // --- LOGGED-IN MODE ---
        // We fetch individually to prevent one failing API from crashing all.
        const userId = user?.id || 0;
        
        // 1. Stats and Tip
        try {
          const statsRes = await fetch(`${API_BASE_URL}/get_dashboard_data.php?user_id=${userId}`);
          const statsData = await statsRes.json();
          if (statsData.userStats) setUserStats(statsData.userStats);
          if (statsData.dailyTip) setDailyTip(statsData.dailyTip);
        } catch (e) { console.error("Stats Error:", e); }

        // 2. Recent Posts
        try {
          const postsRes = await fetch(`${API_BASE_URL}/get_recent_posts.php`);
          const postsData = await postsRes.json();
          setRecentPosts(Array.isArray(postsData) ? postsData : []);
        } catch (e) { console.error("Posts Error:", e); }

        // 3. New Plants
        let fetchedNewPlants: any[] = [];
        try {
          const newPlantsRes = await fetch(`${API_BASE_URL}/get_new_plants.php`);
          fetchedNewPlants = await newPlantsRes.json();
          setNewPlants(Array.isArray(fetchedNewPlants) ? fetchedNewPlants : []);
        } catch (e) { console.error("New Plants Error:", e); }

        // 4. Recent Views
        try {
          const viewsRes = await fetch(`${API_BASE_URL}/get_recent_views.php?user_id=${userId}`);
          const viewsData = await viewsRes.json();
          if (Array.isArray(viewsData) && viewsData.length > 0) {
            setRecentlyViewed(viewsData);
          } else {
            setRecentlyViewed(fetchedNewPlants); // Show new plants if no history
          }
        } catch (e) { console.error("Views Error:", e); }
        
        // 5. Care Tips
        try {
          const tipsRes = await fetch(`${API_BASE_URL}/get_care_tips.php`);
          const tipsData = await tipsRes.json();
          setCareTips(Array.isArray(tipsData) && tipsData.length > 0 ? tipsData : GUEST_TIPS);
        } catch (e) { console.error("Tips Error:", e); setCareTips(GUEST_TIPS); }
        
        setAchievements(GUEST_ACHIEVEMENTS); 
      }
    } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
        setError(error.message || "Failed to load data");
        // Fallback to safe guest data
        if (!userStats) setUserStats(guestProfile.stats);
        setAchievements(GUEST_ACHIEVEMENTS);
        setRecentPosts(GUEST_FALLBACK_POSTS);
        setNewPlants(GUEST_FALLBACK_PLANTS);
        setRecentlyViewed(GUEST_FALLBACK_PLANTS);
        setCareTips(GUEST_TIPS);
    } finally {
        setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDashboardData(); }, [isGuest, user, guestProfile]));

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) { setRecommendations([]); return; }
    
    if (!isGuest) {
         fetch(`${API_BASE_URL}/search_plants.php?query=${encodeURIComponent(text)}`)
          .then(res => res.json())
          .then(data => { if(Array.isArray(data)) setRecommendations(data.slice(0, 5)); })
          .catch(() => setRecommendations([]));
    } else {
        const allPlants = Array.from(GUEST_PLANT_MAP.values());
        const filtered = allPlants.filter(plant => plant.name.toLowerCase().includes(text.toLowerCase())).slice(0, 5);
        setRecommendations(filtered as any);
    }
  };

  const handleSearchSubmit = () => { if (searchQuery.trim().length > 0) { setRecommendations([]); router.push(`/(app)/searchResults?query=${encodeURIComponent(searchQuery)}`); } };
  const handleRecommendationPress = (plantId: number) => { setRecommendations([]); setSearchQuery(""); router.push(`/(app)/plantDetail?id=${plantId}`); };
  const handleAchievementPress = (item: Achievement) => { router.push('/(app)/achievements'); };
  const handleHealthCategory = (ailment: string) => { router.push(`/(app)/searchResults?query=${encodeURIComponent(ailment)}`); };
  const handleLockedFeature = (featureName: string, route: string) => { if (isGuest) { Alert.alert(`${featureName} is Locked`, `Please log in to access this feature!`, [{ text: "Cancel" }, { text: "Log In", onPress: () => router.replace('/(auth)/login') }]); } else { router.push(route as any); } };

  if (isLoading && !userStats) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // --- ERROR VIEW ---
  // Show error only if it happened AND we don't have *any* data to show
  if (error && !isGuest && !userStats) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background, padding: 40 }]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: 'center' }]}>Connection Error</Text>
        <Text style={{ color: colors.subtext, textAlign: 'center', marginBottom: 20 }}>Could not fetch data. Please check your network and ensure the server is running.</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchDashboardData}>
           <Text style={[styles.buttonText, { color: colors.card }]}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // We can safely assume we have *some* data (either guest or logged-in) by this point.
  const stats = userStats || guestProfile.stats;
  const tip = dailyTip || { title: 'Tip of the Day', content: 'Welcome to Tuklas Lunas!' };
  const badgeList = achievements || GUEST_ACHIEVEMENTS;

  const renderStatCard = (icon: any, value: string, name: string, onPress: () => void) => (
    <TouchableOpacity onPress={onPress} style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}><Ionicons name={icon} size={18} color={colors.primary} /></View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statName, { color: colors.subtext }]}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: getFullUrl(user?.profile_pic || null) }} style={styles.avatar} />
            <View>
              <Text style={[styles.headerWelcome, { color: colors.subtext }]}>Welcome back,</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{isGuest ? guestProfile.user_info.username : user?.username}</Text>
            </View>
          </TouchableOpacity>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {!isGuest && <WeatherWidget />}
            <TouchableOpacity onPress={() => router.push('/(app)/notifications')} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.subtext} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}><Ionicons name={isDarkMode ? "moon" : "sunny"} size={22} color={colors.subtext} /></TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.background }]}>
          <Ionicons name="search" size={20} color={colors.subtext} />
          <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search 50+ plants..." placeholderTextColor={colors.subtext} value={searchQuery} onChangeText={handleSearchChange} onSubmitEditing={handleSearchSubmit} returnKeyType="search" />
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.background }]}><Ionicons name="options-outline" size={20} color={colors.primary} /></TouchableOpacity>
        </View>

        {recommendations.length > 0 && (
          <View style={[styles.recommendContainer, { backgroundColor: colors.card, borderColor: colors.background }]}>
            {recommendations.map((item) => (
              <PlantRecommendationCard key={item.plant_id} item={item} onPress={() => handleRecommendationPress(item.plant_id)} />
            ))}
          </View>
        )}
        
        <View style={styles.statsGrid}>
          {renderStatCard("ribbon-outline", stats.score.toString(), "Score", () => router.push('/(tabs)/quiz'))}
          {renderStatCard("stats-chart-outline", stats.rank_name, "Rank", () => router.push('/(tabs)/quiz'))}
          {renderStatCard("leaf-outline", stats.plants_saved.toString(), "Saved", () => router.push('/(tabs)/garden'))}
          {renderStatCard("scan-outline", stats.total_scans.toString(), "Scans", () => router.push('/(tabs)/scan'))}
        </View>
        
        {careTips.length > 0 && (<><Text style={[styles.sectionTitle, { color: colors.text }]}>Plant Care Tips</Text><TipsCarousel data={careTips} /></>)}
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore</Text>
        <View style={styles.cardContainer}>
          <ExploreCard title="Scan Plant" subtitle="Identify" icon="camera-outline" colors={['#16A34A', '#6EE7B7']} onPress={() => router.push('/(tabs)/scan')} />
          <ExploreCard title="My Garden" subtitle="Collection" icon="leaf-outline" colors={['#16A34A', '#6EE7B7']} onPress={() => router.push('/(tabs)/garden')} />
          <ExploreCard title="Browse" subtitle="Categories" icon="book-outline" colors={['#16A34A', '#6EE7B7']} onPress={() => router.push('/(app)/browseCategory')} />
          <ExploreCard title="Quiz & Rank" subtitle="Play & Learn" icon="trophy-outline" colors={['#16A34A', '#6EE7B7']} onPress={() => router.push('/(tabs)/quiz')} />
          <ExploreCard title="Community" subtitle={isGuest ? "Login to access" : "Connect"} icon={isGuest ? "lock-closed-outline" : "people-outline"} colors={isGuest ? [colors.subtext, colors.lightGray] : ['#16A34A', '#6EE7B7']} onPress={() => handleLockedFeature("Community", '/(app)/community')} locked={isGuest} />
          <ExploreCard title="AI Assistant" subtitle={isGuest ? "Login to access" : "Ask me"} icon={isGuest ? "lock-closed-outline" : "chatbubble-ellipses-outline"} colors={isGuest ? [colors.subtext, colors.lightGray] : ['#16A34A', '#6EE7B7']} onPress={() => handleLockedFeature("AI Assistant", '/(app)/chatbot')} locked={isGuest} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
             {recentlyViewed.length === 0 ? "Recommended Plants" : "Recently Viewed"}
        </Text>
        <InfiniteCarousel
            data={recentlyViewed.length > 0 ? recentlyViewed : newPlants} 
            renderItem={({item}) => item ? <HorizontalPlantCard item={item} onPress={() => router.push(`/(app)/plantDetail?id=${item.plant_id}`)} /> : null}
            cardWidth={250} spacing={SIZES.padding} autoScroll={false}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Posts</Text>
        <InfiniteCarousel
            data={recentPosts}
            renderItem={({item}) => <CommunityPostSmall post={item} onPress={() => handleLockedFeature("Community", '/(app)/community')} />}
            cardWidth={280} spacing={SIZES.padding} autoScroll={true}
        />
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Added Plants</Text>
        <InfiniteCarousel
            data={newPlants}
            renderItem={({item}) => item ? <HorizontalPlantCard item={item} onPress={() => router.push(`/(app)/plantDetail?id=${item.plant_id}`)} /> : null}
            cardWidth={250} spacing={SIZES.padding} autoScroll={true}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Health Categories</Text>
        <View style={styles.cardContainer}>
          <ExploreCard title="For Cough" subtitle="View plants" icon="leaf-outline" colors={['#16A34A', '#6EE7B7']} onPress={() => handleHealthCategory('Cough')} />
          <ExploreCard title="For Skin" subtitle="View plants" icon="hand-left-outline" colors={['#2563EB', '#60A5FA']} onPress={() => handleHealthCategory('Skin')} />
          <ExploreCard title="For Headache" subtitle="View plants" icon="leaf-outline" colors={['#16A34A', '#6EE7B7']} onPress={() => handleHealthCategory('Cough')} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        <View style={styles.cardContainer}>
          {badgeList.slice(0, 4).map((item) => (
            <AchievementBadge key={item.name} item={item} onPress={() => handleAchievementPress(item)} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.padding, paddingTop: 20,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee' },
  headerWelcome: { ...FONTS.body4, color: '#888' },
  headerTitle: { ...FONTS.h3, fontWeight: 'bold' },
  iconButton: { marginLeft: 12, padding: 8, },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding, paddingLeft: 16, marginTop: 20,
    elevation: 2, shadowColor: '#000', borderWidth: 1,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
    zIndex: 10,
  },
  searchInput: { ...FONTS.body3, flex: 1, paddingVertical: 14, marginLeft: 10 },
  filterButton: { padding: 10, margin: 4, borderRadius: SIZES.radius - 4, },
  recommendContainer: {
    marginHorizontal: SIZES.padding,
    marginTop: -SIZES.radius, 
    paddingTop: SIZES.radius + 5,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    elevation: 1,
    zIndex: 9,
  },
  recommendCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  recommendImage: { width: 30, height: 30, borderRadius: 15, marginRight: 10, backgroundColor: '#eee' },
  recommendText: { ...FONTS.body3 },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginTop: 20,
  },
  statCard: {
    flex: 1, alignItems: 'center', 
    paddingVertical: 12, paddingHorizontal: 4, marginHorizontal: 4,
    borderRadius: SIZES.radius, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8, },
  statValue: { ...FONTS.h4, fontWeight: 'bold', fontSize: 12, },
  statName: { ...FONTS.body4, fontSize: 10, },
  sectionTitle: { ...FONTS.h2, marginHorizontal: SIZES.padding, marginTop: 10, marginBottom: 5, },
  cardContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.padding - 5, },
  fullCard: { borderRadius: SIZES.radius, marginHorizontal: SIZES.padding, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, marginBottom: 10, },
  cardTip: { ...FONTS.body4, lineHeight: 22, marginBottom: 30, },
  retryButton: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 30, marginTop: 20 },
  buttonText: { ...FONTS.h3, fontWeight: 'bold' },
});