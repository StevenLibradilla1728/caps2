// app/(app)/achievements.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import * as Progress from 'react-native-progress'; // We need to install this!

// --- Badge Item Component ---
const BadgeCard = ({ item, progress }: { item: any, progress: number }) => {
    const { colors } = useTheme();
    const isUnlocked = item.unlocked;
    const progressPercent = isUnlocked ? 1 : progress;

    return (
        <View style={[styles.badgeCard, { backgroundColor: colors.card, opacity: isUnlocked ? 1 : 0.7 }]}>
            <View style={[styles.iconContainer, { backgroundColor: isUnlocked ? colors.primary : colors.lightGray }]}>
                <Ionicons 
                    name={item.icon as any} 
                    size={40} 
                    color={isUnlocked ? colors.card : colors.subtext} 
                />
            </View>
            <Text style={[styles.badgeName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.badgeDesc, { color: colors.subtext }]}>{item.desc}</Text>
            <View style={styles.progressContainer}>
                {isUnlocked ? (
                    <Text style={[styles.progressText, { color: colors.success }]}>Unlocked!</Text>
                ) : (
                    <>
                        <Progress.Bar 
                            progress={progressPercent} 
                            width={null} // Fills container
                            color={colors.primary}
                            unfilledColor={colors.background}
                            borderWidth={0}
                            style={styles.progressBar}
                        />
                        <Text style={[styles.progressText, { color: colors.subtext }]}>
                            {Math.floor(progressPercent * 100)}%
                        </Text>
                    </>
                )}
            </View>
        </View>
    );
};

export default function AchievementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  // Get all achievements and current stats to calculate progress
  const { guestAchievements, guestProfile } = useAuth();

  const getProgress = (badgeName: string) => {
      // This is where you define the logic for each badge's progress bar
      const stats = guestProfile.stats;
      switch(badgeName) {
          case "First Steps": return stats.quizzes_done > 0 ? 1 : 0;
          case "Scanner Pro": return (stats.total_scans || 0) / 10;
          case "Plant Collector": return (stats.plants_saved || 0) / 10;
          case "Knowledge Seeker": return (stats.quizzes_done || 0) / 3;
          case "Quiz Master": return (stats.score || 0) / 5000;
          default: return 0;
      }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerTitle: 'Achievements',
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
      <FlatList
        data={guestAchievements}
        renderItem={({ item }) => <BadgeCard item={item} progress={getProgress(item.name)} />}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: {
    padding: SIZES.padding,
  },
  badgeCard: {
    flex: 1,
    margin: 8,
    borderRadius: SIZES.radius * 1.5,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeName: {
    ...FONTS.h3,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeDesc: {
    ...FONTS.body4,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    height: 30, // Fixed height for 2 lines
  },
  progressContainer: {
    width: '100%',
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    ...FONTS.body4,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});