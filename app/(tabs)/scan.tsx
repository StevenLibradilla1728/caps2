// app/(tabs)/scan.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, FlatList, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, FONTS, SIZES } from '../../constants/Theme';
import { useAuth } from '../../hooks/useAuth';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { API_BASE_URL } from '../../constants/Config';
import ScanInstructionCard from '../../components/ScanInstructionCard';

const { width } = Dimensions.get('window');
const INSTRUCTIONS = [
  { id: '1', icon: 'leaf-outline', title: 'Capture the Leaf', text: 'Ensure the leaf is flat and in sharp focus.' },
  { id: '2', icon: 'flower-outline', title: 'Get the Flower', text: 'If possible, include the flower for better accuracy.' },
  { id: '3', icon: 'ellipse-outline', title: 'Avoid Shadows', text: 'Scan in bright, even light for the best results.' },
];

const ScanAnimation = ({ isScanning }: { isScanning: boolean }) => {
  const { colors } = useTheme();
  const scanLinePosition = useSharedValue(-10);
  React.useEffect(() => {
    if (isScanning) {
      scanLinePosition.value = withRepeat(withTiming(260, { duration: 2500, easing: Easing.inOut(Easing.ease) }), -1, true);
    }
  }, [isScanning]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scanLinePosition.value }] }));
  if (!isScanning) return null;
  return <Animated.View style={[styles.scanLine, { backgroundColor: colors.primary }, animatedStyle]} />;
};

export default function ScanScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isGuest, user } = useAuth(); 
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [scanResult, setScanResult] = useState<any>(null); 
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!isGuest && user) fetchScanHistory();
  }, [isGuest, user]));

  const fetchScanHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_scan_history.php?user_id=${user?.id}`);
      const data = await response.json();
      if (Array.isArray(data)) setScanHistory(data);
    } catch (e) { console.error(e); }
  };

  const startScan = async (type: 'camera' | 'gallery') => {
    const { status } = type === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied'); return; }

    const result = type === 'camera' 
        ? await ImagePicker.launchCameraAsync({ quality: 0.7, aspect: [1, 1], allowsEditing: true })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, aspect: [1, 1], allowsEditing: true });

    if (!result.canceled) handleImageUpload(result.assets[0].uri);
  };

  const handleImageUpload = async (imageUri: string) => {
    setIsScanning(true);
    if (isGuest) {
      setTimeout(() => { 
        setIsScanning(false); 
        setScanResult({ plant_name: 'Lagundi (Demo)', accuracy: 0.95, plant_id: 1 }); 
        setModalVisible(true); 
      }, 2500);
      return;
    }
    
    const formData = new FormData();
    // @ts-ignore
    formData.append('plant_image', { uri: imageUri, name: 'scan.jpg', type: 'image/jpeg' });
    formData.append('user_id', (user?.id || 0).toString());
    
    try {
      const response = await fetch(`${API_BASE_URL}/plant_identification_api.php`, { method: 'POST', body: formData });
      const data = await response.json();
      if (data.success) {
        setScanResult(data);
        setModalVisible(true);
        fetchScanHistory();
      } else { Alert.alert('Failed', data.error || 'Could not identify.'); }
    } catch (error) { Alert.alert('Error', 'Connection failed.'); } 
    finally { setIsScanning(false); }
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.historyCard, { backgroundColor: colors.card }]} onPress={() => item.plant_id && router.push(`/(app)/plantDetail?id=${item.plant_id}`)}>
      <Image source={{ uri: item.scan_image_url }} style={styles.historyImage} />
      <View style={styles.historyInfo}>
        <Text style={[styles.historyName, { color: colors.text }]}>{item.result_name}</Text>
        <Text style={[styles.historyDate, { color: colors.subtext }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Scan Plant</Text>
      <View style={{ height: 180 }}>
        <FlatList
          data={INSTRUCTIONS}
          renderItem={({item}) => <ScanInstructionCard item={item} />}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width - (SIZES.padding * 2) + SIZES.padding}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: SIZES.padding }}
        />
      </View>
      
      <View style={styles.content}>
        <View style={[styles.scanBox, { backgroundColor: colors.card }]}>
          <ScanAnimation isScanning={isScanning} />
          <Ionicons name="leaf-outline" size={80} color={colors.subtext} style={{ opacity: 0.1 }} />
          {isScanning && <Text style={[styles.loadingText, { color: colors.primary }]}>Scanning...</Text>}
          <View style={[styles.lightingIndicator, { backgroundColor: colors.background }]}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.dotText, { color: colors.subtext }]}>Lighting: Good</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => startScan('camera')} disabled={isScanning}>
            <Ionicons name="camera-outline" size={24} color={colors.card} />
            <Text style={[styles.buttonText, { color: colors.card }]}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary, marginTop: 15 }]} onPress={() => startScan('gallery')} disabled={isScanning}>
            <Ionicons name="image-outline" size={24} color={colors.primary} />
            <Text style={[styles.buttonText, { color: colors.primary }]}>Upload Image</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Recent Scans</Text>
        <FlatList
          data={scanHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.scan_id.toString()}
          ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 10 }}>No scan history found.</Text>}
        />
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Ionicons name="checkmark-circle" size={60} color={colors.success} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>I found your plant!</Text>
            <Text style={[styles.modalPlantName, { color: colors.primary }]}>{scanResult?.plant_name}</Text>
            <Text style={[styles.modalAccuracy, { color: colors.subtext }]}>Confidence: {Math.round((scanResult?.accuracy || 0) * 100)}%</Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, width: '100%' }]} onPress={() => { setModalVisible(false); router.push(`/(app)/plantDetail?id=${scanResult?.plant_id}`); }}>
              <Text style={[styles.buttonText, { color: colors.card }]}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 15 }}><Text style={{ color: colors.subtext }}>Scan Another</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { ...FONTS.h1, paddingHorizontal: SIZES.padding, paddingTop: 20, marginBottom: 10 },
  sectionTitle: { ...FONTS.h2, paddingHorizontal: SIZES.padding },
  content: { flex: 1, paddingHorizontal: SIZES.padding },
  scanBox: { width: '100%', height: 260, borderRadius: SIZES.radius * 1.5, justifyContent: 'center', alignItems: 'center', padding: 20, marginVertical: 10, elevation: 2, overflow: 'hidden' },
  loadingText: { ...FONTS.h3, marginTop: 15, zIndex: 10, position: 'absolute', bottom: '35%' },
  scanLine: { position: 'absolute', left: '10%', right: '10%', height: 3, borderRadius: 1.5, zIndex: 10 },
  lightingIndicator: { position: 'absolute', bottom: 15, left: 15, flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  dotText: { ...FONTS.body4, fontSize: 12 },
  buttonContainer: { width: '100%' },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: SIZES.radius, },
  buttonText: { ...FONTS.h3, marginLeft: 10, fontWeight: 'bold' },
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: SIZES.radius, marginBottom: 10 },
  historyImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  historyInfo: { flex: 1 },
  historyName: { ...FONTS.h4, fontWeight: '600' },
  historyDate: { ...FONTS.body4, fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  modalContent: { width: '100%', borderRadius: SIZES.radius * 1.5, padding: 30, alignItems: 'center' },
  modalTitle: { ...FONTS.h2, marginTop: 15 },
  modalPlantName: { ...FONTS.h1, color: '#16A34A', marginVertical: 10 },
  modalAccuracy: { ...FONTS.body3, marginBottom: 25 },
});