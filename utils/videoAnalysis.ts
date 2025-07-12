import { Video } from '../stores/userStore';

export interface VideoAnalysisResult {
  url: string;
  title: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'other';
  category: Video['category'];
  xp_awarded: number;
  quality_score: number;
  analysis: {
    is_educational: boolean;
    is_brain_rot: boolean;
    content_quality: 'high' | 'medium' | 'low';
    reason: string;
  };
  duration?: number;
  views?: number;
  likes?: number;
  comments?: number;
}

// Keywords for content classification
const EDUCATIONAL_KEYWORDS = [
  'tutorial', 'learn', 'education', 'course', 'lesson', 'teach', 'guide', 'how-to',
  'explained', 'science', 'math', 'programming', 'coding', 'study', 'university',
  'college', 'skill', 'training', 'workshop', 'lecture', 'documentary'
];

const PRODUCTIVITY_KEYWORDS = [
  'productivity', 'tips', 'advice', 'motivation', 'success', 'business', 'career',
  'entrepreneurship', 'finance', 'investment', 'self-improvement', 'habits',
  'time-management', 'organization', 'planning', 'goals', 'mindset'
];

const GAMING_KEYWORDS = [
  'game', 'gaming', 'gameplay', 'gamer', 'play', 'stream', 'twitch', 'esports',
  'fortnite', 'minecraft', 'valorant', 'league', 'cod', 'fps', 'mmo', 'rpg', 'live stream'
];

const BRAIN_ROT_KEYWORDS = [
  'reaction', 'react', 'funny', 'meme', 'viral', 'tiktok', 'shorts', 'cringe',
  'drama', 'gossip', 'celebrity', 'influencer', 'prank', 'challenge', 'trend',
  'compilation', 'fails', 'satisfying video'
];

const ENTERTAINMENT_KEYWORDS = [
  'entertainment', 'movie', 'music', 'song', 'comedy', 'show', 'series', 'tv',
  'film', 'actor', 'artist', 'band', 'concert', 'performance', 'review', 'vlog'
];

export function extractPlatformFromUrl(url: string): 'youtube' | 'instagram' | 'tiktok' | 'other' {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  } else if (urlLower.includes('instagram.com')) {
    return 'instagram';
  } else if (urlLower.includes('tiktok.com')) {
    return 'tiktok';
  }
  
  return 'other';
}

export function analyzeContentFromUrl(url: string, title?: string): {
  category: Video['category'];
  xp_awarded: number;
  quality_score: number;
  analysis: VideoAnalysisResult['analysis'];
} {
  const content = (url + ' ' + (title || '')).toLowerCase();
  
  // Check for educational content
  if (EDUCATIONAL_KEYWORDS.some(keyword => content.includes(keyword))) {
    return {
      category: 'educational',
      xp_awarded: 3,
      quality_score: 85,
      analysis: {
        is_educational: true,
        is_brain_rot: false,
        content_quality: 'high',
        reason: 'Educational content detected - promotes learning and skill development'
      }
    };
  }
  
  // Check for productivity content
  if (PRODUCTIVITY_KEYWORDS.some(keyword => content.includes(keyword))) {
    return {
      category: 'productivity',
      xp_awarded: 2,
      quality_score: 75,
      analysis: {
        is_educational: true,
        is_brain_rot: false,
        content_quality: 'high',
        reason: 'Productivity-focused content - helps improve efficiency and success'
      }
    };
  }
  
  // Check for brain rot content (higher priority than gaming)
  if (BRAIN_ROT_KEYWORDS.some(keyword => content.includes(keyword))) {
    return {
      category: 'brain_rot',
      xp_awarded: -3,
      quality_score: 15,
      analysis: {
        is_educational: false,
        is_brain_rot: true,
        content_quality: 'low',
        reason: 'Brain rot content - provides no value and wastes time'
      }
    };
  }
  
  // Check for gaming content
  if (GAMING_KEYWORDS.some(keyword => content.includes(keyword))) {
    return {
      category: 'gaming',
      xp_awarded: -2,
      quality_score: 25,
      analysis: {
        is_educational: false,
        is_brain_rot: true,
        content_quality: 'low',
        reason: 'Gaming content - potential time waste and distraction from productive activities'
      }
    };
  }
  
  // Check for entertainment content
  if (ENTERTAINMENT_KEYWORDS.some(keyword => content.includes(keyword))) {
    return {
      category: 'entertainment',
      xp_awarded: 0,
      quality_score: 45,
      analysis: {
        is_educational: false,
        is_brain_rot: false,
        content_quality: 'medium',
        reason: 'Entertainment content - neutral value, okay in moderation'
      }
    };
  }
  
  // Default categorization
  return {
    category: 'other',
    xp_awarded: 1,
    quality_score: 50,
    analysis: {
      is_educational: false,
      is_brain_rot: false,
      content_quality: 'medium',
      reason: 'Standard content - neutral impact'
    }
  };
}

export function generateMockVideoData(url: string): VideoAnalysisResult {
  const platform = extractPlatformFromUrl(url);
  
  // Generate mock title based on platform and URL
  const mockTitles = {
    youtube: [
      'How to Build Better Habits in 2024',
      'React Native Tutorial for Beginners',
      'Productivity Tips That Actually Work',
      'Gaming Highlights Compilation',
      'Funny Reaction to Viral Video',
      'Learn JavaScript in 10 Minutes',
      'Daily Vlog - My Morning Routine',
      'Cooking Tutorial: Easy Recipes',
      'Minecraft Live Stream - Part 3',
      'My Top 10 Brain Rot Memes of the Week',
      'Ultimate Valorant Fails Compilation'
    ],
    instagram: [
      'Quick Productivity Tip',
      'Daily Motivation Quote',
      'Behind the Scenes of my Gaming Setup',
      'Workout Routine Demo',
      'Food Recipe Reel',
      'Cringe Prank on my Friend',
      'Fashion Inspiration',
      'Art Process Video'
    ],
    tiktok: [
      'Life Hack You Need to Know',
      'New Viral Dance Challenge Video',
      'Cooking Hack in 60 Seconds',
      'Study Tips for Students',
      'Funny Pet Compilation',
      'DIY Home Decor Idea',
      'Satisfying Video Compilation',
      'Get Ready With Me for a Gaming Marathon'
    ],
    other: [
      'Interesting Video Content',
      'Educational Material',
      'Entertainment Content',
      'Tutorial Video',
      'Review and Analysis',
      'Documentary Clip',
      'News Update',
      'Informative Content'
    ]
  };
  
  const titles = mockTitles[platform];
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  const contentAnalysis = analyzeContentFromUrl(url, title);
  
  return {
    url,
    title,
    platform,
    ...contentAnalysis,
    duration: Math.floor(Math.random() * 1800) + 60, // 1-30 minutes
    views: Math.floor(Math.random() * 1000000) + 1000,
    likes: Math.floor(Math.random() * 50000) + 100,
    comments: Math.floor(Math.random() * 5000) + 10,
  };
}

export function calculateDailyDecay(): number {
  // Equivalent to losing 2 average videos (2 XP each)
  return 4;
}

export function getXPRequirements(): number[] {
  return [5, 10, 20, 35, 50, 75]; // Level 0-5
}

export function getTotalXPForMaxLevel(): number {
  return getXPRequirements().reduce((sum, xp) => sum + xp, 0);
} 