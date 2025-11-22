// app/(auth)/signup.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useRouter, Link } from 'expo-router';
import { API_BASE_URL } from '../../constants/Config'; // <-- NEW IMPORT

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    
    setIsLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);

    try {
      // Use the central config URL
      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      setIsLoading(false);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Your account has been created. Please log in.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      } else {
        Alert.alert('Sign Up Failed', result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.primary }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Start your herbal journey today</Text>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.background, borderWidth: 1 }]}
            placeholder="Username"
            placeholderTextColor={colors.subtext}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.background, borderWidth: 1 }]}
            placeholder="Email"
            placeholderTextColor={colors.subtext}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.background, borderWidth: 1 }]}
            placeholder="Password (min. 6 characters)"
            placeholderTextColor={colors.subtext}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.background, borderWidth: 1 }]}
            placeholder="Confirm Password"
            placeholderTextColor={colors.subtext}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }, isLoading && styles.buttonDisabled]} 
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, { color: colors.card }]}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.loginContainer, { borderTopColor: colors.subtext }]}>
          <Text style={[styles.loginText, { color: colors.subtext }]}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Log in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    ...FONTS.h1,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 40,
  },
  subtitle: {
    ...FONTS.body3,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  input: {
    height: 50,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    marginBottom: 16,
    ...FONTS.body3,
  },
  button: {
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...FONTS.h3,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    opacity: 0.5,
  },
  loginText: {
    ...FONTS.body4,
  },
  loginLink: {
    ...FONTS.body4,
    fontWeight: 'bold',
  },
});