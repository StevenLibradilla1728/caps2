// components/WeatherWidget.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FONTS } from '../constants/Theme';

// --- YOUR API KEY HERE ---
const API_KEY = "afd65e14949cc34cca4ac18199420f2d"; 

const LOCATION = "Quezon City,PH"; // Your location

export default function WeatherWidget() {
  const { colors } = useTheme();
  const [weather, setWeather] = useState<{ temp: string, main: string, icon: string } | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (API_KEY === "afd65e14949cc34cca4ac18199420f2d") {
      console.warn("OpenWeatherMap API key is missing.");
      setWeather({ temp: '28', main: 'Sunny', icon: '01d' }); // Mock data
      return;
    }
    
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${LOCATION}&appid=${API_KEY}&units=metric`);
      const data = await response.json();
      
      if (data && data.main) {
        setWeather({
          temp: Math.round(data.main.temp).toString(),
          main: data.weather[0].main,
          icon: data.weather[0].icon
        });
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    }
  };

  if (!weather) {
    return <View style={styles.container}><Text style={[styles.temp, { color: colors.text }]}>...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Weather Icon */}
      <Image
        source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
        style={styles.icon}
      />
      {/* Temperature */}
      <Text style={[styles.temp, { color: colors.text }]}>{weather.temp}°</Text>
      {/* Location / Condition */}
      <View style={{ marginLeft: 8 }}>
        <Text style={[styles.condition, { color: colors.text }]}>{weather.main}</Text>
        <Text style={[styles.location, { color: colors.subtext }]}>Quezon City</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  icon: {
    width: 35,
    height: 35,
  },
  temp: {
    ...FONTS.h2,
    marginLeft: -4,
  },
  condition: {
    ...FONTS.body4,
    fontWeight: 'bold',
  },
  location: {
    ...FONTS.body4,
    fontSize: 12,
  },
});