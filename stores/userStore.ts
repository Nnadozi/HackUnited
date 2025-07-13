import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Video as SupabaseVideo } from '../lib/supabase';
import { friendsService, userService, videoService } from '../lib/supabaseService';

export interface Video {
  id: string;
  title: string;
  xp_awarded: number;
  date_watched: string;
  created_at: string;
  url?: string;
  thumbnailUrl?: string;
  platform?: 'youtube' | 'instagram' | 'tiktok' | 'other';
  duration?: number;
  views?: number;
  likes?: number;
  comments?: number;
  quality_score?: number;
  category?: 'educational' | 'entertainment' | 'gaming' | 'productivity' | 'brain_rot' | 'other';
  analysis_reason?: string;
  scraped_data?: {
    description?: string;
    hashtags?: string[];
    channel_name?: string;
    keywords?: string[];
  };
  tags?: string[];
  detailed_analysis?: {
    educational_value: number;
    productivity_value: number;
    entertainment_value: number;
    time_waste_potential: number;
    skill_development: number;
    knowledge_gain: number;
    motivation_impact: number;
    stress_relief: number;
    social_value: number;
    creativity_stimulation: number;
    production_quality: number;
    engagement_factor: number;
    information_density: number;
    practical_applicability: number;
  };
  recommendations?: {
    watch_duration: 'full' | 'partial' | 'skip' | 'moderate';
    best_time_to_watch: 'morning' | 'afternoon' | 'evening' | 'anytime' | 'avoid';
    frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
    alternatives: string[];
  };
  content_warnings?: string[];
  learning_objectives?: string[];
  mood_analysis?: {
    overall_tone: 'positive' | 'negative' | 'neutral' | 'mixed';
    energy_level: 'high' | 'medium' | 'low';
    emotional_impact: string;
  };
  content_insights?: {
    key_takeaways: string[];
    target_audience: string;
    complexity_level: 'beginner' | 'intermediate' | 'advanced';
    estimated_retention: number;
  };
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'apple' | 'email';
  profilePicture?: string;
  currentXp: number;
  targetXp: number;
  progress: number;
  currentLevel: number;
}

export interface Friend {
  id: string;
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
  totalXP: number;
  currentLevel: number;
  lastActive?: string;
  friendshipDate?: string;
  isOnline?: boolean;
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
  
  // Video Management
  videos: Video[];
  addVideo: (video: Omit<Video, 'id' | 'date_watched'>) => Promise<void>;
  removeVideo: (id: string) => Promise<void>;
  getTodaysVideos: () => Video[];
  getTotalXPToday: () => number;
  syncVideos: () => Promise<void>;

  // XP Management
  addXP: (amount: number) => Promise<void>;
  resetLevelUp: () => void;
  applyDailyDecay: () => Promise<void>;
  
  // User actions
  setUser: (user: UserInfo) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  deleteAccount: () => Promise<void>;
  syncUserData: () => Promise<void>;
  initializeFromStorage: () => Promise<void>;

