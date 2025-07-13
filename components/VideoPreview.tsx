import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { Video } from '../stores/userStore';
import CustomIcon from './CustomIcon';
import CustomText from './CustomText';

interface VideoPreviewProps {
  video: Video;
  onDelete: () => void;
  onPress?: () => void;
}

const VideoPreview = ({ 
  video, 
  onDelete, 
  onPress
}: VideoPreviewProps) => {
  const { colors } = useThemeStore();

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views?: number) => {
    if (!views) return '';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'youtube': return '🎥';
      case 'instagram': return '📷';
      case 'tiktok': return '🎵';
      default: return '📺';
    }
  };

  const getXPColor = (xp: number) => {
    if (xp >= 3) return '#4CAF50';
    if (xp >= 1) return '#FF9800';
    if (xp === 0) return '#9E9E9E';
    return '#F44336';
  };

  const getXPGradient = (xp: number) => {
    if (xp >= 3) return ['#4CAF50', '#66BB6A'] as const;
    if (xp >= 1) return ['#FF9800', '#FFB74D'] as const;
    if (xp === 0) return ['#9E9E9E', '#BDBDBD'] as const;
    return ['#F44336', '#EF5350'] as const;
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'educational': return '🎓';
      case 'entertainment': return '🎬';
      case 'gaming': return '🎮';
      case 'productivity': return '💼';
      case 'brain_rot': return '🧠';
      default: return '📺';
    }
  };

  const getQualityColor = (score?: number) => {
    if (!score) return '#9E9E9E';
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FF5722';
    return '#F44336';
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Thumbnail Section */}
        <View style={styles.thumbnailContainer}>
          {video.thumbnailUrl ? (
            <Image 
              source={{ uri: video.thumbnailUrl }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnailPlaceholder, { backgroundColor: colors.border }]}>
              <CustomIcon name="videocam" size={32} color={colors.text} />
            </View>
          )}
          
          {/* Overlay Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)'] as const}
            style={styles.thumbnailOverlay}
          />
          
          {/* Duration badge */}
          {video.duration && (
            <View style={styles.durationBadge}>
              <CustomText fontSize="small" bold style={{ color: 'white' }}>
                {formatDuration(video.duration)}
              </CustomText>
            </View>
          )}
          
          {/* Platform badge */}
          {video.platform && (
            <View style={styles.platformBadge}>
              <CustomText fontSize="small">
                {getPlatformIcon(video.platform)}
              </CustomText>
            </View>
          )}

          {/* Quality Score Ring */}
          {video.quality_score && (
            <View style={[styles.qualityRing, { borderColor: getQualityColor(video.quality_score) }]}>
              <CustomText fontSize="small" bold style={{ color: getQualityColor(video.quality_score) }}>
                {video.quality_score}
              </CustomText>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.contentHeader}>
            <CustomText fontSize="normal" bold numberOfLines={2} style={styles.title}>
              {video.title}
            </CustomText>
            
            <Pressable onPress={onDelete} style={styles.deleteButton}>
              <CustomIcon name="delete" size={18} color={colors.text} />
            </Pressable>
          </View>
          
          {/* Stats row */}
          <View style={styles.statsRow}>
            {video.views && (
              <View style={styles.statItem}>
                <CustomIcon name="visibility" size={14} color={colors.text} />
                <CustomText fontSize="small" opacity={0.7}>
                  {formatViews(video.views)}
                </CustomText>
              </View>
            )}
            {video.duration && (
              <View style={styles.statItem}>
                <CustomIcon name="access-time" size={14} color={colors.text} />
                <CustomText fontSize="small" opacity={0.7} style={styles.statText}>
                  {formatDuration(video.duration)}
                </CustomText>
              </View>
            )}
          </View>

          {/* Badges row */}
          <View style={styles.badgeRow}>
            {video.category && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                <CustomText fontSize="small" style={{ color: colors.primary }}>
                  {getCategoryIcon(video.category)} {video.category}
                </CustomText>
              </View>
            )}
            
            <LinearGradient
              colors={getXPGradient(video.xp_awarded)}
              style={styles.xpBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <CustomText fontSize="small" bold style={{ color: 'white' }}>
                {video.xp_awarded > 0 ? '+' : ''}{video.xp_awarded} XP
              </CustomText>
            </LinearGradient>
          </View>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {video.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.tagBackground, borderColor: colors.tagBorder }]}>
                  <CustomText fontSize="small" style={{ color: colors.tagText }}>
                    {tag}
                  </CustomText>
                </View>
              ))}
              {video.tags.length > 3 && (
                <View style={[styles.tag, { backgroundColor: colors.border }]}>
                  <CustomText fontSize="small" opacity={0.6}>
                    +{video.tags.length - 3}
                  </CustomText>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qualityRing: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  deleteButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    // Add any specific styles for the text if needed
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  xpBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 60,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default VideoPreview;