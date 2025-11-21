// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { setItemAsync, getItemAsync, deleteItemAsync } from 'expo-secure-store';
import { 
  STATIC_GUEST_PROFILE, 
  STATIC_GUEST_GARDEN,  
  GUEST_ACHIEVEMENTS,
  GUEST_QUIZ_DATA,
  GuestProfile,
  SavedPlant,
  Achievement
} from '../constants/StaticData';
import { API_BASE_URL } from '../constants/Config';

// --- User Data Interface ---
interface UserData {
  id: string;
  username: string;
  email: string;
  score?: number;
  rank_name?: string;
  bio?: string;
  profile_pic?: string;
  cover_photo?: string;
}

interface AuthContextType {
  user: UserData | null;
  isGuest: boolean;
  isLoading: boolean;
  signIn: (userData: UserData) => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => void;
  guestProfile: GuestProfile;
  guestGarden: SavedPlant[];
  guestAchievements: Achievement[];
  guestProgress: Record<string, boolean>; 
  updateGuestProfile: (newProfile: Partial<GuestProfile['user_info']>) => void;
  updateGuestGarden: (newGarden: SavedPlant[]) => void;
  addPlantToGuestGarden: (plant: SavedPlant) => void;
  updateGuestPlant: (plant: SavedPlant) => void;
  completeQuizLevel: (categoryId: string, levelId: string, score: number) => void;
  updateGuestQuizScore: (newScore: number) => void; 
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  
  // initialize the state using the CORRECT variable from StaticData.ts
  const [guestProfile, setGuestProfile] = useState(STATIC_GUEST_PROFILE);
  const [guestGarden, setGuestGarden] = useState(STATIC_GUEST_GARDEN);
 
  
  const [guestAchievements, setGuestAchievements] = useState(GUEST_ACHIEVEMENTS);
  const [guestProgress, setGuestProgress] = useState<Record<string, boolean>>({'c1_l1': true, '101': true});
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await getItemAsync('userSession');
        if (savedUser) {
           const userData = JSON.parse(savedUser);
           setUser(userData);
           fetchUserProgress(userData.id); // Load progress on auto-login
        }
      } catch (e) { console.error(e); } 
      finally { setIsLoading(false); }
    };
    loadUser();
  }, []);

   useEffect(() => {
    if (isLoading) return; 
    const inAuthGroup = segments[0] === '(auth)';
    const isLoggedIn = !!user || isGuest; 
    if (!isLoggedIn && !inAuthGroup) router.replace('/(auth)');
    else if (isLoggedIn && inAuthGroup) router.replace('/(tabs)');
  }, [user, isGuest, isLoading, segments]);

  const fetchUserProgress = async (userId: string) => {
      try {
          const response = await fetch(`${API_BASE_URL}/get_user_progress.php?user_id=${userId}`);
          const data = await response.json();
          if (data.progress && !data.progress['101']) {
            data.progress['101'] = true;
          }
          if (data.progress) setGuestProgress(prev => ({...prev, ...data.progress}));
          if (data.badges) {
              setGuestAchievements(prev => prev.map(a => ({...a, unlocked: data.badges.includes(a.name)})));
          }
      } catch (e) { console.error("Progress fetch error", e); }
  };

  const signIn = async (userData: UserData) => {
    await setItemAsync('userSession', JSON.stringify(userData));
    setUser(userData);
    setIsGuest(false);
    await fetchUserProgress(userData.id);
  };

  const signInAsGuest = () => {
    setIsGuest(true); setUser(null);
    setGuestProfile(STATIC_GUEST_PROFILE); setGuestGarden(STATIC_GUEST_GARDEN);
    setGuestAchievements(GUEST_ACHIEVEMENTS); setGuestProgress({'c1_l1': true, '101': true});
  };

  const signOut = async () => {
    await deleteItemAsync('userSession');
    setUser(null); setIsGuest(false);
    setGuestProfile(STATIC_GUEST_PROFILE);
    setGuestGarden(STATIC_GUEST_GARDEN);
    setGuestAchievements(GUEST_ACHIEVEMENTS);
    setGuestProgress({'c1_l1': true, '101': true});
    router.replace('/(auth)');
  };

  const unlockBadge = (badgeName: string) => {
      setGuestAchievements(prev => {
          const badge = prev.find(a => a.name === badgeName);
          if (badge && !badge.unlocked) {
              setGuestProfile(p => ({...p, stats: {...p.stats, badges_earned: p.stats.badges_earned + 1}}));
          }
          return prev.map(a => a.name === badgeName ? {...a, unlocked: true} : a);
      });
  };

  const completeQuizLevel = async (categoryId: string, levelId: string, scoreEarned: number) => {
    let nextLevelId = '';
    const catIdStr = categoryId.toString();
    const lvlIdStr = levelId.toString();
    const category = GUEST_QUIZ_DATA.find(c => c.id === catIdStr);
    
    if (category) {
         const currentIdx = category.levels.findIndex(l => l.id === lvlIdStr);
         if (currentIdx !== -1 && currentIdx < category.levels.length - 1) {
             nextLevelId = category.levels[currentIdx+1].id;
         } else if (currentIdx === category.levels.length - 1) {
             const currentCatIdx = GUEST_QUIZ_DATA.findIndex(c => c.id === catIdStr);
             if (currentCatIdx < GUEST_QUIZ_DATA.length - 1) {
                 nextLevelId = GUEST_QUIZ_DATA[currentCatIdx + 1].levels[0].id;
             }
         }
    }

    if (isGuest) {
        const newQuizzesDone = guestProfile.stats.quizzes_done + 1;
        setGuestProfile(prev => ({ ...prev, stats: { ...prev.stats, score: prev.stats.score + scoreEarned, quizzes_done: newQuizzesDone } }));
        if (nextLevelId) setGuestProgress(prev => ({ ...prev, [nextLevelId]: true }));
        if (newQuizzesDone === 1) unlockBadge("First Steps");
    } else {
        try {
            const formData = new FormData();
            if (user?.id) formData.append('user_id', user.id);
            formData.append('level_id', lvlIdStr);
            formData.append('score_earned', scoreEarned.toString());
            const res = await fetch(`${API_BASE_URL}/submit_quiz_level.php`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                if (user?.id) fetchUserProgress(user.id);
            }
        } catch (e) { console.error(e); }
    }
  };

  const updateGuestProfile = (p: any) => setGuestProfile(prev => ({...prev, user_info: {...prev.user_info, ...p}}));
  const updateGuestGarden = (g: any) => setGuestGarden(g);
  const addPlantToGuestGarden = (p: any) => {
      setGuestGarden(prevGarden => {
          if (prevGarden.find(plant => plant.plant_id === p.plant_id)) return prevGarden;
          const newGarden = [p, ...prevGarden];
          setGuestProfile(prev => ({...prev, stats: {...prev.stats, plants_saved: newGarden.length}}));
          return newGarden;
      });
  };
  const updateGuestPlant = (p: any) => setGuestGarden(prev => prev.map(item => item.plant_id === p.plant_id ? p : item));
  const updateGuestQuizScore = (newScore: number) => {
      completeQuizLevel('cat1', 'c1_l1', newScore); 
  };

  const value = {
    user, isGuest, isLoading, signIn, signInAsGuest, signOut,
    guestProfile, guestGarden, guestAchievements, guestProgress,
    updateGuestProfile, updateGuestGarden, addPlantToGuestGarden, updateGuestPlant,
    completeQuizLevel, updateGuestQuizScore
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
