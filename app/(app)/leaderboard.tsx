// app/(app)/leaderboard.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { GUEST_LEADERBOARD } from '../../constants/StaticData';
import { API_BASE_URL } from '../../constants/Config';

interface MyRank { position: number; score: number; rank_name: string; }
interface Player { user_id: string; username: string; score: number; rank_name: string; profile_pic: string | null; }

export default function LeaderboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isGuest, user, guestProfile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'weekly'>('all');

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    if (isGuest) {
      setMyRank({ ...GUEST_LEADERBOARD.myRank, score: guestProfile.stats.score, rank_name: guestProfile.stats.rank_name });
      setTopPlayers(GUEST_LEADERBOARD.topPlayers as any);
      setIsLoading(false);
    } else {
      try {
        const userId = user?.id || 0;
        // Update API to support weekly/monthly
        const response = await fetch(`${API_BASE_URL}/leaderboard.php?user_id=${userId}&timeframe=${activeTab}`);
        const data = await response.json();
        setMyRank(data.myRank);
        setTopPlayers(data.topPlayers);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        setMyRank(GUEST_LEADERBOARD.myRank);
        setTopPlayers(GUEST_LEADERBOARD.topPlayers as any);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useFocusEffect(useCallback(() => { fetchLeaderboard(); }, [isGuest, user, guestProfile, activeTab]));

  const getRankIcon = (index: number) => {
    if (index === 0) return { name: "trophy", color: "#FFD700" };
    if (index === 1) return { name: "trophy", color: "#C0C0C0" };
    if (index === 2) return { name: "trophy", color: "#CD7F32" };
    return null;
  };

  const getFullUrl = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      return `${API_BASE_URL.replace(/\/api\/?$/, '')}/${path.replace(/^\//, '')}`;
  };

  const renderPlayer = ({ item, index }: { item: Player, index: number }) => {
    const isMe = !isGuest && item.user_id === user?.id;
    const avatarUrl = getFullUrl(item.profile_pic);

    return (
      <TouchableOpacity 
        style={[styles.playerRow, { backgroundColor: isMe ? colors.secondary : colors.card, borderColor: isMe ? colors.primary : 'transparent' }]}
        onPress={() => router.push(`/(app)/userProfile?userId=${item.user_id}`)}
      >
        <Text style={[styles.playerRank, { color: colors.subtext }]}>{index + 1}</Text>
        {getRankIcon(index) && (
            <FontAwesome5 name={getRankIcon(index)!.name} size={16} color={getRankIcon(index)!.color} style={{ marginHorizontal: 8 }} />
        )}
        
        {avatarUrl ? (
             <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
             <View style={[styles.avatar, { backgroundColor: colors.subtext }]}><Text style={styles.avatarText}>{item.username.charAt(0)}</Text></View>
        )}

        <View style={{flex: 1}}>
            <Text style={[styles.playerName, { color: colors.text }]}>{item.username} {isMe ? '(You)' : ''}</Text>
            <Text style={[styles.playerRankName, { color: colors.subtext }]}>{item.rank_name}</Text>
        </View>
        <Text style={[styles.playerScore, { color: colors.primary }]}>{item.score} pts</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerTitle: 'Leaderboard', headerStyle: { backgroundColor: colors.card }, headerTitleStyle: { color: colors.text }, headerLeft: () => (<TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}><Ionicons name="chevron-back" size={24} color={colors.primary} /></TouchableOpacity>), headerShadowVisible: false }}/>
      
      {/* My Rank Card */}
      {!isLoading && myRank && (
          <View style={[styles.card, styles.myRankCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.myRankLabel, { color: colors.subtext }]}>Your Rank</Text>
            <View style={styles.myRankRow}>
                <Text style={[styles.myRankPosition, { color: colors.primary }]}>#{myRank.position}</Text>
                <View style={{alignItems: 'flex-end'}}>
                    <Text style={[styles.myRankScore, { color: colors.text }]}>{myRank.score} PTS</Text>
                    <Text style={[styles.myRankName, { color: colors.subtext }]}>{myRank.rank_name}</Text>
                </View>
            </View>
          </View>
      )}

      {/* Timeframe Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={[styles.tab, activeTab === 'all' && { borderBottomColor: colors.primary }]} onPress={() => setActiveTab('all')}>
              <Text style={[styles.tabText, { color: activeTab === 'all' ? colors.primary : colors.subtext }]}>All-Time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'weekly' && { borderBottomColor: colors.primary }]} onPress={() => setActiveTab('weekly')}>
              <Text style={[styles.tabText, { color: activeTab === 'weekly' ? colors.primary : colors.subtext }]}>Weekly</Text>
          </TouchableOpacity>
      </View>

      {/* Full List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{flex: 1}} />
      ) : (
        <FlatList
          data={topPlayers}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.user_id.toString()}
          contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: SIZES.radius * 1.5, margin: SIZES.padding, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  myRankCard: { marginBottom: 10 },
  myRankLabel: { ...FONTS.body4, textTransform: 'uppercase', letterSpacing: 0.5 },
  myRankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 5 },
  myRankPosition: { ...FONTS.h1, fontSize: 42, fontWeight: 'bold' },
  myRankScore: { ...FONTS.h2 },
  myRankName: { ...FONTS.body3, fontStyle: 'italic' },
  tabContainer: { flexDirection: 'row', marginHorizontal: SIZES.padding, borderTopLeftRadius: SIZES.radius, borderTopRightRadius: SIZES.radius, overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { ...FONTS.h3, fontWeight: '600' },
  playerRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: SIZES.radius, borderBottomWidth: 1, marginBottom: 8, borderWidth: 1 },
  playerRank: { ...FONTS.h3, fontWeight: 'bold', width: 30 },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { ...FONTS.h4, color: 'white', fontWeight: 'bold' },
  playerName: { ...FONTS.h3, flex: 1 },
  playerRankName: { ...FONTS.body4, fontSize: 12, color: '#888' },
  playerScore: { ...FONTS.h3, fontWeight: 'bold' },
});