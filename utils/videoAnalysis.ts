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
  scraped_data?: {
    description?: string;
    hashtags?: string[];
    channel_name?: string;
    keywords?: string[];
  };
}

export interface YouTubeScrapedData {
  title: string;
  description: string;
  hashtags: string[];
  channel_name: string;
  keywords: string[];
  views: number;
  likes: number;
  duration: string;
}

// Keywords for content classification
const EDUCATIONAL_KEYWORDS = [
  'tutorial', 'learn', 'education', 'course', 'lesson', 'teach', 'guide', 'how-to',
  'explained', 'science', 'math', 'programming', 'coding', 'study', 'university',
  'college', 'skill', 'training', 'workshop', 'lecture', 'documentary', 'knowledge',
  'academic', 'research', 'analysis', 'theory', 'concept', 'fundamentals', 'basics',
  'advanced', 'masterclass', 'certification', 'degree', 'diploma', 'textbook'
];

const PRODUCTIVITY_KEYWORDS = [
  'productivity', 'tips', 'advice', 'motivation', 'success', 'business', 'career',
  'entrepreneurship', 'finance', 'investment', 'self-improvement', 'habits',
  'time-management', 'organization', 'planning', 'goals', 'mindset', 'leadership',
  'strategy', 'efficiency', 'optimization', 'workflow', 'discipline', 'focus',
  'achievement', 'performance', 'growth', 'development', 'professional'
];

const GAMING_KEYWORDS = [
  'game', 'gaming', 'gameplay', 'gamer', 'play', 'stream', 'twitch', 'esports',
  'fortnite', 'minecraft', 'valorant', 'league', 'cod', 'fps', 'mmo', 'rpg', 'live stream',
  'speedrun', 'walkthrough', 'playthrough', 'boss fight', 'pvp', 'multiplayer',
  'console', 'pc gaming', 'mobile gaming', 'indie game', 'aaa game', 'beta test'
];

const BRAIN_ROT_KEYWORDS = [
  'reaction', 'react', 'funny', 'meme', 'viral', 'tiktok', 'shorts', 'cringe',
  'drama', 'gossip', 'celebrity', 'influencer', 'prank', 'challenge', 'trend',
  'compilation', 'fails', 'satisfying video', 'brain rot', 'mindless', 'clickbait',
  'outrageous', 'shocking', 'crazy', 'insane', 'wild', 'unbelievable', 'you won\'t believe',
  'gone wrong', 'gone sexual', 'exposed', 'destroyed', 'roasted', 'owned'
];

const ENTERTAINMENT_KEYWORDS = [
  'entertainment', 'movie', 'music', 'song', 'comedy', 'show', 'series', 'tv',
  'film', 'actor', 'artist', 'band', 'concert', 'performance', 'review', 'vlog',
  'podcast', 'interview', 'behind the scenes', 'trailer', 'preview', 'premiere'
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

export function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function scrapeYouTubeContent(url: string): Promise<YouTubeScrapedData | null> {
  try {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;

    // Use a more reliable CORS proxy with fallback
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];
    
    let response: Response | null = null;
    let lastError: Error | null = null;
    
    // Try multiple proxy URLs
    for (const proxyUrl of proxyUrls) {
      try {
        // Create a timeout controller for React Native compatibility
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          break; // Success, exit the loop
        }
        
        response = null;
      } catch (error) {
        lastError = error as Error;
        console.log(`Failed to fetch from ${proxyUrl}:`, error);
        continue; // Try next proxy
      }
    }

    if (!response || !response.ok) {
      console.log('All proxy attempts failed, falling back to basic analysis');
      return null;
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : '';

    // Extract description from meta tag
    const descriptionMatch = html.match(/<meta name="description" content="([^"]+)"/);
    const description = descriptionMatch ? descriptionMatch[1] : '';

    // Extract keywords from meta tag
    const keywordsMatch = html.match(/<meta name="keywords" content="([^"]+)"/);
    const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [];

    // Extract hashtags from description and title
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const hashtags = [...(title.match(hashtagRegex) || []), ...(description.match(hashtagRegex) || [])];

    // Extract channel name
    const channelMatch = html.match(/"ownerChannelName":"([^"]+)"/);
    const channel_name = channelMatch ? channelMatch[1] : '';

    // Extract view count
    const viewsMatch = html.match(/"viewCount":"(\d+)"/);
    const views = viewsMatch ? parseInt(viewsMatch[1]) : 0;

    // Extract like count (approximate)
    const likesMatch = html.match(/"likeCount":"(\d+)"/);
    const likes = likesMatch ? parseInt(likesMatch[1]) : 0;

    // Extract duration
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
    const duration = durationMatch ? durationMatch[1] : '0';

    return {
      title,
      description,
      hashtags,
      channel_name,
      keywords,
      views,
      likes,
      duration
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error scraping YouTube content:', errorMessage);
    
    // Handle specific error types
    if (errorMessage.includes('AbortError') || errorMessage.includes('Aborted')) {
      console.log('Request timed out, falling back to basic analysis');
    } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      console.log('Network error, falling back to basic analysis');
    }
    
    return null;
  }
}

