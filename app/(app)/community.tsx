// app/(app)/community.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
  Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Share, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../constants/Config';
import { useRouter } from 'expo-router';

interface CommunityPost {
  post_id: number; user_id: number; username: string; profile_pic: string | null;
  content: string; images: string[]; created_at: string; like_count: number; is_liked_by_me: boolean;
}

export default function CommunityScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, isGuest, isLoading: isAuthLoading } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const userId = user?.id || 0;
      const response = await fetch(`${API_BASE_URL}/community.php?user_id=${userId}`);
      const data = await response.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (error) { console.error("Fetch error:", error); } 
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const goToProfile = (userId: number | string) => {
      if (!userId || userId.toString() === '0') return;
      router.push({ pathname: "/(app)/userProfile", params: { userId: userId.toString() }});
  };

  const handlePickImages = async () => {
    if (editingPostId) { Alert.alert("Info", "Editing images is not supported yet."); return; }
    
    // Using the safest MediaType option
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImages(result.assets.map(asset => asset.uri));
    }
  };

  const handleSubmit = async () => {
    if (isGuest) { Alert.alert("Guest Mode", "Log in to post."); return; }
    if (!user?.id) { Alert.alert("Error", "User not fully loaded. Please wait."); return; }
    if (!postContent.trim() && selectedImages.length === 0) { Alert.alert("Empty", "Please write text or add an image."); return; }
    
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append('user_id', user.id.toString());
      formData.append('username', user.username || 'User'); 
      formData.append('content', postContent);

      if (editingPostId) {
          formData.append('action', 'edit_post');
          formData.append('post_id', editingPostId.toString());
      } else {
          // --- ROBUST IMAGE PACKAGING ---
          selectedImages.forEach((uri, index) => {
            const filename = uri.split('/').pop() || `upload_${Date.now()}_${index}.jpg`;
            // Infer type or default to jpeg
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            
            const fileObj = {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: filename,
                type: type
            };

            // @ts-ignore
            formData.append('post_images[]', fileObj);
          });
      }

      console.log("Sending Post...", formData);

      const response = await fetch(`${API_BASE_URL}/community.php`, {
          method: 'POST',
          body: formData,
          headers: {
              'Accept': 'application/json',
              // 'Content-Type': 'multipart/form-data', // DO NOT set this manually, fetch does it with boundary
          },
      });
      
      const text = await response.text(); 
      console.log("Server Response:", text);

      try {
          const result = JSON.parse(text);
          if (result.success) { 
              resetInput(); 
              fetchPosts(); 
              Alert.alert("Success", "Post published!");
          } else { 
              Alert.alert("Failed", result.error || "Server returned an error."); 
          }
      } catch (e) {
          console.error("JSON Parse Error:", text);
          Alert.alert("Server Error", "The server response was invalid. Check PHP logs.");
      }
    } catch (e: any) { 
        console.error("Network Error:", e);
        Alert.alert("Network Error", e.message || "Connection failed."); 
    } finally { 
        setIsPosting(false); 
    }
  };

  const resetInput = () => { setPostContent(''); setSelectedImages([]); setEditingPostId(null); };

  const handlePostOptions = (post: CommunityPost) => {
      Alert.alert("Post Options", "Choose action", [
          { text: "Cancel", style: "cancel" },
          { text: "Edit", onPress: () => { setPostContent(post.content); setEditingPostId(post.post_id); setSelectedImages([]); } },
          { text: "Delete", style: "destructive", onPress: () => confirmDelete(post.post_id) }
      ]);
  };

  const confirmDelete = async (postId: number) => {
      try {
        const fd = new FormData(); fd.append('action','delete_post'); fd.append('post_id',postId.toString()); fd.append('user_id',user?.id||'0');
        await fetch(`${API_BASE_URL}/community.php`,{method:'POST',body:fd});
        fetchPosts();
      } catch(e) {}
  };

  const handleLike = async (post: CommunityPost) => {
    if (isGuest) return;
    const wasLiked = post.is_liked_by_me;
    setPosts(current => current.map(p => p.post_id === post.post_id ? { ...p, is_liked_by_me: !wasLiked, like_count: p.like_count + (wasLiked ? -1 : 1) } : p));
    try { const fd=new FormData(); fd.append('action','toggle_like'); fd.append('user_id',user?.id||'0'); fd.append('post_id',post.post_id.toString()); await fetch(`${API_BASE_URL}/community.php`, {method:'POST', body:fd}); } catch(e) {}
  };

  const handleShare = async (post: CommunityPost) => { try { await Share.share({ message: `${post.username}: "${post.content}"` }); } catch (e) {} };
  const getFullUrl = (path: string | null) => path ? (path.startsWith('http') ? path : `${API_BASE_URL.replace(/\/api\/?$/, '')}/${path.replace(/^\//, '')}`) : null;

  const renderImageGrid = (images: string[]) => {
      if (!images || images.length === 0) return null;
      const count = images.length;
      return (
          <View style={styles.imageGrid}>
              {images.slice(0, 4).map((img, index) => {
                  let width = '100%', height = 300;
                  if (count === 2) { width = '49.5%'; height = 250; }
                  if (count >= 3 && index === 0) { width = '100%'; height = 200; }
                  if (count === 3 && index > 0) { width = '49.5%'; height = 150; }
                  if (count >= 4) { width = '49.5%'; height = 150; }
                  return (<View key={index} style={[{width, height}, styles.gridImageContainer]}><Image source={{uri: getFullUrl(img)||''}} style={styles.gridImage} resizeMode="contain"/></View>);
              })}
          </View>
      );
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const profilePicUrl = getFullUrl(item.profile_pic);
    const isOwner = user?.id && item.user_id && user.id.toString() === item.user_id.toString();
    return (
      <View style={[styles.postCard, { backgroundColor: colors.card }]}>
        <View style={[styles.postHeader, { zIndex: 1 }]}>
          <TouchableOpacity onPress={() => goToProfile(item.user_id)} activeOpacity={0.5} style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              {profilePicUrl ? (<Image source={{ uri: profilePicUrl }} style={styles.avatarImage} />) : (<View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={[styles.avatarText, { color: colors.card }]}>{item.username.charAt(0).toUpperCase()}</Text></View>)}
              <View>
                <Text style={[styles.postUsername, { color: colors.text }]}>{item.username}</Text>
                <Text style={[styles.postDate, { color: colors.subtext }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
          </TouchableOpacity>
          {isOwner && (<TouchableOpacity onPress={() => handlePostOptions(item)} style={styles.optionsButton}><Ionicons name="ellipsis-horizontal" size={20} color={colors.subtext} /></TouchableOpacity>)}
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}>
            <FlatList data={posts} renderItem={renderPost} keyExtractor={item => item.post_id.toString()} contentContainerStyle={styles.listContent} refreshing={isLoading} onRefresh={fetchPosts} />
            {!isAuthLoading && !isGuest && user && (
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.background }]}>
                    {editingPostId && (<View style={styles.editBanner}><Text style={{color: colors.primary, fontSize: 12}}>Editing Post...</Text><TouchableOpacity onPress={resetInput}><Ionicons name="close-circle" size={20} color={colors.subtext}/></TouchableOpacity></View>)}
                    {selectedImages.length > 0 && (<ScrollView horizontal style={styles.previewScroll}>{selectedImages.map((uri, index) => (<Image key={index} source={{ uri }} style={styles.previewImageSmall} />))}<TouchableOpacity style={[styles.clearImagesButton, {backgroundColor: colors.error}]} onPress={() => setSelectedImages([])}><Ionicons name="trash" size={14} color="white"/></TouchableOpacity></ScrollView>)}
                    <View style={styles.inputRow}>
                        <TouchableOpacity onPress={() => goToProfile(user.id)} style={{ marginRight: 8, marginBottom: 2 }}><Ionicons name="person-circle" size={32} color={colors.primary} /></TouchableOpacity>
                        <TouchableOpacity onPress={handlePickImages} style={styles.iconButton} disabled={!!editingPostId}><Ionicons name="images-outline" size={26} color={editingPostId ? colors.subtext : colors.primary} /></TouchableOpacity>
                        <TextInput style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]} placeholder={editingPostId ? "Update..." : `What's on your mind?`} placeholderTextColor={colors.subtext} value={postContent} onChangeText={setPostContent} multiline editable={!isPosting} />
                        <TouchableOpacity onPress={handleSubmit} style={[styles.sendButton, { backgroundColor: colors.primary }, (!postContent.trim() && selectedImages.length === 0) && {opacity: 0.5}]} disabled={( !postContent.trim() && selectedImages.length === 0 ) || isPosting}>{isPosting ? <ActivityIndicator size="small" color={colors.card} /> : <Ionicons name={editingPostId ? "checkmark" : "send"} size={20} color={colors.card} />}</TouchableOpacity>
                    </View>
                </View>
            )}
             {isGuest && (<View style={[styles.guestBanner, { backgroundColor: colors.card, borderTopColor: colors.background }]}><Text style={{color: colors.subtext}}>Log in to join the conversation.</Text></View>)}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 40 }, listContent: { padding: SIZES.padding },
  postCard: { borderRadius: SIZES.radius, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarText: { ...FONTS.h3, fontWeight: 'bold' },
  postUsername: { ...FONTS.h3, fontWeight: '600' }, postDate: { ...FONTS.body4, fontSize: 12 },
  postContent: { ...FONTS.body3, paddingHorizontal: 12, marginBottom: 12, lineHeight: 22 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8, backgroundColor: '#000' },
  gridImageContainer: { marginBottom: 2, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  gridImage: { width: '100%', height: '100%' },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  actionText: { marginLeft: 6, ...FONTS.body4, fontWeight: '600' },
  inputContainer: { padding: 12, borderTopWidth: 1, elevation: 10 },
  guestBanner: { padding: 16, borderTopWidth: 1, alignItems: 'center', justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
  inputAvatar: { width: 32, height: 32, borderRadius: 16, marginBottom: 6 },
  textInput: { flex: 1, minHeight: 40, maxHeight: 100, borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, marginHorizontal: 8, ...FONTS.body3 },
  iconButton: { padding: 6, marginBottom: 2, marginRight: 4 },
  sendButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  previewScroll: { flexDirection: 'row', marginBottom: 10, paddingLeft: 44 },
  previewImageSmall: { width: 60, height: 60, borderRadius: 8, marginRight: 8 },
  clearImagesButton: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: -12, marginTop: -8 },
  editBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, paddingLeft: 50 },
  optionsButton: { padding: 8 },
});