// app/(app)/splash.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat } from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  // Animation: Gentle pulse
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Loop forever
      true // Reverse
    );

    // After 3 seconds, navigate to the main app
    const timer = setTimeout(() => {
      router.replace('/(tabs)'); // Go to the main dashboard
    }, 3000);

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={animatedStyle}>
        <Ionicons name="leaf" size={120} color={colors.primary} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});