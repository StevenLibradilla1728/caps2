// app/(tabs)/quiz.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { GUEST_LEADERBOARD, Achievement } from '../../constants/StaticData';
import { API_BASE_URL } from '../../constants/Config';

interface MyRank { position: number; score: number; rank_name: string; }
interface Player { username: string; score: number; rank_name: string; }

export default function QuizScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isGuest, user, guestProfile, guestAchievements } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const fetchQuizInfo = async () => {
    setIsLoading(true);
    if (isGuest) {
      setMyRank({ position: GUEST_LEADERBOARD.myRank.position, score: guestProfile.stats.score, rank_name: guestProfile.stats.rank_name });
      setTopPlayers(GUEST_LEADERBOARD.topPlayers);
      setAchievements(guestAchievements);
      setIsLoading(false);
    } else {
      try {
        const userId = user?.id || 0;
        const response = await fetch(`${API_BASE_URL}/leaderboard.php?user_id=${userId}`);
        const data = await response.json();
        setMyRank(data.myRank);
        setTopPlayers(data.topPlayers);
        setAchievements(guestAchievements); // Using static achievements for now
      } catch (error) { console.error(error); } 
      finally { setIsLoading(false); }
    }
  };

  useFocusEffect(useCallback(() => { fetchQuizInfo(); }, [isGuest, user, guestProfile, guestAchievements]));

  const getRankIcon = (index: number) => {
    if (index === 0) return { name: "trophy", color: "#FFD700" };
    if (index === 1) return { name: "trophy", color: "#C0C0C0" };
    if (index === 2) return { name: "trophy", color: "#CD7F32" };
    return null;
  };

  const renderBadge = ({ item }: { item: Achievement }) => (
    <View style={[styles.badgeCard, { backgroundColor: item.unlocked ? colors.card : colors.background, borderColor: colors.subtext, opacity: item.unlocked ? 1 : 0.6 }]}>
        <Ionicons name={item.icon as any} size={24} color={item.unlocked ? colors.primary : colors.subtext} />
        <Text style={[styles.badgeName, { color: item.unlocked ? colors.text : colors.subtext }]} numberOfLines={1}>{item.name}</Text>
    </View>
  );

  if (isLoading) return (<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></SafeAreaView>);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Quiz & Rank</Text>
        
        <TouchableOpacity style={[styles.startCard, { backgroundColor: colors.primary }]} onPress={() => router.push('/(app)/quizLevels')}>
          <View><Text style={[styles.startTitle, { color: colors.card }]}>Start Your Quiz</Text><Text style={[styles.startDesc, { color: colors.card }]}>8 Categories, 40 Levels</Text></View>
          <Ionicons name="play-circle" size={50} color={colors.card} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Challenge</Text>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center' }]}>
            <Ionicons name="calendar-outline" size={30} color={colors.accent} />
            <View style={{flex: 1, marginLeft: 15}}><Text style={[styles.cardTitle, { color: colors.text }]}>Daily Random Quiz</Text><Text style={[styles.cardSubtitle, { color: colors.subtext }]}>Complete for +50 bonus points!</Text></View>
            <Ionicons name="chevron-forward" size={24} color={colors.subtext} />
        </TouchableOpacity>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Your Rank</Text>
          <View style={{alignItems: 'center', marginVertical: 15}}>
              <Text style={[styles.rankName, { color: colors.primary }]}>{myRank?.rank_name || 'N/A'}</Text>
              <Text style={[styles.rankScore, { color: colors.subtext }]}>{myRank?.score || 0} PTS</Text>
          </View>
          <Text style={[styles.rankProgressText, { color: colors.text }]}>You are closer to becoming a "Nature Master"!</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Leaderboard (Top 5)</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {topPlayers.map((player, index) => (
            <View key={index} style={[styles.playerRow, { borderBottomColor: colors.background, backgroundColor: index < 3 ? colors.background : 'transparent' }]}>
              <Text style={[styles.playerRank, { color: colors.subtext }]}>{index + 1}</Text>
              {getRankIcon(index) && (<FontAwesome5 name={getRankIcon(index)!.name} size={16} color={getRankIcon(index)!.color} style={{ marginHorizontal: 8 }} />)}
              <Text style={[styles.playerName, { color: colors.text }]}>{player.username}</Text>
              <Text style={[styles.playerScore, { color: colors.primary }]}>{player.score} pts</Text>
            </View>
          ))}
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Badge Showcase</Text>
        <FlatList horizontal data={achievements} renderItem={renderBadge} keyExtractor={(item) => item.name} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SIZES.padding }} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, marginBottom: - 50 }, loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, headerTitle: { ...FONTS.h1, paddingHorizontal: SIZES.padding, paddingTop: 20, paddingBottom: 10 }, sectionTitle: { ...FONTS.h2, marginHorizontal: SIZES.padding, marginTop: 20, marginBottom: 10 }, card: { borderRadius: SIZES.radius * 1.5, marginHorizontal: SIZES.padding, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, marginBottom: 10 }, startCard: { borderRadius: SIZES.radius * 1.5, margin: SIZES.padding, padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 }, startTitle: { ...FONTS.h2, fontWeight: 'bold' }, startDesc: { ...FONTS.body4, opacity: 0.9 }, cardTitle: { ...FONTS.h3, fontWeight: 'bold' }, cardSubtitle: { ...FONTS.body4, marginTop: 5 }, rankName: { ...FONTS.h1, fontSize: 28, fontWeight: 'bold' }, rankScore: { ...FONTS.h3, marginTop: 4 }, rankProgressText: { ...FONTS.body3, textAlign: 'center', fontStyle: 'italic', marginTop: 10 }, playerRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderBottomWidth: 1, }, playerRank: { ...FONTS.h3, width: 25 }, playerName: { ...FONTS.h3, flex: 1 }, playerScore: { ...FONTS.h3, fontWeight: 'bold' }, badgeCard: { width: 120, height: 120, borderRadius: SIZES.radius, marginRight: 10, padding: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, }, badgeName: { ...FONTS.h4, fontWeight: '600', marginTop: 8, textAlign: 'center' }, badgeDesc: { ...FONTS.body4, fontSize: 10, textAlign: 'center', marginTop: 2 }, });