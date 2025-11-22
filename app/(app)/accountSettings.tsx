// app/(app)/accountSettings.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  
  // Get guest state and functions
  const { signOut, isGuest, guestProfile, updateGuestProfile, user } = useAuth();
  
  // Use guest name if in guest mode, or real user's name (if available)
  const [name, setName] = useState(isGuest ? guestProfile.user_info.username : user?.username || "Logged-in User");
  
  // States for toggles
  const [quizReminders, setQuizReminders] = useState(true);
  const [achievementNotifs, setAchievementNotifs] = useState(true);

  const handleLogout = () => {
    signOut();
    // The RootLayout's useEffect will automatically redirect to the (auth) flow
  };

  const handleSaveName = () => {
    if (isGuest) {
      updateGuestProfile({ username: name });
      Alert.alert("Success", "Guest name updated temporarily.");
    } else {
      // TODO: Add API call to update logged-in user's name
      Alert.alert("Success", "Profile name updated!");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Use Stack.Screen to customize the header */}
      <Stack.Screen 
        options={{
          headerTitle: 'Account Settings',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage Account</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.inputLabel, { color: colors.subtext }]}>Name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.background }]}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor={colors.subtext}
          />
          <Text style={[styles.inputLabel, { color: colors.subtext }]}>Email</Text>
          <TextInput
            style={[styles.input, { color: colors.subtext, borderColor: colors.background }]}
            value={isGuest ? guestProfile.user_info.email : (user?.email || "user@gmail.com")}
            placeholder="Your Email"
            editable={false} // Email is not editable
          />
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={handleSaveName}
          >
            <Text style={[styles.buttonText, { color: colors.card }]}>Save Name</Text>
          </TouchableOpacity>
        </View>

        {/* --- Only show Change Password for LOGGED-IN users --- */}
        {!isGuest && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.inputLabel, { color: colors.subtext }]}>Current Password</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.background }]}
                placeholder="************"
                placeholderTextColor={colors.subtext}
                secureTextEntry
              />
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
                <Text style={[styles.buttonText, { color: colors.card }]}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Display</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
            <Switch
              trackColor={{ false: colors.subtext, true: colors.primary }}
              thumbColor={isDarkMode ? colors.card : colors.card}
              onValueChange={toggleTheme}
              value={isDarkMode}
            />
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Quiz Reminders</Text>
            <Switch
              trackColor={{ false: colors.subtext, true: colors.primary }}
              thumbColor={quizReminders ? colors.card : colors.card}
              onValueChange={() => setQuizReminders(prev => !prev)}
              value={quizReminders}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.background }]} />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Achievement Notifications</Text>
            <Switch
              trackColor={{ false: colors.subtext, true: colors.primary }}
              thumbColor={achievementNotifs ? colors.card : colors.card}
              onValueChange={() => setAchievementNotifs(prev => !prev)}
              value={achievementNotifs}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Terms of Use</Text>
            <Ionicons name="chevron-forward-outline" size={20} color={colors.subtext} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.background }]} />
          <TouchableOpacity style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward-outline" size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
          <Text style={[styles.buttonText, { color: colors.card }]}>
            {isGuest ? 'Exit Guest Mode' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: SIZES.padding },
  sectionTitle: { ...FONTS.h2, marginTop: 10, marginBottom: 10 },
  card: {
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputLabel: { ...FONTS.body4, marginBottom: 5 },
  input: {
    ...FONTS.h3,
    borderWidth: 1,
    borderRadius: SIZES.radius / 2,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    padding: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonText: { ...FONTS.h3, fontWeight: 'bold' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabel: { ...FONTS.h3 },
  divider: { height: 1, marginVertical: 5 },
  logoutButton: {
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 20,
  },
});