import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwjyzyiowhiqryhfoggq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3anl6eWlvd2hpcXJ5aGZvZ2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzU1MjEsImV4cCI6MjA2Nzk1MTUyMX0.mQU94zwhtbNeY6jd-byl2DcIFzXNNWlq-V6XoIFD6jU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          provider: 'google' | 'apple' | 'email';
          profile_picture?: string;
          current_xp: number;
          total_xp: number;
          current_level: number;
          last_active_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          provider: 'google' | 'apple' | 'email';
          profile_picture?: string;
          current_xp?: number;
          total_xp?: number;
          current_level?: number;
          last_active_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          provider?: 'google' | 'apple' | 'email';
          profile_picture?: string;
          current_xp?: number;
          total_xp?: number;
          current_level?: number;
          last_active_date?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url?: string;
          thumbnail_url?: string;
          platform?: 'youtube' | 'instagram' | 'tiktok' | 'other';
          duration?: number;
          views?: number;
          likes?: number;
          comments?: number;
          xp_awarded: number;
          quality_score?: number;
          category?: 'educational' | 'entertainment' | 'gaming' | 'productivity' | 'brain_rot' | 'other';
          date_watched: string;
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
          };
          recommendations?: {
            watch_duration: 'full' | 'partial' | 'skip' | 'moderate';
            best_time_to_watch: 'morning' | 'afternoon' | 'evening' | 'anytime' | 'avoid';
            frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
            alternatives: string[];
          };
          content_warnings?: string[];
          learning_objectives?: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url?: string;
          thumbnail_url?: string;
          platform?: 'youtube' | 'instagram' | 'tiktok' | 'other';
          duration?: number;
          views?: number;
          likes?: number;
          comments?: number;
          xp_awarded: number;
          quality_score?: number;
          category?: 'educational' | 'entertainment' | 'gaming' | 'productivity' | 'brain_rot' | 'other';
          date_watched: string;
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
          };
          recommendations?: {
            watch_duration: 'full' | 'partial' | 'skip' | 'moderate';
            best_time_to_watch: 'morning' | 'afternoon' | 'evening' | 'anytime' | 'avoid';
            frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
            alternatives: string[];
          };
          content_warnings?: string[];
          learning_objectives?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          thumbnail_url?: string;
          platform?: 'youtube' | 'instagram' | 'tiktok' | 'other';
          duration?: number;
          views?: number;
          likes?: number;
          comments?: number;
          xp_awarded?: number;
          quality_score?: number;
          category?: 'educational' | 'entertainment' | 'gaming' | 'productivity' | 'brain_rot' | 'other';
          date_watched?: string;
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
          };
          recommendations?: {
            watch_duration: 'full' | 'partial' | 'skip' | 'moderate';
            best_time_to_watch: 'morning' | 'afternoon' | 'evening' | 'anytime' | 'avoid';
            frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
            alternatives: string[];
          };
          content_warnings?: string[];
          learning_objectives?: string[];
        };
      };
      friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: 'pending' | 'accepted' | 'blocked';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: 'pending' | 'accepted' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: 'pending' | 'accepted' | 'blocked';
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type helpers
export type User = Database['public']['Tables']['users']['Row'];
export type Video = Database['public']['Tables']['videos']['Row'];
export type Friend = Database['public']['Tables']['friends']['Row'];

export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type VideoInsert = Database['public']['Tables']['videos']['Insert'];
export type FriendInsert = Database['public']['Tables']['friends']['Insert'];

export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type VideoUpdate = Database['public']['Tables']['videos']['Update'];
export type FriendUpdate = Database['public']['Tables']['friends']['Update']; 