// app/(app)/userProfile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../constants/Config';

// ... (Time Ago helper) ...
const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60; if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

interface CommunityPost {
  post_id: number; user_id: number; username: string; profile_pic: string | null;
  content: string; images: string[]; created_at: string; like_count: number; is_liked_by_me: boolean;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { user: currentUser, isGuest } = useAuth();

  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
        // 1. Get Profile Info
        const profileRes = await fetch(`${API_BASE_URL}/get_public_profile.php?user_id=${userId}`);
        const profileData = await profileRes.json();
        if (!profileData.error) setUserData(profileData);

        // 2. Get User's Posts (using new filter)
        const myId = currentUser?.id || 0;
        const postsRes = await fetch(`${API_BASE_URL}/community.php?user_id=${myId}&profile_id=${userId}`);
        const postsData = await postsRes.json();
        if (Array.isArray(postsData)) setUserPosts(postsData);

    } catch (error) { console.error("Profile fetch error:", error); } 
    finally { setIsLoading(false); }
  }, [userId, currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- (Helper functions: getFullUrl, handleLike, handleShare, renderImageGrid) ---
  const getFullUrl = (path: string | null) => path ? (path.startsWith('http') ? path : `${API_BASE_URL.replace(/\/api\/?$/, '')}/${path.replace(/^\//, '')}`) : null;
  const handleLike = async (post: CommunityPost) => {
      if (isGuest) { Alert.alert("Guest Mode", "Login to like."); return; }
      const wasLiked = post.is_liked_by_me;
      setUserPosts(current => current.map(p => p.post_id === post.post_id ? { ...p, is_liked_by_me: !wasLiked, like_count: p.like_count + (wasLiked ? -1 : 1) } : p));
      try { const fd=new FormData(); fd.append('action','toggle_like'); fd.append('user_id',currentUser?.id||'0'); fd.append('post_id',post.post_id.toString()); await fetch(`${API_BASE_URL}/community.php`, {method:'POST', body:fd}); } catch(e) {}
  };
  const handleShare = async (post: CommunityPost) => { try { await Share.share({message: `${post.username}: "${post.content}"`}); } catch(e) {} };
  const renderImageGrid = (images: string[]) => {
      if (!images || images.length === 0) return null;
      return (
          <View style={styles.imageGrid}>
              {images.slice(0, 4).map((img, index) => {
                  let width = '100%', height = 300, count = images.length;
                  if (count === 2) { width = '49.5%'; height = 250; }
                  if (count >= 3 && index === 0) { width = '100%'; height = 200; }
                  if (count === 3 && index > 0) { width = '49.5%'; height = 150; }
                  if (count >= 4) { width = '49.5%'; height = 150; }
                  return (<View key={index} style={[{width, height}, styles.gridImageContainer]}><Image source={{uri: getFullUrl(img)||''}} style={styles.gridImage} resizeMode="contain"/></View>);
              })}
          </View>
      );
  };

  const renderHeader = () => {
      if (!userData) return null;
      const isMe = currentUser?.id && userData.user_id.toString() === currentUser.id.toString();
      const coverUrl = getFullUrl(userData.cover_photo);
      const avatarUrl = getFullUrl(userData.profile_pic);

      return (
          <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
              <View style={styles.coverContainer}>
                  {coverUrl ? <Image source={{ uri: coverUrl }} style={styles.coverPhoto} /> : <View style={[styles.coverPhoto, { backgroundColor: colors.primary, opacity: 0.2 }]} />}
              </View>
              <View style={styles.profileInfoContainer}>
                  <View style={[styles.avatarContainer, { backgroundColor: colors.card }]}>
                      {avatarUrl ? (
                          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                      ) : (
                          <View style={[styles.avatar, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                              <Text style={styles.avatarLetter}>{userData.username.charAt(0).toUpperCase()}</Text>
                          </View>
                      )}
                  </View>
                  <Text style={[styles.profileName, { color: colors.text }]}>{userData.username}</Text>
                  {userData.bio ? <Text style={[styles.profileBio, { color: colors.subtext }]}>{userData.bio}</Text> : null}
                  <Text style={[styles.profileJoined, { color: colors.subtext }]}>
                      Joined {new Date(userData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </Text>
                  
                  {isMe && (
                      <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: colors.background }]} onPress={() => router.push('/(app)/editProfile')}>
                          <Ionicons name="pencil" size={16} color={colors.text} />
                          <Text style={[styles.editProfileText, { color: colors.text }]}>Edit Profile</Text>
                      </TouchableOpacity>
                  )}
              </View>
              <View style={[styles.statsBar, { borderTopColor: colors.background }]}>
                    <View style={styles.statsItem}><Text style={[styles.statsValue, {color: colors.text}]}>{userPosts.length}</Text><Text style={[styles.statsLabel, {color: colors.subtext}]}>Posts</Text></View>
                    <View style={styles.statsItem}><Text style={[styles.statsValue, {color: colors.text}]}>0</Text><Text style={[styles.statsLabel, {color: colors.subtext}]}>Followers</Text></View>
                    <View style={styles.statsItem}><Text style={[styles.statsValue, {color: colors.text}]}>0</Text><Text style={[styles.statsLabel, {color: colors.subtext}]}>Following</Text></View>
              </View>
          </View>
      );
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const isOwner = currentUser?.id && item.user_id && currentUser.id.toString() === item.user_id.toString();
    return (
      <View style={[styles.postCard, { backgroundColor: colors.card }]}>
          <View style={styles.postHeaderRow}>
           <View><Text style={[styles.postUsername, { color: colors.text }]}>{item.username} posted:</Text><Text style={[styles.postDate, { color: colors.subtext }]}>{timeAgo(new Date(item.created_at))}</Text></View>
           {isOwner && (<TouchableOpacity onPress={()=>{/* options */}} style={{padding:5}}><Ionicons name="ellipsis-horizontal" size={20} color={colors.subtext} /></TouchableOpacity>)}
          </View>
          <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>
          {renderImageGrid(item.images)}
          <View style={[styles.actionRow, { borderTopColor: colors.background }]}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item)}><Ionicons name={item.is_liked_by_me ? "heart" : "heart-outline"} size={24} color={item.is_liked_by_me ? colors.error : colors.subtext} /><Text style={[styles.actionText, { color: item.is_liked_by_me ? colors.error : colors.subtext }]}>{item.like_count > 0 ? item.like_count : 'Like'}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}><Ionicons name="share-outline" size={24} color={colors.subtext} /><Text style={[styles.actionText, { color: colors.subtext }]}>Share</Text></TouchableOpacity>
          </View>
      </View>
    );
  };

  if (isLoading) {
      return (<View style={[styles.loadingContainer, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerTitle: userData?.username || 'Profile', headerStyle: { backgroundColor: colors.card }, headerTitleStyle: { color: colors.text }, headerTintColor: colors.primary, headerShadowVisible: false }} />
      <FlatList
        data={userPosts}
        renderItem={renderPost}
        keyExtractor={item => item.post_id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => <Text style={{textAlign: 'center', marginTop: 30, color: colors.subtext}}>No posts yet.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { marginBottom: 10, paddingBottom: 0 },
  coverContainer: { height: 150, width: '100%' }, coverPhoto: { width: '100%', height: '100%' },
  profileInfoContainer: { paddingHorizontal: 20, marginTop: -50 },
  avatarContainer: { padding: 4, borderRadius: 54, alignSelf: 'flex-start', },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4 },
  avatarLetter: {fontSize: 40, color: 'white', fontWeight: 'bold'},
  profileName: { ...FONTS.h1, fontSize: 26, fontWeight: 'bold', marginTop: 10 }, 
  profileBio: { ...FONTS.body3, marginTop: 4, lineHeight: 20 },
  profileJoined: { ...FONTS.body4, color: '#999', marginTop: 4 },
  editProfileButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, marginTop: 15 },
  editProfileText: { ...FONTS.h4, fontWeight: '600', marginLeft: 8 },
  statsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, marginTop: 15 },
  statsItem: { alignItems: 'center' },
  statsValue: { ...FONTS.h3, fontWeight: 'bold' },
  statsLabel: { ...FONTS.body4, color: '#999' },
  postCard: { marginBottom: 10, paddingVertical: 12 },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 10, justifyContent: 'space-between' },
  postAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  postUsername: { ...FONTS.h3, fontWeight: '600' }, postDate: { ...FONTS.body4, fontSize: 12 },
  postContent: { ...FONTS.body3, paddingHorizontal: 12, marginBottom: 10, lineHeight: 22 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', backgroundColor: '#000', marginTop: 5 },
  gridImageContainer: { marginBottom: 2, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  gridImage: { width: '100%', height: '100%' },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, marginTop: 10, paddingTop: 8, paddingHorizontal: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 24, padding: 4 },
  actionText: { marginLeft: 6, ...FONTS.body4, fontWeight: '600' },
});