  // Friends system
  friends: Friend[];
  friendRequests: FriendRequest[];
  searchUsers: (query: string) => Promise<Friend[]>;
  sendFriendRequest: (friendId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  getLeaderboard: () => Promise<Friend[]>;
  syncFriendsData: () => Promise<void>;
}

// XP requirements for infinite levels
// Levels 0-5: Introduction levels (5, 10, 20, 35, 50, 75 XP)
// Level 6+: Advanced levels with penalties for bad content
const calculateLevelFromXP = (xp: number): { level: number; xpIntoLevel: number } => {
  // Handle negative XP - stay at level 0
  if (xp < 0) return { level: 0, xpIntoLevel: 0 };
  
  // Level progression: 0->1 (5 XP), 1->2 (10 XP), 2->3 (20 XP), 3->4 (35 XP), 4->5 (50 XP)
  if (xp < 5) return { level: 0, xpIntoLevel: xp };
  if (xp < 15) return { level: 1, xpIntoLevel: xp - 5 };
  if (xp < 35) return { level: 2, xpIntoLevel: xp - 15 };
  if (xp < 70) return { level: 3, xpIntoLevel: xp - 35 };
  if (xp < 120) return { level: 4, xpIntoLevel: xp - 70 };
  if (xp < 195) return { level: 5, xpIntoLevel: xp - 120 };
  
  // Level 6+: Continue with exponential scaling (no max level)
  let level = 5;
  let xpSum = 195;
  let xpForNextLevel = 75;
  
  while (xp >= xpSum + xpForNextLevel) {
    xpSum += xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(xpForNextLevel * 1.2); // 20% increase per level
  }
  
  const xpIntoLevel = xp - xpSum;
  return { level, xpIntoLevel };
};

const calculateTargetXP = (level: number): number => {
  if (level < 5) {
    const requirements = [5, 10, 20, 35, 50, 75];
    return requirements[level] || 75;
  }
  
  // Level 6+: Advanced scaling
  let xpForNextLevel = 75;
  for (let i = 6; i <= level; i++) {
    xpForNextLevel = Math.floor(xpForNextLevel * 1.2);
  }
  return xpForNextLevel;
};

// Helper to convert Supabase video to local video format
const convertSupabaseVideo = (supabaseVideo: SupabaseVideo): Video => ({
  id: supabaseVideo.id,
  title: supabaseVideo.title,
  xp_awarded: supabaseVideo.xp_awarded,
  date_watched: supabaseVideo.date_watched,
  created_at: supabaseVideo.created_at || supabaseVideo.date_watched,
  url: supabaseVideo.url || undefined,
  thumbnailUrl: supabaseVideo.thumbnail_url || undefined,
  platform: supabaseVideo.platform || undefined,
  duration: supabaseVideo.duration || undefined,
  views: supabaseVideo.views || undefined,
  likes: supabaseVideo.likes || undefined,
  comments: supabaseVideo.comments || undefined,
  quality_score: supabaseVideo.quality_score || undefined,
  category: supabaseVideo.category || undefined,
  analysis_reason: supabaseVideo.analysis_reason || undefined,
  scraped_data: supabaseVideo.scraped_data || undefined,
  tags: supabaseVideo.tags || undefined,
  detailed_analysis: supabaseVideo.detailed_analysis || undefined,
  recommendations: supabaseVideo.recommendations || undefined,
  content_warnings: supabaseVideo.content_warnings || undefined,
  learning_objectives: supabaseVideo.learning_objectives || undefined,
  mood_analysis: supabaseVideo.mood_analysis || undefined,
  content_insights: supabaseVideo.content_insights || undefined
});

// Helper to convert local video to Supabase format
const convertToSupabaseVideo = (video: Omit<Video, 'id' | 'date_watched'>, userId: string): any => ({
  user_id: userId,
  title: video.title,
  xp_awarded: video.xp_awarded,
  date_watched: new Date().toISOString().split('T')[0],
  url: video.url,
  thumbnail_url: video.thumbnailUrl,
  platform: video.platform,
  duration: video.duration,
  views: video.views,
  likes: video.likes,
  comments: video.comments,
  quality_score: video.quality_score,
  category: video.category,
  analysis_reason: video.analysis_reason,
  scraped_data: video.scraped_data,
  tags: video.tags,
  detailed_analysis: video.detailed_analysis,
  recommendations: video.recommendations,
  content_warnings: video.content_warnings,
  learning_objectives: video.learning_objectives,
  mood_analysis: video.mood_analysis,
  content_insights: video.content_insights
});

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
      friends: [],
      friendRequests: [],

      setUser: async (user: UserInfo) => {
        try {
          // For now, let's use a simpler approach without Supabase Auth
          // We'll create the user profile directly in our database
          const supabaseUser = await userService.upsertUser({
            email: user.email,
            name: user.name,
            provider: user.provider,
            profile_picture: user.profilePicture,
            current_xp: user.currentXp || 0,
            total_xp: user.currentXp || 0,
            current_level: user.currentLevel || 0
          });

          if (supabaseUser) {
            const { level } = calculateLevelFromXP(supabaseUser.current_xp);
            const targetXp = calculateTargetXP(level);
            
            set({ 
              user: {
                ...user,
                id: supabaseUser.id, // Use the database-generated UUID
                currentXp: supabaseUser.current_xp,
                currentLevel: level,
                targetXp: targetXp,
                progress: supabaseUser.current_xp / targetXp
              },
              isAuthenticated: true,
              currentXP: supabaseUser.current_xp,
              totalXP: supabaseUser.total_xp,
              currentLevel: level
            });
            
            // Load user's videos and friends
            get().syncVideos();
            get().syncFriendsData();
          }
        } catch (error) {
          console.error('Error setting user:', error);
          // Fallback: set user locally if database fails
          set({ user, isAuthenticated: true });
        }
      },

