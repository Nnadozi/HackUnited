import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Clipboard, Image, StyleSheet, View } from 'react-native';
import CustomText from '../../components/CustomText';
import Page from '../../components/Page';
import VideoAddConfirmationModal from '../../components/VideoAddConfirmationModal';
import { videoAnalysisService } from '../../lib/supabaseService';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import { extractPlatformFromUrl } from '../../utils/videoAnalysis';

function getVideoId(url: string, platform: string): string | null {
  switch (platform) {
    case 'youtube':
      const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
      return youtubeMatch ? youtubeMatch[1] : null;
    case 'instagram':
      const instagramMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([^\/\?]+)/);
      return instagramMatch ? instagramMatch[1] : null;
    case 'tiktok':
      const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
      return tiktokMatch ? tiktokMatch[1] : null;
    default:
      return null;
  }
}

function getThumbnailUrl(url: string, platform: string): string | undefined {
  const videoId = getVideoId(url, platform);
  if (!videoId) return undefined;

  switch (platform) {
    case 'youtube':
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    case 'instagram':
      return `https://www.instagram.com/p/${videoId}/media/?size=l`;
    case 'tiktok':
      return `https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/${videoId}`;
    default:
      return undefined;
  }
}

// New helper to decode HTML entities
function decodeHtmlEntities(text: string) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'");
}

// New helper to fetch duration & views for supported platforms
async function fetchMetadata(videoUrl: string, platform: string): Promise<{ duration?: number; views?: number }> {
  try {
    switch (platform) {
      case 'youtube': {
        // Fetch raw HTML (RN has no CORS restrictions)
        const res = await fetch(videoUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          },
        });
        const html = await res.text();
        const durMatch = html.match(/"lengthSeconds":"(\d+)"/);
        const viewsMatch = html.match(/"viewCount":"(\d+)"/);
        return {
          duration: durMatch ? parseInt(durMatch[1], 10) : undefined,
          views: viewsMatch ? parseInt(viewsMatch[1], 10) : undefined,
        };
      }
      case 'instagram': {
        const res = await fetch(videoUrl);
        const html = await res.text();
        // Duration
        let duration: number | undefined;
        const durMeta = html.match(/property="og:video:duration" content="(\d+)"/);
        if (durMeta) duration = parseInt(durMeta[1], 10);
        // Views (fallback to video_view_count JSON)
        let views: number | undefined;
        const viewsMatch = html.match(/"video_view_count":(\d+)/) || html.match(/"play_count":(\d+)/);
        if (viewsMatch) views = parseInt(viewsMatch[1], 10);
        return { duration, views };
      }
      default:
        return {};
    }
  } catch {
    return {};
  }
}

