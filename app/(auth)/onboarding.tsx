// app/(auth)/onboarding.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useRouter } from 'expo-router';
import { useTheme, FONTS } from '../../constants/Theme'; 
import GradientButton from '../../components/GradientButton';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Onboarding Content ---
const SLIDES = [
  {
    id: 1,
    icon: 'camera-outline',
    title: 'Identify Plants Instantly',
    description: 'Use your phone’s camera to quickly identify Philippine herbal plants and access detailed information.',
  },
  {
    id: 2,
    icon: 'leaf-outline',
    title: 'Build Your Personal Garden',
    description: 'Save your favorite or most used plants to your virtual garden for easy access and knowledge tracking.',
  },
  {
    id: 3,
    icon: 'book-outline',
    title: 'Learn Traditional Uses',
    description: 'Discover regional distribution, scientific names, and traditional Filipino uses for holistic wellness.',
  },
  {
    id: 4,
    icon: 'person-outline',
    title: 'Challenge Your Knowledge',
    description: 'Test your herbal literacy with fun quizzes and climb the global leaderboard for recognition.',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme(); 
  const PRIMARY_GREEN = colors.primary; 
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
    } else {
      handleSkip();
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(newIndex);
  };
  
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.text }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slideContainer}>
            <View style={[styles.iconBox, { backgroundColor: colors.card }]}>
              <Ionicons name={slide.icon as any} size={80} color={PRIMARY_GREEN} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.description, { color: colors.subtext }]}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? PRIMARY_GREEN : colors.subtext },
                { width: index === currentIndex ? 24 : 8 },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title={currentIndex === SLIDES.length - 1 ? 'Start Now' : 'Next'}
            onPress={handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    height: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  skipButton: {
    padding: 10,
    marginRight: 5,
    marginTop: 20,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  iconBox: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    ...FONTS.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    ...FONTS.body3,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
    height: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
});