      logout: async () => {
        try {
          // Clear SecureStore authentication data
          await SecureStore.deleteItemAsync('user_info');
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('refresh_token');
          await SecureStore.deleteItemAsync('auth_provider');
          
          // Clear AsyncStorage
          await AsyncStorage.multiRemove(['user-storage']);
          
          // Reset state
          set({
            user: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            videos: [],
            friends: [],
            friendRequests: [],
            currentXP: 0,
            totalXP: 0,
            currentLevel: 0,
            lastActiveDate: new Date().toISOString().split('T')[0],
            justLeveledUp: false,
            lastXpChange: 0,
          });
        } catch (error) {
          console.error('Error during logout:', error);
        }
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      deleteAccount: async () => {
        const state = get();
        if (state.user) {
          try {
            await userService.deleteUser(state.user.id);
          } catch (error) {
            console.error('Error deleting account from database:', error);
            // Continue with local cleanup even if database deletion fails
          }
          
          // Clear all user data
          set({
            user: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            videos: [],
            friends: [],
            friendRequests: [],
            totalXP: 0,
            currentXP: 0,
            currentLevel: 0,
            lastActiveDate: new Date().toISOString().split('T')[0],
            justLeveledUp: false,
            lastXpChange: 0,
          });
          
          // Clear AsyncStorage and SecureStore
          try {
            await AsyncStorage.multiRemove(['user-storage']);
            // Also clear any secure storage items
            await SecureStore.deleteItemAsync('user_info');
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('onboarding_complete');
          } catch (error) {
            console.error('Error clearing storage:', error);
          }
          
          // The app will automatically navigate to onboarding since hasCompletedOnboarding is now false
          console.log('Account deleted successfully, user should be redirected to onboarding');
        }
      },

      syncUserData: async () => {
        const state = get();
        if (state.user) {
          try {
            const userData = await userService.getUserById(state.user.id);
            if (userData) {
              const { level } = calculateLevelFromXP(userData.current_xp);
              set({
                currentXP: userData.current_xp,
                totalXP: userData.total_xp,
                currentLevel: level,
                user: {
                  ...state.user,
                  currentXp: userData.current_xp,
                  currentLevel: level
                }
              });
            } else {
              // User doesn't exist in database, reset to onboarding
              console.log('User not found in database, redirecting to onboarding');
              set({
                user: null,
                isAuthenticated: false,
                hasCompletedOnboarding: false,
                currentXP: 0,
                totalXP: 0,
                currentLevel: 0,
                videos: [],
                friends: [],
                friendRequests: [],
              });
              // App will automatically navigate to onboarding since hasCompletedOnboarding is now false
            }
          } catch (error) {
            console.error('Error syncing user data:', error);
            // On error, also reset to onboarding
            set({
              user: null,
              isAuthenticated: false,
              hasCompletedOnboarding: false,
              currentXP: 0,
              totalXP: 0,
              currentLevel: 0,
              videos: [],
              friends: [],
              friendRequests: [],
            });
            // App will automatically navigate to onboarding since hasCompletedOnboarding is now false
          }
        }
      },

      addXP: async (amount: number) => {
        const state = get();
        if (!state.user) return;

        const newTotalXP = Math.max(0, state.totalXP + amount);
        let { level: newLevel, xpIntoLevel: newCurrentXP } = calculateLevelFromXP(newTotalXP);
        
        if (newLevel > state.currentLevel) {
          set({ justLeveledUp: true });
        }
        
        set({
          totalXP: newTotalXP,
          currentLevel: newLevel,
          currentXP: newCurrentXP,
          lastXpChange: amount
        });
        
        try {
          await userService.updateUser(state.user.id, {
            current_xp: newCurrentXP,
            total_xp: newTotalXP,
            current_level: newLevel
          });
        } catch (error) {
          console.error('Error updating XP:', error);
          // Fallback to local update
          set({
            currentXP: newCurrentXP,
            totalXP: newTotalXP,
            currentLevel: newLevel,
            justLeveledUp: newLevel > state.currentLevel,
            lastXpChange: amount
          });
        }
      },

      resetLevelUp: () => {
        set({ justLeveledUp: false, lastXpChange: 0 });
      },

      applyDailyDecay: async () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (state.lastActiveDate !== today && state.videos.length > 0) {
          // Get today's videos to calculate decay
          const todaysVideos = await videoService.getTodaysVideos(state.user?.id || '');
          const videosToRemove = todaysVideos.slice(-2); // Remove 2 oldest videos
          const decayXP = videosToRemove.reduce((sum, v) => sum + v.xp_awarded, 0);
          
          // Remove videos from database
          for (const video of videosToRemove) {
            await videoService.removeVideo(video.id);
          }
          
          // Apply XP decay
          await get().addXP(-decayXP);
          set({ lastActiveDate: today });
          
          // Refresh videos
          get().syncVideos();
        }
      },

