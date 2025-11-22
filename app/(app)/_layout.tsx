// app/(app)/_layout.tsx
import { Stack } from 'expo-router';
import { useTheme } from '../../constants/Theme'; 

function AppStackLayout() {
  const { colors } = useTheme(); 

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTitleStyle: { color: colors.text }, headerTintColor: colors.primary }}>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="searchResults" options={{ headerShown: false }} />
      <Stack.Screen name="plantDetail" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="quizLevels" options={{ headerShown: false }} />
      <Stack.Screen name="quizGame" options={{ headerShown: false }} />
      <Stack.Screen name="accountSettings" options={{ headerTitle: 'Account Settings', headerShadowVisible: false }} />
      <Stack.Screen name="browseCategory" options={{ headerShown: false }} />
      <Stack.Screen name="categoryDetail" options={{ headerShown: false }} />
      <Stack.Screen name="community" options={{ headerTitle: 'Community' }} />
      <Stack.Screen name="chatbot" options={{ headerTitle: 'AI Assistant' }} />
      <Stack.Screen name="editProfile" options={{ headerTitle: 'Edit Profile', presentation: 'modal' }} />
      <Stack.Screen name="userProfile" options={{ headerTitle: 'Profile', headerShadowVisible: false }} />
      <Stack.Screen name="leaderboard" options={{ headerTitle: 'Leaderboard' }} />
      <Stack.Screen name="achievements" options={{ headerTitle: 'Achievements' }} />
      
      {/* --- ADDED NOTIFICATIONS SCREEN --- */}
      <Stack.Screen name="notifications" options={{ headerTitle: 'Notifications' }} />
    </Stack>
  );
}

export default function AppLayout() {
  return <AppStackLayout />;
}