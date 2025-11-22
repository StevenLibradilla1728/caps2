// app/(auth)/index.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Link } from 'expo-router';
import { useTheme, FONTS, SIZES } from '../../constants/Theme'; 
import GradientButton from '../../components/GradientButton';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated'; 

const PLANT_SCAN_IMAGE = require('../../assets/images/Tree.png');

// FeatureCard Component
const FeatureCard = ({ iconName, text }: { iconName: any, text: string }) => {
  const { colors } = useTheme(); // Use hook for colors
  return (
    <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.background }]}>
      <Ionicons name={iconName} size={20} color={colors.primary} style={styles.featureIcon} />
      <Text style={[styles.featureCardText, { color: colors.text }]}>{text}</Text>
    </View>
  );
};

// New component to wrap FeatureCard and apply the sequential animation
const CardSequence = ({ index, children }: { index: number, children: React.ReactNode }) => {
  const fadeAnim = useSharedValue(0);
  
  const FADE_TIME = 200;
  const STEP_TIME = 800;
  const APPEARANCE_PHASE_TIME = STEP_TIME * 3; 
  const ALL_VISIBLE_TIME = 1000; 
  const FADE_OUT_TIME = 500;
  const initialDelay = STEP_TIME * index;
  const individualWaitTime = APPEARANCE_PHASE_TIME - initialDelay;

  useEffect(() => {
    const sequentialSequence = withSequence(
      withTiming(0, { duration: initialDelay }), 
      withTiming(1, { duration: FADE_TIME, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: STEP_TIME - FADE_TIME }), 
      withTiming(1, { duration: individualWaitTime })
    );

    const fadeOutSequence = withSequence(
      withTiming(1, { duration: ALL_VISIBLE_TIME }),
      withTiming(0, { duration: FADE_OUT_TIME, easing: Easing.in(Easing.ease) }),
      withTiming(0, { duration: 0 }) 
    );
    
    fadeAnim.value = withRepeat(
      withSequence(
        sequentialSequence,
        fadeOutSequence
      ), 
      -1, 
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: (1 - fadeAnim.value) * 10 }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};


export default function IntroScreen() {
  const { colors } = useTheme(); // Use hook for colors
  const scanLineOpacity = useSharedValue(0);
  const scanLinePosition = useSharedValue(0);

  useEffect(() => {
    scanLineOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      true
    );

    scanLinePosition.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 2500, easing: Easing.linear }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const animatedScanLineStyle = useAnimatedStyle(() => {
    const translateY = scanLinePosition.value * 100; // Adjust 120 based on image height
    return {
      opacity: scanLineOpacity.value,
      transform: [{ translateY }],
    };
  });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Updated Header Structure */}
      <View style={styles.header}>
        <Ionicons name="leaf" size={40} color={colors.primary} style={styles.appLogo} />
        <Text style={[styles.appName, { color: colors.primary }]}>Tuklas Lunas</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={PLANT_SCAN_IMAGE} style={styles.plantImage} resizeMode="contain" />
        <Animated.View style={[styles.scanLine, { backgroundColor: colors.primary }, animatedScanLineStyle]} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Discover Nature's Healing Power</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Tuklas Lunas lets you identify, learn, and contribute herbal knowledge.
        </Text>

        <View style={styles.featureCardsContainer}>
          {/* Card 1 (Index 0): Instantly Identify */}
          <CardSequence index={0}>
            <FeatureCard iconName="camera-outline" text="Instantly Identify" />
          </CardSequence>

          {/* Card 2 (Index 1): Build Your Garden */}
          <CardSequence index={1}>
            <FeatureCard iconName="leaf-outline" text="Build Your Garden" />
          </CardSequence>

          {/* Card 3 (Index 2): Take Quizzes */}
          <CardSequence index={2}>
            <FeatureCard iconName="trophy-outline" text="Take Quizzes" />
          </CardSequence>
        </View>

        <Link href="/(auth)/onboarding" asChild>
          <GradientButton title="Get Started" onPress={() => {}} />
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'column', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 40,
  },
  appLogo: {
    marginBottom: 2,
  },
  appName: {
    ...FONTS.h2,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    paddingRight: 30,
  },
  plantImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  scanLine: {
    position: 'absolute',
    width: '60%',
    height: 3,
    borderRadius: 1.5,
    marginLeft: 30,
    top: 0,
  },
  contentContainer: {
    flex: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 5,
  },
  title: {
    ...FONTS.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    ...FONTS.body4,
    textAlign: 'center',
    marginBottom: 2,
    marginLeft: 20,
    marginRight: 20,
  },
  featureCardsContainer: {
    marginTop: 25,
    marginBottom: 40,
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
  },
  featureIcon: {
    marginRight: 15,
  },
  featureCardText: {
    ...FONTS.h4,
    fontWeight: '600',
  },
});