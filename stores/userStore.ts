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
  scraped_data?: {
    description?: string;
    hashtags?: string[];
    channel_name?: string;
    keywords?: string[];
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
  email: string;
  totalXP: number;
  currentLevel: number;
  profilePicture?: string;
  isOnline?: boolean;
  lastActive?: string;
  friendshipDate?: string;
}

export interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
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
  friendRequests: FriendRequest[];
  
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
  sendFriendRequest: (email: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  searchUsers: (query: string) => Promise<Friend[]>;
  getLeaderboard: () => Friend[];
  syncFriendsData: () => Promise<void>;
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

// Mock API functions - replace with real API calls
const mockApiCall = (delay: number = 1000) => new Promise(resolve => setTimeout(resolve, delay));

const generateMockUsers = (query: string): Friend[] => {
  const mockUsers = [
    { id: 'user1', name: 'Alice Johnson', email: 'alice@example.com', totalXP: 250, currentLevel: 5, profilePicture: 'https://i.pravatar.cc/150?u=alice', isOnline: true },
    { id: 'user2', name: 'Bob Smith', email: 'bob@example.com', totalXP: 150, currentLevel: 4, profilePicture: 'https://i.pravatar.cc/150?u=bob', isOnline: false },
    { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', totalXP: 80, currentLevel: 3, profilePicture: 'https://i.pravatar.cc/150?u=charlie', isOnline: true },
    { id: 'user4', name: 'Diana Prince', email: 'diana@example.com', totalXP: 320, currentLevel: 5, profilePicture: 'https://i.pravatar.cc/150?u=diana', isOnline: true },
    { id: 'user5', name: 'Ethan Hunt', email: 'ethan@example.com', totalXP: 95, currentLevel: 3, profilePicture: 'https://i.pravatar.cc/150?u=ethan', isOnline: false },
  ];

  return mockUsers.filter(user => 
    user.name.toLowerCase().includes(query.toLowerCase()) ||
    user.email.toLowerCase().includes(query.toLowerCase())
  );
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
        { 
          id: 'friend1', 
          name: 'Alice Johnson', 
          email: 'alice@example.com',
          totalXP: 250, 
          currentLevel: 5, 
          profilePicture: 'https://i.pravatar.cc/150?u=alice',
          isOnline: true,
          lastActive: new Date().toISOString(),
          friendshipDate: '2024-01-15'
        },
        { 
          id: 'friend2', 
          name: 'Bob Smith', 
          email: 'bob@example.com',
          totalXP: 150, 
          currentLevel: 4, 
          profilePicture: 'https://i.pravatar.cc/150?u=bob',
          isOnline: false,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          friendshipDate: '2024-02-01'
        },
        { 
          id: 'friend3', 
          name: 'Charlie Brown', 
          email: 'charlie@example.com',
          totalXP: 80, 
          currentLevel: 3, 
          profilePicture: 'https://i.pravatar.cc/150?u=charlie',
          isOnline: true,
          lastActive: new Date().toISOString(),
          friendshipDate: '2024-02-10'
        },
      ],
      friendRequests: [
        {
          id: 'req1',
          fromUser: {
            id: 'user4',
            name: 'Diana Prince',
            email: 'diana@example.com',
            profilePicture: 'https://i.pravatar.cc/150?u=diana'
          },
          toUser: {
            id: 'currentUser',
            name: 'You',
            email: 'you@example.com'
          },
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ],
      
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
        return todaysVideos.reduce((total, video) => total + video.xp_awarded, 0);
      },
      
      // Social Management
      addFriend: (friend: Friend) => {
        set(state => ({ 
          friends: [...state.friends, { 
            ...friend, 
            friendshipDate: new Date().toISOString().split('T')[0] 
          }] 
        }));
      },
      
      removeFriend: (friendId: string) => {
        set(state => ({ 
          friends: state.friends.filter(friend => friend.id !== friendId) 
        }));
      },

      sendFriendRequest: async (email: string) => {
        try {
          await mockApiCall(1500);
          
          // Mock: Check if user exists
          const users = generateMockUsers(email);
          const targetUser = users.find(user => user.email === email);
          
          if (!targetUser) {
            return false;
          }

          // Mock: Check if already friends
          const state = get();
          const isAlreadyFriend = state.friends.some(friend => friend.email === email);
          
          if (isAlreadyFriend) {
            return false;
          }

          // Mock: Create friend request
          const newRequest: FriendRequest = {
            id: `req_${Date.now()}`,
            fromUser: {
              id: state.user?.id || 'current_user',
              name: state.user?.name || 'You',
              email: state.user?.email || 'you@example.com',
              profilePicture: state.user?.profilePicture
            },
            toUser: {
              id: targetUser.id,
              name: targetUser.name,
              email: targetUser.email
            },
            status: 'pending',
            createdAt: new Date().toISOString()
          };

          // In a real app, this would be sent to the backend
          // For now, we'll auto-accept after a delay to simulate the other user accepting
          setTimeout(() => {
            get().acceptFriendRequest(newRequest.id);
          }, 3000);

          return true;
        } catch (error) {
          console.error('Error sending friend request:', error);
          return false;
        }
      },

      acceptFriendRequest: (requestId: string) => {
        const state = get();
        const request = state.friendRequests.find(req => req.id === requestId);
        
        if (request) {
          // Add as friend
          const newFriend: Friend = {
            id: request.fromUser.id,
            name: request.fromUser.name,
            email: request.fromUser.email,
            totalXP: Math.floor(Math.random() * 300) + 50, // Random XP for demo
            currentLevel: Math.floor(Math.random() * 5) + 1, // Random level for demo
            profilePicture: request.fromUser.profilePicture,
            isOnline: Math.random() > 0.5,
            lastActive: new Date().toISOString(),
            friendshipDate: new Date().toISOString().split('T')[0]
          };

          set(state => ({
            friends: [...state.friends, newFriend],
            friendRequests: state.friendRequests.filter(req => req.id !== requestId)
          }));
        }
      },

      rejectFriendRequest: (requestId: string) => {
        set(state => ({
          friendRequests: state.friendRequests.filter(req => req.id !== requestId)
        }));
      },

      searchUsers: async (query: string) => {
        try {
          await mockApiCall(800);
          
          const users = generateMockUsers(query);
          const state = get();
          
          // Filter out current user and existing friends
          return users.filter(user => 
            user.email !== state.user?.email &&
            !state.friends.some(friend => friend.email === user.email)
          );
        } catch (error) {
          console.error('Error searching users:', error);
          return [];
        }
      },

      getLeaderboard: () => {
        const state = get();
        const allUsers = [...state.friends];
        
        // Add current user to leaderboard
        if (state.user) {
          allUsers.push({
            id: state.user.id,
            name: state.user.name,
            email: state.user.email,
            totalXP: state.totalXP,
            currentLevel: state.currentLevel,
            profilePicture: state.user.profilePicture,
            isOnline: true,
            lastActive: new Date().toISOString(),
            friendshipDate: 'You'
          });
        }
        
        return allUsers.sort((a, b) => b.totalXP - a.totalXP);
      },

      syncFriendsData: async () => {
        try {
          await mockApiCall(2000);
          
          // Mock: Update friends' online status and XP
          set(state => ({
            friends: state.friends.map(friend => ({
              ...friend,
              isOnline: Math.random() > 0.3,
              totalXP: friend.totalXP + Math.floor(Math.random() * 10),
              lastActive: Math.random() > 0.5 ? new Date().toISOString() : friend.lastActive
            }))
          }));
        } catch (error) {
          console.error('Error syncing friends data:', error);
        }
      }
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const getXPProgress = (currentXP: number, level: number) => {
  if (level >= XP_REQUIREMENTS.length) {
    return { current: 0, required: 0, percentage: 100 };
  }
  
  const required = XP_REQUIREMENTS[level];
  const percentage = (currentXP / required) * 100;
  
  return { current: currentXP, required, percentage };
};

export const getXPRequiredForNextLevel = (level: number): number => {
  if (level >= XP_REQUIREMENTS.length) return 0;
  return XP_REQUIREMENTS[level];
}; 