      addVideo: async (videoData: Omit<Video, 'id' | 'date_watched'>) => {
        const state = get();
        if (!state.user) return;

        const adjustedVideoData = videoData; // XP already adjusted by server

        try {
          const supabaseVideoData = convertToSupabaseVideo(adjustedVideoData, state.user.id);
          const newVideo = await videoService.addVideo(supabaseVideoData);
          
          if (newVideo) {
            const convertedVideo = convertSupabaseVideo(newVideo);
            set(state => ({ 
              videos: [convertedVideo, ...state.videos] 
            }));
            
            // Add XP with adjusted amount
            await get().addXP(videoData.xp_awarded);
          }
        } catch (error) {
          console.error('Error adding video:', error);
          // Fallback to local storage
                      const newVideo: Video = {
              id: Date.now().toString(),
              date_watched: new Date().toISOString().split('T')[0],
              ...adjustedVideoData
            };
          set(state => ({ 
            videos: [newVideo, ...state.videos] 
          }));
          await get().addXP(videoData.xp_awarded);
        }
      },

      removeVideo: async (id: string) => {
        try {
          await videoService.removeVideo(id);
          set(state => ({ 
            videos: state.videos.filter(video => video.id !== id) 
          }));
        } catch (error) {
          console.error('Error removing video:', error);
          // Fallback to local removal
          set(state => ({ 
            videos: state.videos.filter(video => video.id !== id) 
          }));
        }
      },

