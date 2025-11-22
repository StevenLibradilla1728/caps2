// app/(app)/editProfile.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../constants/Config';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isGuest, user, guestProfile, updateGuestProfile, signIn } = useAuth(); 

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) {
      setName(guestProfile.user_info.username);
    } else if (user) {
      setName(user.username);
      // @ts-ignore
      setBio(user.bio || '');
      // @ts-ignore
      if (user.profile_pic) setProfilePic(getFullUrl(user.profile_pic));
      // @ts-ignore
      if (user.cover_photo) setCoverPhoto(getFullUrl(user.cover_photo));
    }
  }, [isGuest, user]);

  const getFullUrl = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith('http') || path.startsWith('file')) return path;
      return `${API_BASE_URL.replace(/\/api\/?$/, '')}/${path}`;
  };

  const handlePickImage = async (type: 'profile' | 'cover') => {
    // FIX: Reverted to MediaTypeOptions.Images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      if (type === 'profile') setProfilePic(result.assets[0].uri);
      else setCoverPhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (isGuest) {
      updateGuestProfile({ username: name });
      Alert.alert("Success", "Profile updated temporarily.");
      router.back();
    } else {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('user_id', user?.id || '0');
        formData.append('username', name);
        formData.append('bio', bio);

        if (profilePic && profilePic.startsWith('file://')) {
            const filename = profilePic.split('/').pop() || 'pfp.jpg';
            // @ts-ignore
            formData.append('profile_pic', { uri: profilePic, name: filename, type: 'image/jpeg' });
        }
        if (coverPhoto && coverPhoto.startsWith('file://')) {
            const filename = coverPhoto.split('/').pop() || 'cover.jpg';
            // @ts-ignore
            formData.append('cover_photo', { uri: coverPhoto, name: filename, type: 'image/jpeg' });
        }

        const response = await fetch(`${API_BASE_URL}/update_profile.php`, {
            method: 'POST',
            body: formData,
        });
        
        const text = await response.text();
        try {
             const data = JSON.parse(text);
             if (data.success) {
                await signIn(data.user);
                Alert.alert("Success", "Profile updated successfully!");
                router.back();
            } else {
                Alert.alert("Update Failed", data.error || "Unknown error occurred.");
            }
        } catch (e) {
            console.error("Invalid Server Response:", text);
            Alert.alert("Server Error", "Check if 'uploads/profiles' folder exists on your PC.");
        }

      } catch (error) {
          console.error("Profile Update Error:", error);
          Alert.alert("Error", "Could not connect to server.");
      } finally {
          setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerTitle: 'Edit Profile',
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: colors.primary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color={colors.primary} /> : 
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Save</Text>}
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.coverContainer} onPress={() => handlePickImage('cover')}>
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={40} color={colors.card} opacity={0.5} />
            </View>
          )}
          <View style={styles.editIconBadge}>
            <Ionicons name="camera" size={14} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.profilePicWrapper}>
            <TouchableOpacity onPress={() => handlePickImage('profile')}>
            {profilePic ? (
                <Image source={{ uri: profilePic }} style={[styles.profilePic, { borderColor: colors.card }]} />
            ) : (
                <View style={[styles.profilePlaceholder, { backgroundColor: colors.subtext, borderColor: colors.card }]}>
                     <Text style={{fontSize: 40, color: colors.card}}>{name.charAt(0).toUpperCase()}</Text>
                </View>
            )}
             <View style={styles.editIconBadgeProfile}>
                <Ionicons name="camera" size={12} color="white" />
            </View>
            </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
            <Text style={[styles.label, { color: colors.subtext }]}>Display Name</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.background }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.subtext}
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Bio</Text>
            <TextInput
                style={[styles.bioInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.background }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Share something about yourself..."
                placeholderTextColor={colors.subtext}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />
            
            {isGuest && (
                <Text style={{ color: colors.subtext, fontStyle: 'italic', marginTop: 20, textAlign: 'center' }}>
                    Note: Guest profile changes are temporary and will be lost upon exit.
                </Text>
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  profilePicWrapper: {
    alignItems: 'center',
    marginTop: -50, 
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 15,
  },
  editIconBadgeProfile: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2E7D32',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  formContainer: {
      padding: SIZES.padding,
  },
  label: {
      ...FONTS.body4,
      marginBottom: 8,
      marginLeft: 4,
  },
  input: {
      ...FONTS.body3,
      padding: 12,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      marginBottom: 20,
  },
  bioInput: {
      ...FONTS.body3,
      padding: 12,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      minHeight: 100,
  },
});