export function analyzeContentFromScrapedData(
  url: string, 
  scrapedData?: YouTubeScrapedData | null,
  fallbackTitle?: string
): {
  category: Video['category'];
  xp_awarded: number;
  quality_score: number;
  analysis: VideoAnalysisResult['analysis'];
} {
  // Combine all available text for analysis
  const contentSources = [
    url,
    scrapedData?.title || fallbackTitle || '',
    scrapedData?.description || '',
    scrapedData?.channel_name || '',
    ...(scrapedData?.hashtags || []),
    ...(scrapedData?.keywords || [])
  ];
  
  const content = contentSources.join(' ').toLowerCase();
  
  // Enhanced scoring based on multiple factors
  let educationalScore = 0;
  let productivityScore = 0;
  let brainRotScore = 0;
  let gamingScore = 0;
  let entertainmentScore = 0;

  // Count keyword matches with different weights
  EDUCATIONAL_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword)) {
      educationalScore += scrapedData?.hashtags?.some(tag => tag.toLowerCase().includes(keyword)) ? 3 : 1;
    }
  });

  PRODUCTIVITY_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword)) {
      productivityScore += scrapedData?.hashtags?.some(tag => tag.toLowerCase().includes(keyword)) ? 3 : 1;
    }
  });

  BRAIN_ROT_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword)) {
      brainRotScore += scrapedData?.hashtags?.some(tag => tag.toLowerCase().includes(keyword)) ? 3 : 1;
    }
  });

  GAMING_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword)) {
      gamingScore += scrapedData?.hashtags?.some(tag => tag.toLowerCase().includes(keyword)) ? 3 : 1;
    }
  });

  ENTERTAINMENT_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword)) {
      entertainmentScore += scrapedData?.hashtags?.some(tag => tag.toLowerCase().includes(keyword)) ? 2 : 1;
    }
  });

  // Additional factors for YouTube
  if (scrapedData) {
    // Channel reputation boost for educational channels
    const educationalChannels = ['khan academy', 'crash course', 'ted', 'mit', 'stanford', 'harvard'];
    if (educationalChannels.some(channel => scrapedData.channel_name.toLowerCase().includes(channel))) {
      educationalScore += 5;
    }

    // Boost for longer content (usually more educational)
    const durationSeconds = parseInt(scrapedData.duration);
    if (durationSeconds > 600) { // 10+ minutes
      educationalScore += 1;
      productivityScore += 1;
    }

    // Penalize very short content (often low quality)
    if (durationSeconds < 60) { // Less than 1 minute
      brainRotScore += 2;
    }

    // High view count with low educational content might be brain rot
    if (scrapedData.views > 1000000 && educationalScore === 0 && productivityScore === 0) {
      brainRotScore += 1;
    }
  }

  // Determine category based on highest score
  const scores = [
    { category: 'educational', score: educationalScore, xp: 3, quality: 85 },
    { category: 'productivity', score: productivityScore, xp: 2, quality: 75 },
    { category: 'brain_rot', score: brainRotScore, xp: -3, quality: 15 },
    { category: 'gaming', score: gamingScore, xp: -2, quality: 25 },
    { category: 'entertainment', score: entertainmentScore, xp: 0, quality: 45 }
  ];

  const topScore = scores.reduce((max, current) => 
    current.score > max.score ? current : max
  );

  // If no clear category, default to neutral
  if (topScore.score === 0) {
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

  // Generate analysis based on category
  const analysisReasons = {
    educational: 'Educational content detected - promotes learning and skill development',
    productivity: 'Productivity-focused content - helps improve efficiency and success',
    brain_rot: 'Brain rot content - provides no value and wastes time',
    gaming: 'Gaming content - potential time waste and distraction from productive activities',
    entertainment: 'Entertainment content - neutral value, okay in moderation'
  };

  return {
    category: topScore.category as Video['category'],
    xp_awarded: topScore.xp,
    quality_score: topScore.quality,
    analysis: {
      is_educational: topScore.category === 'educational' || topScore.category === 'productivity',
      is_brain_rot: topScore.category === 'brain_rot' || topScore.category === 'gaming',
      content_quality: topScore.quality >= 70 ? 'high' : topScore.quality >= 40 ? 'medium' : 'low',
      reason: analysisReasons[topScore.category as keyof typeof analysisReasons]
    }
  };
}

export function analyzeContentFromUrl(url: string, title?: string): {
  category: Video['category'];
  xp_awarded: number;
  quality_score: number;
  analysis: VideoAnalysisResult['analysis'];
} {
  // Fallback to URL-based analysis if scraping fails
  return analyzeContentFromScrapedData(url, null, title);
}

