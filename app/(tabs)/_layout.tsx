// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme, SIZES } from '../../constants/Theme'; 

const TabBarIcon = ({ IconComponent, name, color, label }: { IconComponent: any, name: any, color: string, label: string }) => {
  return (
    <View style={styles.tabIconContainer}>
      <IconComponent name={name} size={24} color={color} />
      <Text style={[styles.tabLabel, { color: color }]}>{label}</Text>
    </View>
  );
};

const CustomScanButton = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.scanButtonContainer}>
      <View style={[styles.scanButton, { backgroundColor: colors.primary }]}>
        <Ionicons name="scan-outline" size={30} color={colors.card} />
      </View>
    </View>
  );
};

export default function TabLayout() {
  const { colors } = useTheme(); 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          backgroundColor: colors.card,
          borderTopColor: colors.background,
          marginBottom: 40,
        },
        headerShown: false, 
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, focused }) => (<TabBarIcon IconComponent={Ionicons} name={focused ? 'home' : 'home-outline'} label="" color={color} />) }} />
      <Tabs.Screen name="garden" options={{ title: 'My Garden', tabBarIcon: ({ color, focused }) => (<TabBarIcon IconComponent={Ionicons} name={focused ? 'leaf' : 'leaf-outline'} label="" color={color} />) }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: () => (<CustomScanButton />), tabBarLabel: () => null }} />
      <Tabs.Screen name="quiz" options={{ title: 'Quiz', tabBarIcon: ({ color, focused }) => (<TabBarIcon IconComponent={MaterialIcons} name={'quiz'} label="" color={color} />) }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused }) => (<TabBarIcon IconComponent={Ionicons} name={focused ? 'person' : 'person-outline'} label="" color={color} />) }} />
      
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: { alignItems: 'center', justifyContent: 'center', top: 5 },
  tabLabel: { fontSize: 12, marginTop: 2 },
  scanButtonContainer: { position: 'absolute', bottom: 7, height: 50, width: 50, justifyContent: 'center', alignItems: 'center' },
  scanButton: { width: 55, height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
});
