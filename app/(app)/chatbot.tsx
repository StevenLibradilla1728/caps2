// app/(app)/chatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../constants/Config';

interface Message { id: string | number; text: string; sender: 'user' | 'bot'; timestamp: Date | string; }
interface PlantKnowledge { plant_id: number; name: string; classification: string; ailment: string; medicinal_uses: string; health_benefits: string; preparation_method: string; cautions: string; }
interface AppGuide { title: string; keywords: string; content: string; }

export default function ChatbotScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isGuest, user, isLoading: isAuthLoading } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(!isGuest);
  const [plantKnowledge, setPlantKnowledge] = useState<PlantKnowledge[]>([]);
  const [appGuides, setAppGuides] = useState<AppGuide[]>([]);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! I'm Lunas AI. 🌱\n\nI'm connected to our live database of 50 herbal plants.\n\nYou can ask me things like:\n\n• \"Tell me everything about Lagundi\"\n• \"How do I prepare Banaba tea?\"\n• \"Is Oregano safe for everyone?\"\n• \"What is good for a cough?\"",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    fetchAllKnowledge();
    if (isAuthLoading) return; 
    if (isGuest || !user?.id) {
      setIsLoadingHistory(false);
    } else {
      fetchHistory();
    }
  }, [isGuest, user, isAuthLoading]);

  const fetchAllKnowledge = async () => {
    try {
      const [plantsRes, guidesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/get_all_plants.php`),
        fetch(`${API_BASE_URL}/get_app_guides.php`)
      ]);
      const plantsData = await plantsRes.json();
      const guidesData = await guidesRes.json();
      if (Array.isArray(plantsData)) setPlantKnowledge(plantsData);
      if (Array.isArray(guidesData)) setAppGuides(guidesData);
    } catch (error) { console.error("Failed to load bot knowledge:", error); } 
    finally { setIsKnowledgeLoading(false); }
  };

  const fetchHistory = async () => {
    if (!user?.id) { setIsLoadingHistory(false); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/chat.php?user_id=${user.id}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const formattedHistory: Message[] = data.map((msg: any) => ({
          id: msg.id, text: msg.text, sender: msg.sender, timestamp: new Date(msg.timestamp)
        }));
        setMessages([{ id: 'welcome', text: "Welcome back! I remember where we left off.", sender: 'bot', timestamp: new Date() }, ...formattedHistory]);
      }
    } catch (error) { console.error("Failed to load history:", error); } 
    finally { setIsLoadingHistory(false); }
  };

  // --- AI LOGIC ---
  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    for (const guide of appGuides) {
      const keywords = guide.keywords.split(',').map(k => k.trim());
      if (lowerQuery.includes('how') && keywords.some(k => lowerQuery.includes(k))) return guide.content;
       if (keywords.some(k => lowerQuery.includes(k) && k.length > 4)) return guide.content;
    }
    for (const plant of plantKnowledge) {
        const searchTerms = [plant.name.toLowerCase(), ...plant.name.toLowerCase().replace(/[()]/g, '').split(' ').filter(t => t.length > 3)];
        if (searchTerms.some(term => lowerQuery.includes(term))) {
           if (lowerQuery.includes('prepare') || lowerQuery.includes('tea') || lowerQuery.includes('cook') || lowerQuery.includes('boil') || lowerQuery.includes('make')) return ` **How to Prepare ${plant.name}**\n\n${plant.preparation_method}\n\n*Tip: Always use clean, well-washed plant parts.*`;
           if (lowerQuery.includes('caution') || lowerQuery.includes('safe') || lowerQuery.includes('warning') || lowerQuery.includes('pregnant')) return ` **Safety Information for ${plant.name}**\n\n${plant.cautions || 'Generally considered safe.'}`;
           if (lowerQuery.includes('benefit') || lowerQuery.includes('good for') || lowerQuery.includes('use')) return ` **Benefits of ${plant.name}**\n\nBest for: **${plant.ailment}**\nMedicinal Properties:\n${plant.medicinal_uses}`;
           return ` **${plant.name}** (*${plant.classification}*)\n\n **Best for:** ${plant.ailment}\n **Uses:** ${plant.medicinal_uses}\n **Prep:** ${plant.preparation_method}\n **Caution:** ${plant.cautions || 'Generally safe.'}`;
        }
    }
    const ailmentMatches = plantKnowledge.filter(p => p.ailment && p.ailment.toLowerCase().includes(lowerQuery) && lowerQuery.length > 3);
    if (ailmentMatches.length > 0) {
        const names = ailmentMatches.slice(0, 5).map(p => `• **${p.name}** (for ${p.ailment})`).join('\n');
        return `I found several plants that might help with that:\n\n${names}\n\nYou can ask me about any of these for more details!`;
    }
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) return "Hello! What herbal knowledge are you looking for today?";
    if (lowerQuery.includes('thank')) return "You're very welcome! ";
    return "I'm not sure about that yet. Try asking about a specific plant (like 'Lagundi'), an ailment (like 'fever'), or 'how to use' for app help.";
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now().toString(), text: textToSend, sender: 'user', timestamp: new Date() }]);
    if (!isGuest && user?.id) { fetch(`${API_BASE_URL}/chat.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, sender: 'user', text: textToSend }) }).catch(e => console.error(e)); }
    setIsTyping(true);
    setTimeout(() => {
      const responseText = generateResponse(textToSend);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: responseText, sender: 'bot', timestamp: new Date() }]);
      setIsTyping(false);
      if (!isGuest && user?.id) { fetch(`${API_BASE_URL}/chat.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, sender: 'bot', text: responseText }) }).catch(e => console.error(e)); }
    }, 1200);
  };

  // --- KEYBOARD & SCROLL ---
  useEffect(() => {
    const k = Keyboard.addListener('keyboardDidShow', () => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100));
    return () => k.remove();
  }, []);
  useEffect(() => { setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200); }, [messages, isTyping]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const timeString = item.timestamp instanceof Date ? item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble, { backgroundColor: isUser ? colors.primary : colors.card }]}>
        <Text style={[styles.messageText, { color: isUser ? colors.card : colors.text }]}>{item.text.split('**').map((part, index) => index % 2 === 1 ? <Text key={index} style={{fontWeight: 'bold'}}>{part}</Text> : part)}</Text>
        <Text style={[styles.timeText, { color: isUser ? 'rgba(255,255,255,0.7)' : colors.subtext }]}>{timeString}</Text>
      </View>
    );
  };

  if (isAuthLoading || isLoadingHistory || isKnowledgeLoading) {
      return (<SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.primary} /><Text style={{color: colors.subtext, marginTop: 10}}>{isKnowledgeLoading ? "Loading herbal knowledge..." : "Loading session..."}</Text></SafeAreaView>);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerTitle: 'Lunas AI', headerStyle: { backgroundColor: colors.card }, headerTitleStyle: { color: colors.text }, headerLeft: () => (<TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}><Ionicons name="chevron-back" size={24} color={colors.primary} /></TouchableOpacity>), headerShadowVisible: false }}/>
      
    
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
      >
        <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.listContent} maintainVisibleContentPosition={{ minIndexForVisible: 0 }} />
        {isTyping && <View style={[styles.typingContainer, { backgroundColor: colors.background }]}><ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} /><Text style={{ color: colors.subtext, fontStyle: 'italic' }}>Lunas AI is thinking...</Text></View>}
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.background }]}>
          <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text }]} placeholder="Ask about plants..." placeholderTextColor={colors.subtext} value={inputText} onChangeText={setInputText} onSubmitEditing={handleSend} returnKeyType="send" />
          <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }, !inputText.trim() && { opacity: 0.5 }]} onPress={handleSend} disabled={!inputText.trim()}><Ionicons name="arrow-up" size={24} color={colors.card} /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 40 },
  listContent: { padding: SIZES.padding, paddingBottom: 20 },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 20, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { ...FONTS.body3, lineHeight: 22 },
  timeText: { fontSize: 10, alignSelf: 'flex-end', marginTop: 6 },
  typingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.padding + 10, paddingBottom: 12 },
  inputContainer: { flexDirection: 'row', padding: 12, alignItems: 'center', borderTopWidth: 1, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  input: { flex: 1, height: 50, borderRadius: 25, paddingHorizontal: 20, marginRight: 12, ...FONTS.body3 },
  sendButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
});