export async function generateEnhancedVideoAnalysis(url: string): Promise<VideoAnalysisResult> {
  const platform = extractPlatformFromUrl(url);
  let scrapedData: YouTubeScrapedData | null = null;
  
  // Try to scrape YouTube content
  if (platform === 'youtube') {
    try {
      scrapedData = await scrapeYouTubeContent(url);
    } catch (error) {
      console.error('Failed to scrape YouTube content:', error);
    }
  }
  
  // Analyze content with scraped data
  const contentAnalysis = analyzeContentFromScrapedData(url, scrapedData);
  
  // Use scraped data if available, otherwise generate mock data
  const title = scrapedData?.title || generateMockTitle(platform, url);
  const duration = scrapedData ? parseInt(scrapedData.duration) : Math.floor(Math.random() * 1800) + 60;
  const views = scrapedData?.views || Math.floor(Math.random() * 1000000) + 1000;
  const likes = scrapedData?.likes || Math.floor(Math.random() * 50000) + 100;
  
  return {
    url,
    title,
    platform,
    ...contentAnalysis,
    duration,
    views,
    likes,
    comments: Math.floor(Math.random() * 5000) + 10,
    scraped_data: scrapedData ? {
      description: scrapedData.description,
      hashtags: scrapedData.hashtags,
      channel_name: scrapedData.channel_name,
      keywords: scrapedData.keywords
    } : undefined
  };
}

function generateMockTitle(platform: 'youtube' | 'instagram' | 'tiktok' | 'other', url: string): string {
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
      'Ultimate Valorant Fails Compilation',
      'Advanced Python Programming Course',
      'Financial Independence Explained',
      'Cringe TikTok Compilation #47',
      'Among Us But Everything is Chaos'
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
  return titles[Math.floor(Math.random() * titles.length)];
}

export function generateMockVideoData(url: string): VideoAnalysisResult {
  const platform = extractPlatformFromUrl(url);
  const title = generateMockTitle(platform, url);
  const contentAnalysis = analyzeContentFromUrl(url, title);
  
  return {
    url,
    title,
    platform,
    ...contentAnalysis,
    duration: Math.floor(Math.random() * 1800) + 60,
    views: Math.floor(Math.random() * 1000000) + 1000,
    likes: Math.floor(Math.random() * 50000) + 100,
    comments: Math.floor(Math.random() * 5000) + 10,
  };
}

export function calculateDailyDecay(): number {
  return 4;
}

export function getXPRequirements(): number[] {
  return [5, 10, 20, 35, 50, 75];
}

export function getTotalXPForMaxLevel(): number {
  return getXPRequirements().reduce((sum, xp) => sum + xp, 0);
}

export function applyAdvancedXPSystem(baseXP: number, userLevel: number): number {
  // Early levels (0-4): Never give negative XP – minimum of +1.
  if (userLevel < 5) {
    if (baseXP >= 3) return 4;   // Exceptional content
    if (baseXP >= 2) return 3;   // Great content
    if (baseXP >= 1) return 2;   // Good content
    // Anything neutral or negative still awards +1 to keep users motivated
    return 1;
  }

  // Advanced levels (5+): Negative XP possible
  if (baseXP >= 3) return 2;   // Exceptional still gives +2
  if (baseXP >= 1) return 1;   // Decent gives +1
  if (baseXP === 0) return -1; // Neutral gets slight penalty
  return -2;                   // Low quality / brain-rot gets bigger penalty
}

export function getXPDescription(xp: number, userLevel: number): string {
  if (userLevel < 5) {
    switch (xp) {
      case 4: return "Exceptional content";
      case 3: return "Educational content";
      case 2: return "Productivity content";
      case 1: return "Neutral content";
      case 0: return "Entertainment content";
      case -1: return "Mild negative content";
      case -2: return "Gaming content";
      case -3: return "Brain rot content";
      default: return "Standard content";
    }
  } else {
    switch (xp) {
      case 3: return "Excellent educational content";
      case 2: return "Good productivity content";
      case 1: return "Standard content";
      case -1: return "Content below standards";
      case -2: return "Time-wasting content";
      case -3: return "Gaming penalty";
      case -4: return "Brain rot - major penalty";
      default: return "Standard content";
    }
  }
}

// Helper function to convert VideoAnalysisResult to Video format for the store
export function convertAnalysisResultToVideo(result: VideoAnalysisResult): Omit<Video, 'id' | 'date_watched'> {
  return {
    title: result.title,
    url: result.url,
    thumbnailUrl: undefined, // Could be extracted from YouTube API in the future
    platform: result.platform,
    duration: result.duration,
    views: result.views,
    likes: result.likes,
    comments: result.comments,
    xp_awarded: result.xp_awarded,
    quality_score: result.quality_score,
    category: result.category,
    analysis_reason: result.analysis.reason,
    scraped_data: result.scraped_data,
    created_at: new Date().toISOString()
  };
} 