export default function AddVideoScreen() {
  const { colors } = useThemeStore();
  const theme = colors;
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState('');
  const [xpGiven, setXpGiven] = useState<number | null>(null);
  const [xpReason, setXpReason] = useState<string>('');
  const addVideo = useUserStore((s) => s.addVideo);
  const userLevel = useUserStore((s) => s.user?.currentLevel || 1);

  const platform = extractPlatformFromUrl(url);
  const videoId = getVideoId(url, platform);
  const thumbnail = getThumbnailUrl(url, platform);

  // Fetch video title from various platforms
  const fetchTitle = async (videoUrl: string, platform: string) => {
    try {
      switch (platform) {
        case 'youtube':
          const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
          if (!res.ok) return '';
          const data = await res.json();
          return data.title || '';
        case 'instagram':
          // Attempt to produce a cleaner caption from page meta
          try {
            const response = await fetch(videoUrl);
            const html = await response.text();
            // The og:description meta contains likes/comments - user on date: "caption"
            const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
            if (descMatch) {
              let raw = descMatch[1];
              // Remove leading likes/comments and author/date section before the colon
              const afterColon = raw.includes(':') ? raw.split(':').slice(1).join(':').trim() : raw;
              const cleaned = decodeHtmlEntities(afterColon).replace(/^\"|\"$/g, '').trim();
              if (cleaned.length > 0) return cleaned;
            }
            return `Instagram Post ${videoId}`;
          } catch {
            return `Instagram Post ${videoId}`;
          }
        case 'tiktok':
          // TikTok doesn't have a public oEmbed API, so we'll extract from URL
          const tiktokMatch = videoUrl.match(/tiktok\.com\/@([^\/]+)\/video\/(\d+)/);
          return tiktokMatch ? `TikTok Video by @${tiktokMatch[1]}` : '';
        default:
          return '';
      }
    } catch {
      return '';
    }
  };

  const handleUrlChange = async (val: string) => {
    setUrl(val);
    setError('');
    const platform = extractPlatformFromUrl(val);
    if (getVideoId(val, platform)) {
      const fetchedTitle = await fetchTitle(val, platform);
      setTitle(fetchedTitle);
    } else {
      setTitle('');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent && clipboardContent.trim()) {
        setUrl(clipboardContent);
        handleUrlChange(clipboardContent);
      } else {
        Alert.alert('Clipboard Empty', 'There is no content in your clipboard to paste.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const validateUrl = (val: string) => {
    const platform = extractPlatformFromUrl(val);
    return !!getVideoId(val, platform);
  };

  const handleAdd = async () => {
    if (!validateUrl(url)) {
      Alert.alert('Invalid URL', 'Please enter a valid YouTube, Instagram, or TikTok URL.');
      return;
    }
    
    setLoading(true);
    setError('');
    setLoadingStep('Fetching video metadata...');

    // Gather additional metadata (duration & views)
    const { duration: fetchedDuration, views: fetchedViews } = await fetchMetadata(url, platform);

    setLoadingStep('Analyzing video content...');
    
    try {
      // Extract platform and scrape data
      const platform = extractPlatformFromUrl(url);
      
      // Let the server-side edge function handle all scraping to avoid CORS issues
      setLoadingStep('Running AI analysis...');
      
      // Use the edge function for AI analysis (server will handle scraping)
      const analysisResult = await videoAnalysisService.analyzeVideo({
        url,
        title: title || '',
        description: '',
        channel_name: '',
        hashtags: [],
        platform,
        user_level: userLevel
      });

      // Log the AI analysis result
      console.log('🎯 AI Analysis Result:', JSON.stringify(analysisResult, null, 2));

      setLoadingStep('Saving video...');

      // Create video object with adjusted XP
      const videoData = {
        title: title || url,
        xp_awarded: analysisResult.xp_awarded || 0,
        url,
        thumbnailUrl: thumbnail,
        platform,
        duration: fetchedDuration,
        views: fetchedViews,
        likes: undefined,
        comments: Math.floor(Math.random() * 5000) + 10,
        quality_score: analysisResult.quality_score,
        category: analysisResult.category,
        analysis_reason: analysisResult.analysis_reason,
        tags: analysisResult.tags,
        detailed_analysis: analysisResult.detailed_analysis,
        scraped_data: undefined,
        created_at: new Date().toISOString()
      };

      console.log('💾 Saving video data:', JSON.stringify(videoData, null, 2));

      addVideo(videoData);
      
      setXpGiven(analysisResult.xp_awarded || 0);
      setXpReason(analysisResult.analysis_reason);
      // Don't reset URL and title - keep preview visible until user pastes another URL
      // setUrl('');
      // setTitle('');
      setSuccess(true);
    } catch (e) {
      console.error('❌ Error adding video:', e);
      Alert.alert('Failed to add video', 'Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const closeModal = () => {
    setSuccess(false);
    setXpGiven(null);
    setXpReason('');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return '🎥';
      case 'instagram': return '📷';
      case 'tiktok': return '🎵';
      default: return '📺';
    }
  };

  return (
    <Page style={{ justifyContent: 'flex-start', paddingHorizontal: 20 }}>  
      <CustomText style={{alignSelf: 'flex-start'}} fontSize="large" bold opacity={0.75}>Add Video</CustomText>
      
      <View style={[styles.card,{backgroundColor: colors.card, borderColor: colors.border}]}> 
        <CustomText opacity={0.5} style={{marginBottom: 10, alignSelf: 'center'}}>Video Preview</CustomText>
        
        {platform && (
          <View style={[styles.platformBadge, { backgroundColor: theme.tagBackground, borderColor: theme.tagBorder }]}>
            <CustomText fontSize="small" bold style={{ color: theme.tagText }}>{getPlatformIcon(platform)} {platform.toUpperCase()}</CustomText>
          </View>
        )}
        
        <View style={[styles.previewThumb,{backgroundColor: colors.border}]}> 
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={{ width: '100%', height: 100, borderRadius: 10 }} resizeMode="cover" />
          ) : (
            <CustomText fontSize="small" opacity={0.5}>Thumbnail</CustomText>
          )}
        </View>
        {title && (
          <CustomText primary fontSize='small' bold numberOfLines={2} textAlign='center' opacity={0.75}>{title || 'Video Title Here...'}</CustomText>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <CustomInput
            placeholder="Video URL (YouTube, Instagram, TikTok)"
            value={url}
            onChangeText={handleUrlChange}
            style={{
              ...styles.urlInput,
              color: colors.text,
              backgroundColor: colors.background,
              borderColor: colors.border 
            }}
            width="100%"
            placeholderTextColor={colors.text + '80'}
          />
        </View>
        <CustomButton
          title="Paste"
          onPress={handlePasteFromClipboard}
          style={styles.pasteButton}
          width={90}
        />
      </View>
      
      <CustomButton
        title={loading ? loadingStep : "Add Video"}
        onPress={handleAdd}
        disabled={loading}
        isLoading={loading}
        style={{marginTop: 10}}
      />
      
      <CustomText primary bold fontSize="small" opacity={0.75} style={{marginTop: 10,marginLeft: 10}}>
        Supported platforms: YouTube, Instagram, TikTok
      </CustomText>
      
      <VideoAddConfirmationModal
        visible={success}
        xpGiven={xpGiven}
        xpReason={xpReason}
        onClose={closeModal}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  previewCard: { width: '90%', backgroundColor: '#2EC4F1', borderRadius: 16, padding: 20, marginTop: 8, alignItems: 'center' },
  videoThumb: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#fff', marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  videoTitle: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: '100%', marginTop: 8 },
  urlLabel: { marginTop: 32, marginBottom: 8, alignSelf: 'center' },
  addBtn: { width: '90%', backgroundColor: '#2EC4F1', borderRadius: 16, paddingVertical: 18, alignItems: 'center', position: 'absolute', bottom: 200, alignSelf: 'center' },
  card: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 20, 
    padding: 20, 
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 10, 
    elevation: 4, 
    borderWidth: 0,
  },
  previewThumb: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  platformBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  urlInput: {
    minHeight: 50,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  pasteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 70,
    height: 50,
  },
}); 