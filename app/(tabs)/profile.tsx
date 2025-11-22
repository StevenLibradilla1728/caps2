// app/(tabs)/profile.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import AchievementBadge from '../../components/AchievementBadge';
import SettingsRow from '../../components/SettingsRow';
import DashboardCard from '../../components/DashboardCard';
import { API_BASE_URL } from '../../constants/Config';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme(); 
  const { signOut, isGuest, user, guestProfile, guestAchievements, guestGarden } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [recentPlants, setRecentPlants] = useState<any[]>([]);
  
  // Timeline Data
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const fetchProfileData = async () => {
    setIsLoading(true);
    if (isGuest) {
      // --- GUEST MODE ---
      setProfile({
        user_info: guestProfile.user_info,
        stats: { ...guestProfile.stats, plants_saved: guestGarden.length, badges_earned: guestAchievements.filter(a => a.unlocked).length },
      });
      setAchievements(guestAchievements);
      setRecentPlants(guestGarden.slice(0, 3));
      
      // Mock timeline for guest
      setActivityTimeline([
          { id: 'g1', type: 'plant', text: 'Saved "Lagundi" to garden', icon: 'leaf', color: '#16A34A', time: 'Just now' },
          { id: 'g2', type: 'quiz', text: 'Completed "Level 1: Basics"', icon: 'trophy', color: '#F59E0B', time: '1 hour ago' },
      ]);
      setIsLoading(false);
    } else {
      // --- LOGGED-IN MODE ---
      try {
        const response = await fetch(`${API_BASE_URL}/get_profile_data.php?user_id=${user?.id}`);
        const data = await response.json();
        
        if (data.user_info) {
            setProfile(data);
            setAchievements(data.achievements || []);
            setRecentPlants(data.recent_plants || []);

            // Build Activity Timeline
            const timeline = [];
            // 1. Posts
            if (data.recent_posts) {
                data.recent_posts.forEach((p: any, i: number) => {
                    timeline.push({ id: `post_${i}`, type: 'post', text: `Posted: "${p.content.substring(0, 30)}..."`, icon: 'chatbubble-ellipses', color: '#8B5CF6', time: new Date(p.created_at).toLocaleDateString() });
                });
            }
            // 2. Quizzes
            if (data.recent_quizzes) {
                data.recent_quizzes.forEach((q: any, i: number) => {
                    timeline.push({ id: `quiz_${i}`, type: 'quiz', text: `Completed ${q.title} (${q.score} pts)`, icon: 'school', color: '#F59E0B', time: 'Recent' });
                });
            }
            // 3. Plants (Mock time as 'Recent' since garden table lacks timestamp in this version)
            if (data.recent_plants) {
                data.recent_plants.slice(0, 2).forEach((p: any, i: number) => {
                    timeline.push({ id: `plant_${i}`, type: 'plant', text: `Saved ${p.name} to garden`, icon: 'leaf', color: '#16A34A', time: 'Recent' });
                });
            }
            
            setActivityTimeline(timeline);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useFocusEffect(useCallback(() => { fetchProfileData(); }, [isGuest, user, guestProfile, guestGarden]));

  const getFullUrl = (path: string | null) => path ? `${API_BASE_URL.replace(/\/api\/?$/, '')}/${path.replace(/^\//, '')}` : null;

  if (isLoading || !profile) {
    return (<SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></SafeAreaView>);
  }

  const { user_info, stats } = profile;
  const coverUrl = getFullUrl(user_info.cover_photo);
  const avatarUrl = getFullUrl(user_info.profile_pic);

  const handleFeedback = () => Alert.alert("Feedback", "Form coming soon.");

  const renderRecentPlant = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.recentPlantCard, { backgroundColor: colors.card }]} onPress={() => router.push(`/(app)/plantDetail?id=${item.plant_id}`)}>
      <Image source={{ uri: getFullUrl(item.image_url) || 'https://placehold.co/100' }} style={styles.recentPlantImage} />
      <Text style={[styles.recentPlantName, { color: colors.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- HEADER --- */}
        <View style={{ marginBottom: 10 }}>
            <View style={{ height: 160, width: '100%' }}>
                {coverUrl ? <Image source={{ uri: coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> 
                         : <View style={{ width: '100%', height: '100%', backgroundColor: colors.primary, opacity: 0.2 }} />}
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: -50, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View style={[styles.avatarContainer, { backgroundColor: colors.background }]}>
                    {avatarUrl ? (<Image source={{ uri: avatarUrl }} style={styles.avatar} />) : (<View style={[styles.avatar, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{fontSize: 40, color: 'white'}}>{user_info.username.charAt(0).toUpperCase()}</Text></View>)}
                </View>
                 {!isGuest && (<TouchableOpacity style={[styles.editButton, { backgroundColor: colors.card, borderColor: colors.subtext }]} onPress={() => router.push('/(app)/editProfile')}><Ionicons name="pencil" size={16} color={colors.text} /><Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text></TouchableOpacity>)}
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                <Text style={[styles.username, { color: colors.text }]}>{user_info.username}</Text>
                {user_info.bio ? <Text style={{ color: colors.text, marginTop: 4 }}>{user_info.bio}</Text> : null}
                <Text style={[styles.rankName, { color: colors.primary, marginTop: 4 }]}>{stats.rank_name}</Text>
            </View>
        </View>

        {/* --- STATS --- */}
        <View style={[styles.card, { backgroundColor: colors.card, marginTop: 20 }]}>
          <View style={styles.statsRow}><StatItem title="Score" value={stats.score} icon="ribbon-outline" color={colors.primary} /><StatItem title="Rank" value={stats.rank_name} icon="stats-chart-outline" color={colors.accent} /></View>
          <View style={[styles.statsRow, { borderBottomWidth: 0 }]}><StatItem title="Saved" value={stats.plants_saved} icon="leaf-outline" color="#DC2626" /><StatItem title="Badges" value={`${stats.badges_earned}`} icon="shield-half-outline" color="#F59E0B" /></View>
        </View>

        {/* --- ACTIVITY TIMELINE (NEW) --- */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Timeline</Text>
        <View style={[styles.card, { backgroundColor: colors.card, padding: 0 }]}>
            {activityTimeline.length > 0 ? activityTimeline.map((item, index) => (
                <View key={index} style={[styles.activityItem, { borderBottomColor: colors.background, borderBottomWidth: index === activityTimeline.length - 1 ? 0 : 1 }]}>
                    <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
                        <Ionicons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={[styles.activityText, { color: colors.text }]}>{item.text}</Text>
                    </View>
                    <Text style={[styles.activityTime, { color: colors.subtext }]}>{item.time}</Text>
                </View>
            )) : (
                <Text style={{padding: 20, color: colors.subtext, textAlign: 'center'}}>No recent activity.</Text>
            )}
        </View>
        
        {/* --- ACHIEVEMENTS --- */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        <View style={styles.cardContainer}>
          {achievements.map((item) => (<AchievementBadge key={item.name} item={item} onPress={() => {}} />))}
        </View>

        {/* --- RECENT PLANTS --- */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Saved</Text>
        <View style={{ marginHorizontal: SIZES.padding }}>
          {recentPlants.length > 0 ? (<FlatList data={recentPlants} renderItem={renderRecentPlant} keyExtractor={(item) => item.plant_id.toString()} scrollEnabled={false} />) : (<View style={[styles.card, { backgroundColor: colors.card }]}><Text style={[styles.emptyText, { color: colors.subtext }]}>No saved plants yet.</Text></View>)}
        </View>

        {/* --- SETTINGS --- */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        <View style={[styles.card, { backgroundColor: colors.card, paddingHorizontal: 0, paddingBottom: 0 }]}>
            <View style={{paddingHorizontal: 20}}><SettingsRow icon="moon-outline" title="Dark Mode" isToggle={true} value={isDarkMode} onToggle={toggleTheme} /></View>
            <View style={{paddingHorizontal: 20}}><SettingsRow icon="notifications-outline" title={isGuest ? "Notifications (Login)" : "Notifications"} isToggle={true} value={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} disabled={isGuest} /></View>
            <View style={{paddingHorizontal: 20}}><SettingsRow icon="chatbubble-ellipses-outline" title={isGuest ? "Feedback (Login)" : "Feedback and Ratings"} disabled={isGuest} onPress={handleFeedback} /></View>
            <View style={{paddingHorizontal: 20}}><SettingsRow icon="document-text-outline" title="Terms of Use" onPress={() => Alert.alert("Terms", "...")} /></View>
            <View style={{paddingHorizontal: 20}}><SettingsRow icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => Alert.alert("Privacy Policy", "...")} /></View>
             <View style={{paddingHorizontal: 20}}><SettingsRow icon="log-out-outline" title={isGuest ? "Exit Guest Mode" : "Sign Out"} onPress={signOut} isLast={true} /></View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const StatItem = ({ title, value, icon, color }: any) => {
    const { colors } = useTheme();
    return (<View style={styles.statItem}><Ionicons name={icon} size={20} color={color} style={{ marginRight: 8 }} /><View><Text style={{ ...FONTS.h3, color: colors.text }}>{value}</Text><Text style={{ ...FONTS.body4, color: colors.subtext }}>{title}</Text></View></View>);
};

const styles = StyleSheet.create({
  container: { flex: 1 }, loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarContainer: { padding: 4, borderRadius: 54, alignSelf: 'flex-start' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4 },
  editButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  editButtonText: { marginLeft: 4, fontWeight: '600', fontSize: 14 },
  username: { ...FONTS.h1, fontSize: 28 },
  rankName: { ...FONTS.h3, fontWeight: 'bold' },
  sectionTitle: { ...FONTS.h2, marginHorizontal: SIZES.padding, marginTop: 30, marginBottom: 10 },
  card: { borderRadius: SIZES.radius, marginHorizontal: SIZES.padding, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.padding - 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  statItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
  recentPlantCard: { borderRadius: SIZES.radius, marginBottom: 10, padding: 12, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  recentPlantImage: { width: 40, height: 40, borderRadius: 20 },
  recentPlantName: { ...FONTS.h3, marginLeft: 12 },
  emptyText: { ...FONTS.body3, textAlign: 'center', padding: 20 },
  // Timeline Styles
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  activityIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityText: { ...FONTS.body4, fontWeight: '500', flex: 1 },
  activityTime: { ...FONTS.body4, fontSize: 12, marginLeft: 8 },
});