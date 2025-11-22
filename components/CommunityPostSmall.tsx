// components/CommunityPostSmall.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, FONTS, SIZES } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityPostSmall({ post, onPress }: { post: any, onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.card, marginLeft: SIZES.padding }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{post.username.charAt(0)}</Text>
        </View>
        <Text style={[styles.username, { color: colors.text }]}>{post.username}</Text>
      </View>
      <Text style={[styles.content, { color: colors.subtext }]} numberOfLines={3}>
        {post.content}
      </Text>
      <View style={styles.footer}>
        <Ionicons name="heart" size={14} color={colors.error} />
        <Text style={[styles.likes, { color: colors.subtext }]}>{post.like_count} likes</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 180,
    borderRadius: SIZES.radius * 1.5,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    ...FONTS.body4,
    fontWeight: 'bold',
  },
  username: {
    ...FONTS.body4,
    fontWeight: 'bold',
  },
  content: {
    ...FONTS.body4,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likes: {
    ...FONTS.body4,
    fontSize: 12,
    marginLeft: 4,
  },
});