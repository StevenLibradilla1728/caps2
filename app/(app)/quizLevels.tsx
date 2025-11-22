// app/(app)/quizLevels.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../constants/Config';
import { GUEST_QUIZ_DATA } from '../../constants/StaticData';



export default function QuizLevelsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { guestProgress, isGuest } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState<string | number | null>(null);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizStructure = async () => {
      setIsLoading(true);
      if (isGuest) {
          setQuizData(GUEST_QUIZ_DATA);
          if (GUEST_QUIZ_DATA.length > 0) setExpandedCategory(GUEST_QUIZ_DATA[0].id);
          setIsLoading(false);
      } else {
          try {
              const response = await fetch(`${API_BASE_URL}/get_quiz_structure.php`);
              const data = await response.json();
              if (Array.isArray(data)) {
                   setQuizData(data);
                   if (data.length > 0) setExpandedCategory(data[0].category_id);
              }
          } catch (error) {
              console.error("Failed to load quiz structure", error);
              Alert.alert("Error", "Could not load quiz data. Using offline mode.");
              setQuizData(GUEST_QUIZ_DATA);
          } finally {
              setIsLoading(false);
          }
      }
  };

  useEffect(() => { fetchQuizStructure(); }, [isGuest]);

  const toggleCategory = (categoryId: string | number, isUnlocked: boolean) => {
    if (!isUnlocked) {
        Alert.alert("Category Locked", "Complete previous categories to unlock this one.");
        return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  const handleLevelPress = (categoryId: string | number, levelId: string | number) => {
    router.push(`/(app)/quizGame?categoryId=${categoryId}&levelId=${levelId}`);
  };

  if (isLoading) {
      return (<SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.primary} /></SafeAreaView>);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
       <Stack.Screen options={{ headerTitle: 'Quiz Journey', headerStyle: { backgroundColor: colors.card }, headerTitleStyle: { color: colors.text }, headerTintColor: colors.primary, headerShadowVisible: false }}/>
       
       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{padding: SIZES.padding}}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Your Learning Path</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>{isGuest ? 'Guest Mode: Progress is temporary.' : 'Complete levels to unlock new categories.'}</Text>
          </View>

          {quizData.map((category, catIndex) => {
              const catId = isGuest ? category.id : category.category_id;
              const isExpanded = expandedCategory === catId;
              
              
              const firstLevel = category.levels[0];
              const firstLevelId = firstLevel ? (isGuest ? firstLevel.id : firstLevel.level_id) : null;
              const isCategoryUnlocked = catIndex === 0 || (firstLevelId && guestProgress[firstLevelId.toString()]);

              return (
                  <View key={catId} style={[styles.categoryCard, { backgroundColor: colors.card, opacity: isCategoryUnlocked ? 1 : 0.6 }]}>
                      <TouchableOpacity 
                         style={[styles.categoryHeader, { borderBottomColor: isExpanded ? colors.background : 'transparent', borderBottomWidth: 1 }]} 
                         onPress={() => toggleCategory(catId, isCategoryUnlocked)}
                         activeOpacity={0.8}
                      >
                          <View style={[styles.iconBox, { backgroundColor: isCategoryUnlocked ? (category.color || colors.primary) : colors.subtext }]}>
                              <Ionicons name={isCategoryUnlocked ? (category.icon || 'leaf') as any : "lock-closed"} size={24} color="white" />
                          </View>
                          <View style={styles.categoryInfo}>
                              <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.title}</Text>
                              <Text style={[styles.categoryDesc, { color: colors.subtext }]}>{isCategoryUnlocked ? (category.description || `${category.levels.length} Levels`) : "Locked"}</Text>
                          </View>
                          <Ionicons name={isExpanded ? "chevron-up" : (isCategoryUnlocked ? "chevron-down" : "lock-closed-outline")} size={20} color={colors.subtext} />
                      </TouchableOpacity>

                      {isExpanded && isCategoryUnlocked && (
                          <View style={styles.levelsContainer}>
                              {category.levels.map((level: any, index: number) => {
                                  const lvlId = isGuest ? level.id : level.level_id;
                                  // FIX: Ensure we check string key
                                  const isUnlocked = guestProgress[lvlId.toString()];
                                  
                                  return (
                                      <TouchableOpacity 
                                          key={lvlId} 
                                          style={[styles.levelItem, { borderColor: colors.background }]}
                                          onPress={() => isUnlocked ? handleLevelPress(catId, lvlId) : Alert.alert("Locked", "Complete previous level first.")}
                                          activeOpacity={isUnlocked ? 0.5 : 1}
                                      >
                                          <View style={[styles.levelStatus, { backgroundColor: isUnlocked ? (category.color || colors.primary) : colors.lightGray }]}>
                                              <Ionicons name={isUnlocked ? "play" : "lock-closed"} size={14} color={isUnlocked ? 'white' : colors.subtext} />
                                          </View>
                                          <View style={styles.levelInfo}>
                                              <Text style={[styles.levelTitle, { color: isUnlocked ? colors.text : colors.subtext }]}>{level.title}</Text>
                                              <Text style={[styles.levelDesc, { color: colors.subtext }]}>{isUnlocked ? `${level.reward_points} pts` : 'Locked'}</Text>
                                          </View>
                                      </TouchableOpacity>
                                  );
                              })}
                          </View>
                      )}
                  </View>
              );
          })}
          <View style={{height: 40}}/>
       </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 }, header: { marginBottom: 20 }, title: { ...FONTS.h2 }, subtitle: { ...FONTS.body4, marginTop: 5 }, categoryCard: { borderRadius: SIZES.radius, marginBottom: 15, overflow: 'hidden', elevation: 2 }, categoryHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 }, iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 }, categoryInfo: { flex: 1 }, categoryTitle: { ...FONTS.h3, fontWeight: 'bold' }, categoryDesc: { ...FONTS.body4, fontSize: 12 }, levelsContainer: { padding: 15, paddingTop: 5 }, levelItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 }, levelStatus: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12 }, levelInfo: { flex: 1 }, levelTitle: { ...FONTS.h4, fontWeight: '600' }, levelDesc: { ...FONTS.body4, fontSize: 11 }, pointsBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: '#F3F4F6' }, pointsText: { fontSize: 10, fontWeight: 'bold' }
});