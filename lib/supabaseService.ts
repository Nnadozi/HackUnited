import { supabase, User, UserInsert, UserUpdate, Video, VideoInsert } from './supabase';

// User Service
export const userService = {
  // Create or update user on first login
  async upsertUser(userData: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'email' })
        .select()
        .single();
      
      if (error) {
        console.error('Error upserting user:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in upsertUser:', error);
      return null;
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error getting user:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        console.error('Error getting user by email:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return null;
    }
  },

  // Update user data
  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  },

  // Delete user account
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  },

  // Search users for friends
  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .rpc('search_users', { 
          search_query: query, 
          user_uuid: currentUserId 
        });
      
      if (error) {
        console.error('Error searching users:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  }
};

// Video Service
export const videoService = {
  // Add a new video
  async addVideo(videoData: VideoInsert): Promise<Video | null> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding video:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in addVideo:', error);
      return null;
    }
  },

  // Get user's videos
  async getUserVideos(userId: string): Promise<Video[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting user videos:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUserVideos:', error);
      return [];
    }
  },

  // Get today's videos
  async getTodaysVideos(userId: string): Promise<Video[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .eq('date_watched', today)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting today\'s videos:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTodaysVideos:', error);
      return [];
    }
  },

  // Remove a video
  async removeVideo(videoId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);
      
      if (error) {
        console.error('Error removing video:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in removeVideo:', error);
      return false;
    }
  },

  // Get user's XP stats
  async getUserStats(userId: string): Promise<{
    totalVideos: number;
    videosToday: number;
    avgQualityScore: number;
    xpToday: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('total_videos, videos_today, avg_quality_score, xp_today')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error getting user stats:', error);
        return null;
      }
      
      return {
        totalVideos: data.total_videos || 0,
        videosToday: data.videos_today || 0,
        avgQualityScore: Math.round(data.avg_quality_score || 0),
        xpToday: data.xp_today || 0
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return null;
    }
  }
};

// Friends Service
export const friendsService = {
  // Send friend request
  async sendFriendRequest(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending'
        });
      
      if (error) {
        console.error('Error sending friend request:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in sendFriendRequest:', error);
      return false;
    }
  },

  // Accept friend request
  async acceptFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);
      
      if (error) {
        console.error('Error accepting friend request:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in acceptFriendRequest:', error);
      return false;
    }
  },

  // Reject friend request
  async rejectFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);
      
      if (error) {
        console.error('Error rejecting friend request:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in rejectFriendRequest:', error);
      return false;
    }
  },

  // Remove friend
  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
      
      if (error) {
        console.error('Error removing friend:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in removeFriend:', error);
      return false;
    }
  },

  // Get user's friends
  async getUserFriends(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('friend_relationships')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');
      
      if (error) {
        console.error('Error getting user friends:', error);
        return [];
      }
      
      // Transform data to return friend info from the perspective of the current user
      return (data || []).map(relationship => {
        const isFriendTheOtherUser = relationship.user_id === userId;
        return {
          id: relationship.id,
          userId: isFriendTheOtherUser ? relationship.friend_id : relationship.user_id,
          name: isFriendTheOtherUser ? relationship.friend_name : relationship.user_name,
          email: isFriendTheOtherUser ? relationship.friend_email : relationship.user_email,
          profilePicture: isFriendTheOtherUser ? relationship.friend_profile_picture : relationship.user_profile_picture,
          totalXP: isFriendTheOtherUser ? relationship.friend_total_xp : relationship.user_total_xp,
          currentLevel: isFriendTheOtherUser ? relationship.friend_current_level : relationship.user_current_level,
          lastActive: isFriendTheOtherUser ? relationship.friend_last_active_date : relationship.user_last_active_date,
          friendshipDate: relationship.created_at
        };
      });
    } catch (error) {
      console.error('Error in getUserFriends:', error);
      return [];
    }
  },

  // Get friend requests
  async getFriendRequests(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('friend_relationships')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending');
      
      if (error) {
        console.error('Error getting friend requests:', error);
        return [];
      }
      
      return (data || []).map(request => ({
        id: request.id,
        fromUser: {
          id: request.user_id,
          name: request.user_name,
          email: request.user_email,
          profilePicture: request.user_profile_picture
        },
        toUser: {
          id: request.friend_id,
          name: request.friend_name,
          email: request.friend_email
        },
        status: request.status,
        createdAt: request.created_at
      }));
    } catch (error) {
      console.error('Error in getFriendRequests:', error);
      return [];
    }
  },

  // Get leaderboard
  async getLeaderboard(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_leaderboard', { user_uuid: userId });
      
      if (error) {
        console.error('Error getting leaderboard:', error);
        return [];
      }
      
      return (data || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profile_picture,
        totalXP: user.total_xp,
        currentLevel: user.current_level,
        isCurrentUser: user.is_current_user,
        rank: user.rank
      }));
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return [];
    }
  }
};

// Real-time subscriptions
export const subscriptionService = {
  // Subscribe to user changes
  subscribeToUserChanges(userId: string, callback: (user: User) => void) {
    return supabase
      .channel('user-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        (payload) => callback(payload.new as User)
      )
      .subscribe();
  },

  // Subscribe to friend requests
  subscribeToFriendRequests(userId: string, callback: (friendship: any) => void) {
    return supabase
      .channel('friend-requests')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'friends', filter: `friend_id=eq.${userId}` },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },

  // Subscribe to video changes
  subscribeToVideoChanges(userId: string, callback: (video: Video) => void) {
    return supabase
      .channel('video-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'videos', filter: `user_id=eq.${userId}` },
        (payload) => callback(payload.new as Video)
      )
      .subscribe();
  },

  // Unsubscribe from all channels
  unsubscribeAll() {
    supabase.removeAllChannels();
  }
};

// Auth helpers
export const authService = {
  // Sign in with custom token (for Google/Apple auth)
  async signInWithToken(token: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token
      });
      
      if (error) {
        console.error('Error signing in with token:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in signInWithToken:', error);
      return false;
    }
  },

  // Sign out
  async signOut(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in signOut:', error);
      return false;
    }
  },

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}; 

// Video Analysis Edge Function
export interface VideoAnalysisRequest {
  url: string;
  title?: string;
  description?: string;
  channel_name?: string;
  hashtags?: string[];
  platform?: 'youtube' | 'instagram' | 'tiktok' | 'other';
  user_level?: number;
}

export interface VideoAnalysisResponse {
  xp_awarded: number;
  quality_score: number;
  category: 'educational' | 'entertainment' | 'gaming' | 'productivity' | 'brain_rot' | 'other';
  analysis_reason: string;
  tags: string[];
  detailed_analysis: {
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
  recommendations: {
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

export const videoAnalysisService = {
  async analyzeVideo(request: VideoAnalysisRequest): Promise<VideoAnalysisResponse> {
    const { data, error } = await supabase.functions.invoke('analyze-video', {
      body: request
    });

    if (error) {
      throw new Error(`Video analysis failed: ${error.message}`);
    }

    return data as VideoAnalysisResponse;
  }
}; 