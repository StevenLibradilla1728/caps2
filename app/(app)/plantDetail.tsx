// app/(app)/plantDetail.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
  ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform, FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import { GUEST_PLANT_MAP, SavedPlant } from '../../constants/StaticData';
import { API_BASE_URL } from '../../constants/Config';

// --- IMAGE URL HELPER ---
const getFullUrl = (path: string | null) => {
    if (!path) return 'https://placehold.co/400x300/eeeeee/aaaaaa?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}/${path.replace(/^\//, '')}`;
};

export default function PlantDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const { isGuest, user, guestGarden, addPlantToGuestGarden, updateGuestPlant } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [plant, setPlant] = useState<SavedPlant | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // ... (MOCK_GALLERY and MOCK_SIMILAR_PLANTS are fine as placeholders)
  const MOCK_GALLERY = [getFullUrl(null), getFullUrl(null), getFullUrl(null)];
  const MOCK_SIMILAR_PLANTS = [GUEST_PLANT_MAP.get(2), GUEST_PLANT_MAP.get(5)];

  useEffect(() => {
    if (id) {
        fetchPlantDetails();
        recordViewHistory();
    }
  }, [id, guestGarden]);

  const recordViewHistory = async () => {
    if (isGuest || !user?.id) return; 
    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('plant_id', id.toString());
      fetch(`${API_BASE_URL}/record_view.php`, { method: 'POST', body: formData });
    } catch (error) { console.error("Failed to record view:", error); }
  };

  const fetchPlantDetails = async () => {
    setIsLoading(true);
    const plantId = Number(id);
    if (isGuest) {
      const guestPlant = GUEST_PLANT_MAP.get(plantId);
      if (guestPlant) {
        setPlant(guestPlant);
        const savedEntry = guestGarden.find(p => p.plant_id === plantId);
        if (savedEntry) { setIsSaved(true); setIsFavorite(savedEntry.is_favorite); setNotes(savedEntry.personal_notes || ''); } 
        else { setIsSaved(false); setIsFavorite(false); setNotes(''); }
      }
      setIsLoading(false);
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/get_plant_details.php?plant_id=${id}&user_id=${user?.id || 0}`);
        const data = await response.json();
        if (data.details) {
          setPlant(data.details);
          setIsSaved(data.user_garden_status.is_saved);
          setIsFavorite(data.user_garden_status.is_favorite);
          setNotes(data.user_garden_status.personal_notes || '');
        }
      } catch (error) { console.error(error); } 
      finally { setIsLoading(false); }
    }
  };

  const sendGardenUpdate = async (field: string, value: any) => {
    if (isGuest && plant) {
      let plantInGarden = guestGarden.find(p => p.plant_id === plant.plant_id);
      if (!plantInGarden) {
         plantInGarden = { ...plant, is_saved: true, is_favorite: field === 'is_favorite' ? value : false, personal_notes: field === 'notes' ? value : '' };
         addPlantToGuestGarden(plantInGarden);
      } else {
         const updatedPlant = { ...plantInGarden, [field === 'notes' ? 'personal_notes' : field]: value };
         if (field === 'is_favorite') updatedPlant.is_favorite = value;
         updateGuestPlant(updatedPlant);
      }
      return;
    }
    const formData = new FormData();
    formData.append('user_id', (user?.id || 0).toString());
    formData.append('plant_id', id as string);
    formData.append(field, value.toString());
    if (field !== 'is_saved') formData.append('is_saved', '1'); 
    try { await fetch(`${API_BASE_URL}/manage_garden_entry.php`, { method: 'POST', body: formData }); } 
    catch (error) { console.error(error); }
  };

  const handleToggleFavorite = () => { const newFavState = !isFavorite; setIsFavorite(newFavState); if (!isSaved) setIsSaved(true); sendGardenUpdate('is_favorite', newFavState); };
  const handleSaveNotes = () => { sendGardenUpdate('notes', notes); setIsEditingNotes(false); if(!isSaved) setIsSaved(true); };
  const handleSavePress = () => { if (isSaved) { router.push('/(tabs)/garden'); } else { setIsSaved(true); sendGardenUpdate('is_saved', '1'); } };

  if (isLoading || !plant) {
    return (<SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></SafeAreaView>);
  }

  const InfoRow = ({ label, value }: { label: string, value?: string }) => (
    value ? (<View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.primary }]}>{label}</Text><Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text></View>) : null
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerTitle: plant.name, headerShown: true, headerTransparent: true, headerLeft: () => (<TouchableOpacity onPress={() => router.back()} style={styles.headerButton}><Ionicons name="chevron-back" size={24} color={colors.card} /></TouchableOpacity>), headerRight: () => (<TouchableOpacity onPress={handleToggleFavorite} style={styles.headerButton}><Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? colors.error : colors.card} /></TouchableOpacity>), }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView>
          <Image source={{ uri: getFullUrl(plant.image_url) }} style={styles.plantImage} />
          <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.plantName, { color: colors.text }]}>{plant.name}</Text>
            <Text style={[styles.plantClass, { color: colors.subtext }]}>{plant.classification}</Text>
            <TouchableOpacity style={[styles.aiButton, { backgroundColor: colors.secondary }]} onPress={() => router.push('/(app)/chatbot')}><Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} /><Text style={[styles.aiButtonText, { color: colors.primary }]}>Ask Lunas AI</Text></TouchableOpacity>
            <View style={styles.infoGrid}><InfoChip icon="sunny" title="Sunlight" value="Full Sun" /><InfoChip icon="water" title="Water" value="Dry" /><InfoChip icon="thermometer" title="Temp" value="Warm" /></View>
            <View><Text style={[styles.sectionTitle, { color: colors.text }]}>Photo Gallery</Text><FlatList horizontal showsHorizontalScrollIndicator={false} data={MOCK_GALLERY} keyExtractor={(item) => item} renderItem={({item}) => (<Image source={{ uri: item }} style={styles.galleryImage} />)} contentContainerStyle={{ paddingLeft: SIZES.padding }} /></View>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.error, borderWidth: 1, marginTop: 20 }]}><Text style={[styles.infoLabel, { color: colors.error }]}>Disclaimer</Text><Text style={[styles.infoValue, { color: colors.subtext }]}>Information is for educational purposes only. Always consult a healthcare professional.</Text></View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Information</Text><View style={[styles.card, { backgroundColor: colors.card }]}><InfoRow label="Medicinal Uses" value={plant.medicinal_uses} /><InfoRow label="Ailment" value={plant.ailment} /><InfoRow label="Health Benefits" value={plant.health_benefits} /></View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Use</Text><View style={[styles.card, { backgroundColor: colors.card }]}><InfoRow label="Preparation Method" value={plant.preparation_method} /><InfoRow label="Cautions" value={plant.cautions} /></View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cultivation</Text><View style={[styles.card, { backgroundColor: colors.card }]}><InfoRow label="Care Guide" value={plant.care_guide} /></View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Notes</Text><View style={[styles.card, { backgroundColor: colors.card }]}><View style={styles.notesHeader}><Text style={[styles.infoLabel, { color: colors.primary, marginBottom: 0 }]}>My Notes</Text>{!isEditingNotes && (<TouchableOpacity onPress={() => setIsEditingNotes(true)}><Text style={[styles.editButton, { color: colors.primary }]}>Edit</Text></TouchableOpacity>)}</View>{isEditingNotes ? (<TextInput style={[styles.notesInput, { color: colors.text, borderColor: colors.subtext, backgroundColor: colors.background }]} value={notes} onChangeText={setNotes} placeholder="Add notes..." placeholderTextColor={colors.subtext} multiline autoFocus />) : (<Text style={[styles.notesText, { color: notes ? colors.text : colors.subtext }]}>{notes || "No notes yet."}</Text>)}{isEditingNotes && (<TouchableOpacity style={[styles.saveNotesButton, { backgroundColor: colors.secondary }]} onPress={handleSaveNotes}><Text style={[styles.saveButtonText, { color: colors.primary }]}>Save Notes</Text></TouchableOpacity>)}</View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Similar Plants</Text><FlatList horizontal showsHorizontalScrollIndicator={false} data={MOCK_SIMILAR_PLANTS} keyExtractor={(item) => item!.plant_id.toString()} renderItem={({item}) => (<TouchableOpacity style={[styles.similarCard, { backgroundColor: colors.card }]} onPress={() => router.replace(`/(app)/plantDetail?id=${item!.plant_id}`)}><Image source={{ uri: getFullUrl(item!.image_url) }} style={styles.similarImage} /><Text style={[styles.similarText, { color: colors.text }]} numberOfLines={1}>{item!.name}</Text></TouchableOpacity>)} contentContainerStyle={{ paddingLeft: SIZES.padding }} />
          </View>
        </ScrollView>
        <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.background }]}><TouchableOpacity style={[styles.saveButton, { backgroundColor: isSaved ? colors.subtext : colors.primary }]} onPress={handleSavePress}><Ionicons name={isSaved ? "checkmark" : "add"} size={20} color={colors.card} /><Text style={[styles.saveButtonText, { color: colors.card }]}>{isSaved ? "Saved to Garden" : "Add to Garden"}</Text></TouchableOpacity></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InfoChip = ({icon, title, value}) => { const { colors } = useTheme(); return (<View style={[styles.infoChip, { backgroundColor: colors.card }]}><Ionicons name={icon} size={20} color={colors.primary} /><Text style={[styles.infoChipTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.infoChipValue, { color: colors.subtext }]}>{value}</Text></View>) }
const styles = StyleSheet.create({
  container: { flex: 1 }, loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, headerButton: { backgroundColor: 'rgba(0,0,0,0.4)', padding: 6, borderRadius: 20, marginHorizontal: 10 }, plantImage: { width: '100%', height: 300 }, contentContainer: { paddingTop: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, paddingBottom: 100 }, plantName: { ...FONTS.h1, textAlign: 'center', paddingHorizontal: SIZES.padding }, plantClass: { ...FONTS.body3, textAlign: 'center', marginBottom: 20 }, aiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: SIZES.radius, marginHorizontal: SIZES.padding, marginBottom: 20 }, aiButtonText: { ...FONTS.h4, fontWeight: 'bold', marginLeft: 8 }, infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: SIZES.padding, marginBottom: 10 }, infoChip: { flex: 1, alignItems: 'center', padding: 16, borderRadius: SIZES.radius, margin: 4, elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity: 0.1, shadowRadius: 2 }, infoChipTitle: { ...FONTS.h4, marginTop: 8 }, infoChipValue: { ...FONTS.body4, fontSize: 12, marginTop: 2 }, sectionTitle: { ...FONTS.h2, marginHorizontal: SIZES.padding, marginTop: 20, marginBottom: 10 }, galleryImage: { width: 100, height: 100, borderRadius: SIZES.radius, marginRight: 10 }, card: { borderRadius: SIZES.radius, padding: 16, marginHorizontal: SIZES.padding, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }, infoRow: { marginBottom: 12 }, infoLabel: { ...FONTS.h3, fontWeight: 'bold', marginBottom: 4 }, infoValue: { ...FONTS.body3, lineHeight: 22 }, notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, editButton: { ...FONTS.h3 }, notesInput: { ...FONTS.body3, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderRadius: SIZES.radius / 2, padding: 10 }, notesText: { ...FONTS.body3, fontStyle: 'italic', lineHeight: 22 }, saveNotesButton: { paddingVertical: 10, borderRadius: SIZES.radius, alignItems: 'center', marginTop: 10 }, similarCard: { width: 140, borderRadius: SIZES.radius, marginRight: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }, similarImage: { width: 140, height: 100, borderTopLeftRadius: SIZES.radius, borderTopRightRadius: SIZES.radius }, similarText: { ...FONTS.h4, padding: 8 }, bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SIZES.padding, paddingTop: 10, borderTopWidth: 1, elevation: 10 }, saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: SIZES.radius * 1.5, }, saveButtonText: { ...FONTS.h3, marginLeft: 10, fontWeight: 'bold' },
});
