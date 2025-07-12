import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { calculateDailyDecay } from '../utils/videoAnalysis';

export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'other';
  duration?: number;
  views?: number;
  likes?: number;
  comments?: number;
  xp_awarded: number;
  quality_score: number;
  category: 'educational' | 'entertainment' | 'gaming' | 'productivity' | 'brain_rot' | 'other';
  date_watched: string;
  analysis?: {
    is_educational: boolean;
    is_brain_rot: boolean;
    content_quality: 'high' | 'medium' | 'low';
    reason: string;
  };
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'apple';
  profilePicture?: string;
}

export interface Friend {
  id: string;
  name: string;
  totalXP: number;
  currentLevel: number;
  profilePicture?: string;
}

interface UserStore {
  // User info
  user: UserInfo | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  
  // XP System
  currentXP: number;
  currentLevel: number;
  totalXP: number;
  lastActiveDate: string;
  justLeveledUp: boolean;
  lastXpChange: number;
  
  // Videos
  videos: Video[];
  
  // Social
  friends: Friend[];
  
  // Actions
  setUser: (user: UserInfo) => void;
  logout: () => void;
  completeOnboarding: () => void;
  
  // XP Management
  addXP: (amount: number) => void;
  resetLevelUp: () => void;
  applyDailyDecay: () => void;
  
  // Video Management
  addVideo: (video: Omit<Video, 'id' | 'date_watched'>) => void;
  removeVideo: (id: string) => void;
  getTodaysVideos: () => Video[];
  getTotalXPToday: () => number;

  // Social Management
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  getLeaderboard: () => Friend[];
}

// XP requirements for each level
const XP_REQUIREMENTS = [5, 10, 20, 35, 50, 75]; // Level 0-5

const calculateLevelFromXP = (xp: number): { level: number; xpIntoLevel: number } => {
  let level = 0;
  let xpForNext = XP_REQUIREMENTS[0];
  let xpSum = 0;

  for (let i = 0; i < XP_REQUIREMENTS.length; i++) {
    if (xp >= xpSum + XP_REQUIREMENTS[i]) {
      xpSum += XP_REQUIREMENTS[i];
      level = i + 1;
    } else {
      break;
    }
  }
  
  const xpIntoLevel = xp - xpSum;
  return { level, xpIntoLevel };
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      currentXP: 0,
      currentLevel: 0,
      totalXP: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      justLeveledUp: false,
      lastXpChange: 0,
      videos: [],
      friends: [
        { id: 'friend1', name: 'Alice', totalXP: 250, currentLevel: 5, profilePicture: 'https://i.pravatar.cc/150?u=alice' },
        { id: 'friend2', name: 'Bob', totalXP: 150, currentLevel: 4, profilePicture: 'https://i.pravatar.cc/150?u=bob' },
        { id: 'friend3', name: 'Charlie', totalXP: 80, currentLevel: 3, profilePicture: 'https://i.pravatar.cc/150?u=charlie' },
      ], // Mock data
      
      // User actions
      setUser: (user: UserInfo) => {
        set({ user, isAuthenticated: true });
      },
      
      logout: async () => {
        try {
          await SecureStore.deleteItemAsync('user_info');
          await SecureStore.deleteItemAsync('auth_token');
          // Full reset of the store on logout
          set({
            user: null,
            isAuthenticated: false,
            videos: [],
            totalXP: 0,
            currentXP: 0,
            currentLevel: 0,
          });
        } catch (error) {
          console.error('Error clearing secure store:', error);
        }
      },
      
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
      
      // XP Management
      addXP: (amount: number) => {
        const state = get();
        const newTotalXP = Math.max(0, state.totalXP + amount);
        const oldLevel = state.currentLevel;
        
        const { level: newLevel, xpIntoLevel } = calculateLevelFromXP(newTotalXP);
        
        set({
          totalXP: newTotalXP,
          currentLevel: newLevel,
          currentXP: xpIntoLevel,
          lastActiveDate: new Date().toISOString().split('T')[0],
          justLeveledUp: newLevel > oldLevel,
          lastXpChange: amount,
        });
      },

      resetLevelUp: () => {
        set({ justLeveledUp: false });
      },
      
      applyDailyDecay: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (state.lastActiveDate !== today && state.videos.length > 0) {
          const decayAmount = calculateDailyDecay();
          get().addXP(-decayAmount);
          set({ lastActiveDate: today });
        }
      },
      
      // Video Management
      addVideo: (videoData: Omit<Video, 'id' | 'date_watched'>) => {
        const newVideo: Video = {
          ...videoData,
          id: Date.now().toString(),
          date_watched: new Date().toISOString(),
        };
        
        set(state => ({ videos: [newVideo, ...state.videos] }));
        get().addXP(newVideo.xp_awarded);
      },
      
      removeVideo: (id: string) => {
        const state = get();
        const videoToRemove = state.videos.find(v => v.id === id);
        
        if (videoToRemove) {
          get().addXP(-videoToRemove.xp_awarded);
        }
        
        set({ videos: state.videos.filter(video => video.id !== id) });
      },
      
      getTodaysVideos: () => {
        const { videos } = get();
        const today = new Date().toISOString().split('T')[0];
        return videos.filter(video => 
          video.date_watched.startsWith(today)
        );
      },
      
      getTotalXPToday: () => {
        return get().getTodaysVideos().reduce((total, video) => total + video.xp_awarded, 0);
      },

      // Social Management
      addFriend: (friend: Friend) => {
        set(state => ({ friends: [...state.friends, friend] }));
      },

      removeFriend: (friendId: string) => {
        set(state => ({ friends: state.friends.filter(f => f.id !== friendId) }));
      },

      getLeaderboard: () => {
        const { user, friends, totalXP, currentLevel } = get();
        if (!user) return [];
        
        const self = {
          id: user.id,
          name: `${user.name} (You)`,
          totalXP,
          currentLevel,
          profilePicture: user.profilePicture,
        };
        
        return [self, ...friends].sort((a, b) => b.totalXP - a.totalXP);
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper functions for XP system
export const getXPProgress = (currentXP: number, level: number) => {
  if (level >= XP_REQUIREMENTS.length) {
    return { current: currentXP, required: 0, percentage: 100 };
  }
  const required = XP_REQUIREMENTS[level];
  return {
    current: currentXP,
    required,
    percentage: (currentXP / required) * 100,
  };
};

export const getXPRequiredForNextLevel = (level: number): number => {
  if (level >= XP_REQUIREMENTS.length) return 0;
  return XP_REQUIREMENTS[level];
}; 