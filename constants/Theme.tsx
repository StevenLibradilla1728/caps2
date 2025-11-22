// constants/Theme.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dimensions, useColorScheme } from 'react-native';

const { width, height } = Dimensions.get('window');

// --- MODERN LIGHT THEME ---
const lightColors = {
  primary: '#008000',     // Vibrant Green
  secondary: '#DCFCE7',    // Very Light Green (for backgrounds)
  accent: '#F59E0B',      // Amber
  background: '#F9FAFB',  // Off-white (Gray-50)
  card: '#FFFFFF',      // Pure White
  text: '#1F2937',      // Dark Slate (Gray-800)
  subtext: '#6B7280',     // Medium Gray (Gray-500)
  error: '#DC2626',      // Red
  success: '#16A34A',    // Green
  lightGray: '#F3F4F6',   // Added for compatibility (Gray-100)
};

// --- MODERN DARK THEME ---
const darkColors = {
  primary: '#008000',     // Bright Green (Green-500)
  secondary: '#1F2937',    // Dark Slate (Gray-800)
  accent: '#F59E0B',      // Amber
  background: '#0F172A',  // Darkest Slate (Slate-900)
  card: '#1E293B',      // Lighter Slate (Slate-800)
  text: '#F1F5F9',      // Off-white (Slate-100)
  subtext: '#94A3B8',     // Medium Slate (Slate-400)
  error: '#EF4444',      // Lighter Red
  success: '#22C55E',    // Bright Green
  lightGray: '#334155',   // Added for compatibility (Slate-700)
};

// --- SIZES AND FONTS ---
export const SIZES = {
  base: 8, font: 14, radius: 12, padding: 24,
  h1: 30, h2: 22, h3: 16, h4: 14,
  body1: 30, body2: 22, body3: 16, body4: 14,
  width, height,
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold' as 'bold' },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold' as 'bold' },
  h3: { fontSize: SIZES.h3, fontWeight: 'bold' as 'bold' },
  body3: { fontSize: SIZES.body3, fontWeight: 'normal' as 'normal' },
  body4: { fontSize: SIZES.body4, fontWeight: 'normal' as 'normal' },
};

// --- THEME CONTEXT ---
interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof lightColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  
  const [isDarkMode, setIsDarkMode] = useState(false); // <-- FIX: Default is Light Mode

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- CUSTOM HOOK ---
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};