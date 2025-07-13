import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { useThemeStore } from '../stores/themeStore';
import { Video } from '../stores/userStore';
import CustomIcon from './CustomIcon';
import CustomText from './CustomText';

interface VideoDetailModalProps {
  visible: boolean;
  video: Video | null;
  onClose: () => void;
}

const QualityDial = ({ score }: { score: number }) => {
  const { colors } = useThemeStore();
  const radius = 70;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={styles.dialContainer}>
      <Svg width={160} height={160} style={styles.dial}>
        <Defs>
          <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#F44336" />
            <Stop offset="25%" stopColor="#FF9800" />
            <Stop offset="50%" stopColor="#FFC107" />
            <Stop offset="75%" stopColor="#8BC34A" />
            <Stop offset="100%" stopColor="#4CAF50" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={80}
          cy={80}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.2}
        />
        
        {/* Progress circle */}
        <Circle
          cx={80}
          cy={80}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 80 80)`}
        />
      </Svg>
      
      <View style={styles.dialCenter}>
                 <CustomText fontSize="XL" bold>{score}</CustomText>
        <CustomText fontSize="small" opacity={0.7}>Quality Score</CustomText>
      </View>
    </View>
  );
};

export default function VideoDetailModal({ visible, video, onClose }: VideoDetailModalProps) {
  const { colors } = useThemeStore();

  if (!video) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views?: number) => {
    if (!views) return 'Unknown';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
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

  const capitalizeFirstLetter = (str?: string) => {
    if (!str) return 'Other';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
                 <LinearGradient
           colors={[colors.primary, colors.primary + 'CC'] as const}
           style={styles.header}
         >
          <CustomText fontSize="large" bold style={{ color: 'white' }}>Video Analysis</CustomText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <CustomIcon name="close" size={24} color="white" />
          </Pressable>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={[styles.titleContainer, { backgroundColor: colors.card }]}>
            <CustomText fontSize="large" bold style={styles.title}>
              {video.title}
            </CustomText>
          </View>

          {/* Quality Dial and XP/Category */}
          <View style={[styles.topSection, { backgroundColor: colors.card }]}>
            <QualityDial score={video.quality_score || 0} />
            
            <View style={styles.rightSection}>
              {/* Centered XP Badge */}
              <View style={styles.xpContainer}>
                <LinearGradient
                  colors={getXPGradient(video.xp_awarded)}
                  style={styles.xpBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <CustomText fontSize="normal" bold style={{ color: 'white' }}>
                    {video.xp_awarded > 0 ? '+' : ''}{video.xp_awarded} XP
                  </CustomText>
                </LinearGradient>
              </View>
              
              {/* Category Badge */}
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                <CustomText fontSize="small" bold style={{ color: colors.primary, textAlign: 'center' }}>
                  {getCategoryIcon(video.category)} {capitalizeFirstLetter(video.category)}
                </CustomText>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={[styles.statsGrid, { backgroundColor: colors.card }]}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <CustomIcon name="computer" size={16} color={colors.text} />
                <CustomText fontSize="small" opacity={0.7}>Platform</CustomText>
                <CustomText bold>{video.platform?.toUpperCase() || 'Unknown'}</CustomText>
              </View>
              <View style={styles.statItem}>
                <CustomIcon name="access-time" size={16} color={colors.text} />
                <CustomText fontSize="small" opacity={0.7}>Duration</CustomText>
                <CustomText bold>{formatDuration(video.duration)}</CustomText>
              </View>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <CustomIcon name="visibility" size={16} color={colors.text} />
                <CustomText fontSize="small" opacity={0.7}>Views</CustomText>
                <CustomText bold>{formatViews(video.views)}</CustomText>
              </View>
              <View style={styles.statItem}>
                <CustomIcon name="date-range" size={16} color={colors.text} />
                <CustomText fontSize="small" opacity={0.7}>Added</CustomText>
                <CustomText bold>{new Date(video.created_at).toLocaleDateString()}</CustomText>
              </View>
            </View>
          </View>

          {/* Detailed Analysis Breakdown */}
          {video.detailed_analysis && Object.keys(video.detailed_analysis).length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <CustomText fontSize="normal" bold style={styles.sectionTitle}>
                📊 Quality Breakdown
              </CustomText>
              <View style={styles.analysisGrid}>
                {Object.entries(video.detailed_analysis)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, value]) => (
                  <View key={key} style={styles.analysisItem}>
                    <CustomText fontSize="small" opacity={0.7} style={styles.analysisLabel}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </CustomText>
                    <View style={styles.analysisBarContainer}>
                      <View style={[styles.analysisBar, { backgroundColor: colors.border }]}>
                                                 <LinearGradient
                           colors={value >= 70 ? ['#4CAF50', '#66BB6A'] as const : value >= 40 ? ['#FF9800', '#FFB74D'] as const : ['#F44336', '#EF5350'] as const}
                           style={[styles.analysisBarFill, { width: `${value}%` }]}
                           start={{ x: 0, y: 0 }}
                           end={{ x: 1, y: 0 }}
                         />
                      </View>
                      <CustomText fontSize="small" bold style={styles.analysisValue}>
                        {value}%
                      </CustomText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Analysis Reason */}
          {video.analysis_reason && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <CustomText fontSize="normal" bold style={styles.sectionTitle}>
                🔍 Analysis Reason
              </CustomText>
              <CustomText fontSize="small" opacity={0.8} style={styles.reasonText}>
                {video.analysis_reason}
              </CustomText>
            </View>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <CustomText fontSize="normal" bold style={styles.sectionTitle}>
                🏷️ Tags
              </CustomText>
              <View style={styles.tagsContainer}>
                {video.tags.map((tag, index) => (
                  <LinearGradient
                    key={index}
                    colors={[colors.primary + '20', colors.primary + '10'] as const}
                    style={[styles.tag, { borderColor: colors.primary + '40' }]}
                  >
                    <CustomText fontSize="small" style={{ color: colors.primary }}>
                      #{tag}
                    </CustomText>
                  </LinearGradient>
                ))}
              </View>
            </View>
          )}

          {/* Recommendations */}
          {video.recommendations && Object.keys(video.recommendations).length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <CustomText fontSize="normal" bold style={styles.sectionTitle}>
                💡 Recommendations
              </CustomText>
              <View style={styles.recommendationsGrid}>
                {Object.entries(video.recommendations).map(([key, value]) => (
                  <View key={key} style={styles.recommendationItem}>
                    <CustomText fontSize="small" bold opacity={0.8} style={styles.recommendationKey}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </CustomText>
                    <CustomText fontSize="small" opacity={0.7} style={styles.recommendationValue}>
                      {Array.isArray(value) ? value.join(', ') : value}
                    </CustomText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Scraped Data */}
          {video.scraped_data && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <CustomText fontSize="normal" bold style={styles.sectionTitle}>
                🌐 Scraped Data
              </CustomText>
              {video.scraped_data.description && (
                <View style={styles.scrapedItem}>
                  <CustomText fontSize="small" bold opacity={0.8}>Description:</CustomText>
                  <CustomText fontSize="small" opacity={0.7} numberOfLines={4} style={styles.scrapedText}>
                    {video.scraped_data.description}
                  </CustomText>
                </View>
              )}
              {video.scraped_data.channel_name && (
                <View style={styles.scrapedItem}>
                  <CustomText fontSize="small" bold opacity={0.8}>Channel:</CustomText>
                  <CustomText fontSize="small" opacity={0.7} style={styles.scrapedText}>
                    {video.scraped_data.channel_name}
                  </CustomText>
                </View>
              )}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    textAlign: 'center',
    lineHeight: 28,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dialContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dial: {
    transform: [{ rotate: '0deg' }],
  },
  dialCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    marginLeft: 30,
    alignItems: 'center',
  },
  xpContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  xpBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 140,
    borderWidth: 1,
  },
  statsGrid: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  analysisGrid: {
    gap: 16,
  },
  analysisItem: {
    marginBottom: 12,
  },
  analysisLabel: {
    marginBottom: 8,
  },
  analysisBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analysisBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  analysisBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  analysisValue: {
    minWidth: 40,
    textAlign: 'right',
  },
  reasonText: {
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  recommendationsGrid: {
    gap: 12,
  },
  recommendationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  recommendationKey: {
    marginBottom: 4,
  },
  recommendationValue: {
    lineHeight: 18,
  },
  scrapedItem: {
    marginBottom: 16,
  },
  scrapedText: {
    marginTop: 4,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
}); 