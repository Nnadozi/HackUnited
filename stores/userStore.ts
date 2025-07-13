import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Video {
  id: string;
  title: string;
  xp_awarded: number;
  date_watched: string;
  url?: string;
  thumbnailUrl?: string;
}

export interface UserInfo {
  currentXp: number;
  targetXp: number;
  progress: number;
  currentLevel: number;
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

  // Video Management
  videos: Video[];
  addVideo: (video: Omit<Video, 'id' | 'date_watched'>) => void;
  removeVideo: (id: string) => void;
  getTodaysVideos: () => Video[];
  getTotalXPToday: () => number;

  // XP Management
  addXP: (amount: number) => void;
  resetLevelUp: () => void;
  applyDailyDecay: () => void;

  // User actions
  setUser: (user: UserInfo) => void;
  logout: () => void;
  completeOnboarding: () => void;
  deleteAccount: () => void;
}

// XP requirements for each level
const XP_REQUIREMENTS = [5, 10, 20, 35, 50, 75]; // Level 0-5

const calculateLevelFromXP = (xp: number): { level: number; xpIntoLevel: number } => {
  let level = 0;
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

      setUser: (user: UserInfo) => {
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        set({
          user: null,
          isAuthenticated: false,
          videos: [],
          totalXP: 0,
          currentXP: 0,
          currentLevel: 0,
        });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

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
          // Remove 2 oldest videos
          const videosToRemove = state.videos.slice(-2);
          const decayXP = videosToRemove.reduce((sum, v) => sum + v.xp_awarded, 0);
          set({
            videos: state.videos.slice(0, Math.max(0, state.videos.length - 2)),
          });
          get().addXP(-decayXP);
          set({ lastActiveDate: today });
        }
      },

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
        set(state => ({ videos: state.videos.filter(video => video.id !== id) }));
      },

      getTodaysVideos: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        return state.videos.filter(video => 
          video.date_watched.split('T')[0] === today
        );
      },

      getTotalXPToday: () => {
        const todaysVideos = get().getTodaysVideos();
        return todaysVideos.reduce((sum, v) => sum + v.xp_awarded, 0);
      },

      deleteAccount: () => {
        set({
          user: null,
          isAuthenticated: false,
          videos: [],
          totalXP: 0,
          currentXP: 0,
          currentLevel: 0,
        });
        router.replace('/');
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 