// app/(app)/notifications.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  // Mock data for notifications
  const notifications = [
    { id: '1', icon: 'heart', color: colors.error, title: "New Like", text: "Herbalist22 liked your post about Lagundi.", time: "5m ago" },
    { id: '2', icon: 'trophy', color: colors.primary, title: "Badge Unlocked!", text: "You've unlocked the 'First Steps' badge.", time: "1h ago" },
    { id: '3', icon: 'leaf', color: colors.accent, title: "New Plant Added", text: "A new plant 'Ashitaba' has been added to the database.", time: "1d ago" },
    { id: '4', icon: 'alarm', color: colors.primary, title: "Quiz Reminder", text: "Don't forget your daily quiz challenge!", time: "2d ago" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerTitle: 'Notifications',
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
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.notiCard, { backgroundColor: colors.card, borderBottomColor: colors.background }]}>
            <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.textWrapper}>
                <Text style={[styles.notiTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.notiText, { color: colors.subtext }]}>{item.text}</Text>
            </View>
            <Text style={[styles.notiTime, { color: colors.subtext }]}>{item.time}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// Import FlatList
import { FlatList } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1 },
  notiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding / 1.5,
    borderBottomWidth: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  notiTitle: {
    ...FONTS.h3,
    fontWeight: '600',
  },
  notiText: {
    ...FONTS.body4,
    marginTop: 2,
  },
  notiTime: {
    ...FONTS.body4,
    fontSize: 12,
    marginLeft: 8,
  },
});