      getTodaysVideos: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().videos.filter(video => video.date_watched === today);
      },

      getTotalXPToday: () => {
        const todaysVideos = get().getTodaysVideos();
        return todaysVideos.reduce((sum, v) => sum + v.xp_awarded, 0);
      },

      syncVideos: async () => {
        const state = get();
        if (!state.user) return;

        try {
          const supabaseVideos = await videoService.getUserVideos(state.user.id);
          const convertedVideos = supabaseVideos.map(convertSupabaseVideo);
          set({ videos: convertedVideos });
        } catch (error) {
          console.error('Error syncing videos:', error);
        }
      },

      // Friends system
      searchUsers: async (query: string): Promise<Friend[]> => {
        const state = get();
        if (!state.user) return [];

        try {
          const users = await userService.searchUsers(query, state.user.id);
          return users.map(user => ({
            id: user.id,
            userId: user.id,
            name: user.name,
            email: user.email,
            profilePicture: user.profile_picture,
            totalXP: user.total_xp,
            currentLevel: user.current_level,
            isOnline: true // Default to online for search results
          }));
        } catch (error) {
          console.error('Error searching users:', error);
          return [];
        }
      },

      sendFriendRequest: async (friendId: string): Promise<boolean> => {
        const state = get();
        if (!state.user) return false;

        try {
          return await friendsService.sendFriendRequest(state.user.id, friendId);
        } catch (error) {
          console.error('Error sending friend request:', error);
          return false;
        }
      },

      acceptFriendRequest: async (requestId: string) => {
        try {
          await friendsService.acceptFriendRequest(requestId);
          get().syncFriendsData();
        } catch (error) {
          console.error('Error accepting friend request:', error);
        }
      },

      rejectFriendRequest: async (requestId: string) => {
        try {
          await friendsService.rejectFriendRequest(requestId);
          get().syncFriendsData();
        } catch (error) {
          console.error('Error rejecting friend request:', error);
        }
      },

      removeFriend: async (friendId: string) => {
        const state = get();
        if (!state.user) return;

        try {
          await friendsService.removeFriend(state.user.id, friendId);
          set(state => ({ 
            friends: state.friends.filter(friend => friend.userId !== friendId) 
          }));
        } catch (error) {
          console.error('Error removing friend:', error);
        }
      },

      getLeaderboard: async (): Promise<Friend[]> => {
        const state = get();
        if (!state.user) return [];

        try {
          const leaderboard = await friendsService.getLeaderboard(state.user.id);
          return leaderboard.map(user => ({
            id: user.id,
            userId: user.id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            totalXP: user.totalXP,
            currentLevel: user.currentLevel,
            isOnline: true
          }));
        } catch (error) {
          console.error('Error getting leaderboard:', error);
          return [];
        }
      },

      syncFriendsData: async () => {
        const state = get();
        if (!state.user) return;

        try {
          const [friends, friendRequests] = await Promise.all([
            friendsService.getUserFriends(state.user.id),
            friendsService.getFriendRequests(state.user.id)
          ]);

          const convertedFriends = friends.map(friend => ({
            id: friend.id,
            userId: friend.userId,
            name: friend.name,
            email: friend.email,
            profilePicture: friend.profilePicture,
            totalXP: friend.totalXP,
            currentLevel: friend.currentLevel,
            lastActive: friend.lastActive,
            friendshipDate: friend.friendshipDate,
            isOnline: Math.random() > 0.5 // Mock online status
          }));

          set({ 
            friends: convertedFriends,
            friendRequests: friendRequests
          });
        } catch (error) {
          console.error('Error syncing friends data:', error);
        }
      },

      initializeFromStorage: async () => {
        try {
          // Check for stored authentication credentials
          const storedUserInfo = await SecureStore.getItemAsync('user_info');
          const storedAuthToken = await SecureStore.getItemAsync('auth_token');
          
          if (storedUserInfo && storedAuthToken) {
            const userInfo = JSON.parse(storedUserInfo);
            
            // Validate user still exists in database
            const userData = await userService.getUserByEmail(userInfo.email);
            if (userData) {
              // Update user with database data
              const { level } = calculateLevelFromXP(userData.current_xp);
              const targetXp = calculateTargetXP(level);
              
              set({
                user: {
                  id: userData.id,
                  email: userData.email,
                  name: userData.name,
                  provider: userData.provider,
                  profilePicture: userData.profile_picture,
                  currentXp: userData.current_xp,
                  targetXp: targetXp,
                  progress: userData.current_xp / targetXp,
                  currentLevel: level
                },
                currentXP: userData.current_xp,
                totalXP: userData.total_xp,
                currentLevel: level,
                isAuthenticated: true,
                hasCompletedOnboarding: true
              });
              
              // Load user's videos and friends
              get().syncVideos();
              get().syncFriendsData();
            } else {
              // User doesn't exist in database, clear stored credentials
              console.log('User not found in database during initialization, clearing credentials');
              await SecureStore.deleteItemAsync('user_info');
              await SecureStore.deleteItemAsync('auth_token');
              await SecureStore.deleteItemAsync('refresh_token');
              await SecureStore.deleteItemAsync('auth_provider');
              
              set({
                user: null,
                isAuthenticated: false,
                hasCompletedOnboarding: false,
                currentXP: 0,
                totalXP: 0,
                currentLevel: 0,
                videos: [],
                friends: [],
                friendRequests: [],
              });
            }
          } else {
            // No stored credentials, check if onboarding was completed
            const state = get();
            if (state.hasCompletedOnboarding && !state.isAuthenticated) {
              // Onboarding was completed but user isn't authenticated, reset to onboarding
              set({
                user: null,
                isAuthenticated: false,
                hasCompletedOnboarding: false,
                currentXP: 0,
                totalXP: 0,
                currentLevel: 0,
                videos: [],
                friends: [],
                friendRequests: [],
              });
            }
          }
        } catch (error) {
          console.error('Error initializing from storage:', error);
          // On error, reset to onboarding
          set({
            user: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            currentXP: 0,
            totalXP: 0,
            currentLevel: 0,
            videos: [],
            friends: [],
            friendRequests: [],
          });
        }
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist essential data, sync from Supabase on load
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        lastActiveDate: state.lastActiveDate,
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
); 