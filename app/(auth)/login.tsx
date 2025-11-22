// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { API_BASE_URL } from '../../constants/Config';

export default function LoginScreen() {
  const { signIn, signInAsGuest } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long.');
        return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        await signIn(data.user); 
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (e: any) {
      console.error("Login Error:", e);
      Alert.alert('Connection Error', 'Could not connect to server.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGuestLogin = () => { signInAsGuest(); };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Welcome Back!</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>Sign in to continue your journey</Text>
      <View style={styles.form}>
        <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.background, borderWidth: 1 }]} placeholder="Email" placeholderTextColor={colors.subtext} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <View>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.background, borderWidth: 1 }]} placeholder="Password" placeholderTextColor={colors.subtext} value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={styles.forgotPassButton} onPress={() => Alert.alert('Coming Soon')}><Text style={[styles.forgotPassText, { color: colors.primary }]}>Forgot password?</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={colors.card} /> : <Text style={[styles.buttonText, { color: colors.card }]}>Login</Text>}
        </TouchableOpacity>
      </View>
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: colors.subtext, opacity: 0.2 }]} /><Text style={[styles.dividerText, { color: colors.subtext }]}>OR</Text><View style={[styles.divider, { backgroundColor: colors.subtext, opacity: 0.2 }]} />
      </View>
      <TouchableOpacity style={[styles.altButton, { borderColor: colors.subtext, backgroundColor: colors.card }]} onPress={() => Alert.alert('Coming Soon')}><FontAwesome name="google" size={20} color={colors.text} style={styles.icon} /><Text style={[styles.altButtonText, { color: colors.text }]}>Continue with Google</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.altButton, { borderColor: colors.subtext, backgroundColor: colors.card }]} onPress={handleGuestLogin}><FontAwesome name="user-secret" size={20} color={colors.subtext} style={styles.icon} /><Text style={[styles.altButtonText, { color: colors.subtext }]}>Continue as Guest</Text></TouchableOpacity>
      <View style={styles.signupContainer}><Text style={[styles.signupText, { color: colors.subtext }]}>Don't have an account? </Text><Link href="/(auth)/signup" asChild><TouchableOpacity><Text style={[styles.signupLink, { color: colors.primary }]}>Create an account</Text></TouchableOpacity></Link></View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 24, justifyContent: 'center' }, title: { ...FONTS.h1, textAlign: 'center', marginBottom: 10 }, subtitle: { ...FONTS.body3, textAlign: 'center', marginBottom: 40 }, form: { width: '100%' }, input: { height: 50, borderRadius: SIZES.radius, paddingHorizontal: 16, marginBottom: 16, ...FONTS.body3 }, forgotPassButton: { alignSelf: 'flex-end', marginTop: -10, marginBottom: 15 }, forgotPassText: { ...FONTS.body4 }, button: { paddingVertical: 16, borderRadius: SIZES.radius, alignItems: 'center', marginTop: 10, height: 55, justifyContent: 'center' }, buttonText: { ...FONTS.h3, fontWeight: 'bold' }, dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 }, divider: { flex: 1, height: 1 }, dividerText: { ...FONTS.body4, marginHorizontal: 10 }, altButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: SIZES.radius, borderWidth: 1, marginBottom: 16 }, icon: { marginRight: 12 }, altButtonText: { ...FONTS.h3, fontWeight: '600' }, signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }, signupText: { ...FONTS.body4 }, signupLink: { ...FONTS.body4, fontWeight: 'bold' } });