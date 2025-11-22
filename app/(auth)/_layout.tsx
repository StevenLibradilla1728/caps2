// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

// This layout manages the screens *before* the user is logged in
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}