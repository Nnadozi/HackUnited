import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { useThemeStore } from '../stores/themeStore';
import { Video } from '../stores/userStore';
import CustomIcon from './CustomIcon';
import CustomText from './CustomText';

interface VideoDetailModalProps {
  visible: boolean;
  video: Video | null;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const QualityDial = ({ score }: { score: number }) => {
  const { colors } = useThemeStore();
  const radius = 90;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // Semi-circle
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Calculate pointer position
  const angle = (score / 100) * Math.PI - Math.PI; // -π to 0 for semi-circle
  const pointerX = 120 + Math.cos(angle) * (radius - 20);
  const pointerY = 120 + Math.sin(angle) * (radius - 20);

  const glowStyle: ViewStyle = {
    shadowColor: score >= 70 ? '#4CAF50' : score >= 40 ? '#FF9800' : '#F44336',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  };

  return (
    <View style={[styles.dialContainer, glowStyle]}>
      <Svg width={240} height={140} style={styles.dial}>
        <Defs>
          <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#F44336" />
            <Stop offset="25%" stopColor="#FF9800" />
            <Stop offset="50%" stopColor="#FFC107" />
            <Stop offset="75%" stopColor="#8BC34A" />
            <Stop offset="100%" stopColor="#4CAF50" />
          </SvgLinearGradient>
          <SvgLinearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.border} />
            <Stop offset="100%" stopColor={colors.border} />
          </SvgLinearGradient>
        </Defs>
        
        {/* Background semi-circle */}
        <Path
          d={`M 30 120 A ${radius} ${radius} 0 0 1 210 120`}
          stroke="url(#backgroundGradient)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress semi-circle */}
        <Path
          d={`M 30 120 A ${radius} ${radius} 0 0 1 210 120`}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        
        {/* Pointer */}
        <Circle
          cx={pointerX}
          cy={pointerY}
          r={8}
          fill={score >= 70 ? '#4CAF50' : score >= 40 ? '#FF9800' : '#F44336'}
          stroke="white"
          strokeWidth={3}
        />
        
        {/* Center dot */}
        <Circle
          cx={120}
          cy={120}
          r={4}
          fill={colors.text}
          opacity={0.5}
        />
      </Svg>
      
      <View style={styles.dialCenter}>
        <CustomText fontSize="XL" bold style={{ fontSize: 72, color: colors.text }}>{score}</CustomText>
      </View>
      
      <View style={styles.dialBottom}>
        <CustomText fontSize="small" opacity={0.7}>Quality Score</CustomText>
      </View>
    </View>
  );
};

export default function VideoDetailModal({ visible, video, onClose }: VideoDetailModalProps) {
  const { colors } = useThemeStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!video) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
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

  const getToneColor = (tone?: string) => {
    switch (tone) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#F44336';
      case 'mixed': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getEnergyLevel = (energy?: string) => {
    switch (energy) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Animated Header with Blur Effect */}
        <LinearGradient
          colors={[colors.primary + 'FF', colors.primary + 'CC', colors.primary + '99']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <CustomText fontSize="large" bold style={{ color: 'white' }}>Video Analysis</CustomText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <CustomIcon name="close" size={24} color="white" />
            </Pressable>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section with Glassmorphism */}
          <View style={styles.heroSection}>
            {video.thumbnailUrl ? (
              <View style={styles.thumbnailContainer}>
                <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.thumbnailOverlay}
                />
                <View style={styles.thumbnailContent}>
                  <CustomText fontSize="large" bold style={styles.overlayTitle}>
                    {video.title}
                  </CustomText>
                  <View style={styles.overlayBadges}>
                    <LinearGradient
                      colors={getXPGradient(video.xp_awarded)}
                      style={styles.overlayXpBadge}
                    >
                      <CustomText fontSize="small" bold style={{ color: 'white' }}>
                        {video.xp_awarded > 0 ? '+' : ''}{video.xp_awarded} XP
                      </CustomText>
                    </LinearGradient>
                    <LinearGradient
                      colors={[colors.primary, colors.primary + 'CC']}
                      style={styles.overlayCategoryBadge}
                    >
                      <CustomText fontSize="small" bold style={{ color: 'white' }}>
                        {getCategoryIcon(video.category)} {capitalizeFirstLetter(video.category)}
                      </CustomText>
                    </LinearGradient>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noThumbnailContainer}>
                <CustomText fontSize="large" bold style={styles.title}>
                  {video.title}
                </CustomText>
                <View style={styles.badgeRow}>
                  <LinearGradient
                    colors={getXPGradient(video.xp_awarded)}
                    style={styles.xpBadge}
                  >
                    <CustomText fontSize="normal" bold style={{ color: 'white' }}>
                      {video.xp_awarded > 0 ? '+' : ''}{video.xp_awarded} XP
                    </CustomText>
                  </LinearGradient>
                  <LinearGradient
                    colors={[colors.primary, colors.primary + 'CC']}
                    style={styles.categoryBadge}
                  >
                    <CustomText fontSize="small" bold style={{ color: 'white' }}>
                      {getCategoryIcon(video.category)} {capitalizeFirstLetter(video.category)}
                    </CustomText>
                  </LinearGradient>
                </View>
              </View>
            )}
          </View>

          {/* Premium Quality Score Section */}
          <View style={[styles.qualitySection, { backgroundColor: colors.card }]}>
            <QualityDial score={video.quality_score || 0} />
            {video.analysis_reason && (
              <View style={styles.descriptionContainer}>
                <View style={styles.descriptionCard}>
                  <CustomIcon name="psychology" size={20} color={colors.primary} />
                  <CustomText fontSize="small" opacity={0.9} style={styles.descriptionText}>
                    {video.analysis_reason}
                  </CustomText>
                </View>
              </View>
            )}
          </View>

          {/* Premium Stats Grid */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.statIcon}
                >
                  <CustomIcon name="computer" size={20} color="white" />
                </LinearGradient>
                <CustomText fontSize="small" opacity={0.7}>Platform</CustomText>
                <CustomText fontSize="normal" bold>{video.platform?.toUpperCase() || 'Unknown'}</CustomText>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.statIcon}
                >
                  <CustomIcon name="access-time" size={20} color="white" />
                </LinearGradient>
                <CustomText fontSize="small" opacity={0.7}>Duration</CustomText>
                <CustomText fontSize="normal" bold>{formatDuration(video.duration)}</CustomText>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.statIcon}
                >
                  <CustomIcon name="visibility" size={20} color="white" />
                </LinearGradient>
                <CustomText fontSize="small" opacity={0.7}>Views</CustomText>
                <CustomText fontSize="normal" bold>{formatViews(video.views)}</CustomText>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.statIcon}
                >
                  <CustomIcon name="date-range" size={20} color="white" />
                </LinearGradient>
                <CustomText fontSize="small" opacity={0.7}>Added</CustomText>
                <CustomText fontSize="normal" bold>{new Date(video.created_at).toLocaleDateString()}</CustomText>
              </View>
            </View>
          </View>

          {/* Advanced Analysis with Animated Expansion */}
          {video.detailed_analysis && Object.keys(video.detailed_analysis).length > 0 && (
            <View style={[styles.advancedSection, { backgroundColor: colors.card }]}>
              <Pressable onPress={() => setShowAdvanced(!showAdvanced)} style={styles.advancedToggle}>
                <View style={styles.advancedHeader}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.advancedIcon}
                  >
                    <CustomIcon name="analytics" size={20} color="white" />
                  </LinearGradient>
                  <CustomText fontSize="normal" bold style={styles.advancedTitle}>
                    Advanced Analysis
                  </CustomText>
                </View>
                <CustomIcon name={showAdvanced ? "expand-less" : "expand-more"} size={24} color={colors.text} />
              </Pressable>
              
              {showAdvanced && (
                <View style={styles.advancedContent}>
                  <View style={styles.metricsGrid}>
                    {Object.entries(video.detailed_analysis)
                      .sort((a, b) => b[1] - a[1])
                      .map(([key, value]) => (
                      <View key={key} style={[styles.metricCard, { backgroundColor: colors.background }]}>
                        <View style={styles.metricHeader}>
                          <CustomText fontSize="small" bold style={styles.metricLabel}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </CustomText>
                          <CustomText fontSize="large" bold style={[styles.metricValue, { color: value >= 70 ? '#4CAF50' : value >= 40 ? '#FF9800' : '#F44336' }] as any}>
                            {value}%
                          </CustomText>
                        </View>
                        <View style={styles.metricVisualization}>
                          <View style={[styles.metricBar, { backgroundColor: colors.border }]}>
                            <LinearGradient
                              colors={value >= 70 ? ['#4CAF50', '#66BB6A'] as const : value >= 40 ? ['#FF9800', '#FFB74D'] as const : ['#F44336', '#EF5350'] as const}
                              style={[styles.metricBarFill, { width: `${value}%` }]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Content Insights */}
          {video.content_insights && (
            <View style={[styles.insightsSection, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#EC4899', '#DB2777']}
                  style={styles.sectionIcon}
                >
                  <CustomIcon name="lightbulb" size={20} color="white" />
                </LinearGradient>
                <CustomText fontSize="normal" bold style={styles.sectionTitle}>
                  Content Insights
                </CustomText>
              </View>
              
              <View style={[styles.insightCard, { backgroundColor: colors.background }]}>
                <CustomText fontSize="small" bold opacity={0.8} style={{ marginBottom: 12 }}>Target Audience</CustomText>
                <CustomText fontSize="normal" style={{ color: colors.primary }}>
                  {video.content_insights.target_audience}
                </CustomText>
              </View>
              
              <View style={[styles.insightCard, { backgroundColor: colors.background, marginTop: 12 }]}>
                <CustomText fontSize="small" bold opacity={0.8} style={{ marginBottom: 12 }}>Complexity</CustomText>
                <View style={styles.complexityBadge}>
                  <CustomText fontSize="small" bold style={{ color: 'white' }}>
                    {video.content_insights.complexity_level?.toUpperCase()}
                  </CustomText>
                </View>
              </View>
              
              <View style={[styles.insightCard, { backgroundColor: colors.background, marginTop: 12 }]}>
                <CustomText fontSize="small" bold opacity={0.8} style={{ marginBottom: 12 }}>Retention Rate</CustomText>
                <CustomText fontSize="large" bold style={{ color: colors.primary }}>
                  {video.content_insights.estimated_retention}%
                </CustomText>
              </View>
              
              {video.content_insights.key_takeaways && video.content_insights.key_takeaways.length > 0 && (
                <View style={styles.takeawaysContainer}>
                  <CustomText fontSize="small" bold opacity={0.8} style={{ marginBottom: 12 }}>
                    Key Takeaways
                  </CustomText>
                  {video.content_insights.key_takeaways.map((takeaway, index) => (
                    <View key={index} style={styles.takeawayItem}>
                      <View style={[styles.takeawayBullet, { backgroundColor: colors.primary }]} />
                      <CustomText fontSize="small" style={{ flex: 1, lineHeight: 20 }}>
                        {takeaway}
                      </CustomText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Mood Analysis */}
          {video.mood_analysis && (
            <View style={[styles.moodSection, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.sectionIcon}
                >
                  <CustomIcon name="sentiment-satisfied" size={20} color="white" />
                </LinearGradient>
                <CustomText fontSize="normal" bold style={styles.sectionTitle}>
                  Mood Analysis
                </CustomText>
              </View>
              
              <View style={styles.moodGrid}>
                <View style={[styles.moodCard, { backgroundColor: colors.background }]}>
                  <CustomText fontSize="small" bold opacity={0.8} style={{ marginBottom: 12 }}>Overall Tone</CustomText>
                  <View style={[styles.toneBadge, { backgroundColor: getToneColor(video.mood_analysis.overall_tone) }]}>
                    <CustomText fontSize="small" bold style={{ color: 'white' }}>
                      {video.mood_analysis.overall_tone?.toUpperCase()}
                    </CustomText>
                  </View>
                </View>
                
                <View style={[styles.moodCard, { backgroundColor: colors.background }]}>
                  <CustomText fontSize="small" bold opacity={0.8} style={{ marginBottom: 12 }}>Energy Level</CustomText>
                  <View style={styles.energyIndicator}>
                    {['low', 'medium', 'high'].map((level, index) => (
                      <View
                        key={level}
                        style={[
                          styles.energyBar,
                          {
                            backgroundColor: getEnergyLevel(video.mood_analysis?.energy_level || 'medium') > index
                              ? colors.primary
                              : colors.border,
                          }
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
              
              {video.mood_analysis.emotional_impact && (
                <View style={styles.emotionalImpactContainer}>
                  <CustomText fontSize="small" bold opacity={0.8} style={{ marginBottom: 8 }}>
                    Emotional Impact
                  </CustomText>
                  <CustomText fontSize="small" opacity={0.9} style={{ lineHeight: 20 }}>
                    {video.mood_analysis.emotional_impact}
                  </CustomText>
                </View>
              )}
            </View>
          )}

          {/* Learning Objectives */}
          {video.learning_objectives && video.learning_objectives.length > 0 && (
            <View style={[styles.learningSection, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.sectionIcon}
                >
                  <CustomIcon name="school" size={20} color="white" />
                </LinearGradient>
                <CustomText fontSize="normal" bold style={styles.sectionTitle}>
                  Learning Objectives
                </CustomText>
              </View>
              
              <View style={styles.objectivesContainer}>
                {video.learning_objectives.map((objective, index) => (
                  <View key={index} style={styles.objectiveItem}>
                    <View style={[styles.objectiveNumber, { backgroundColor: colors.primary }]}>
                      <CustomText fontSize="small" bold style={{ color: 'white' }}>
                        {index + 1}
                      </CustomText>
                    </View>
                    <CustomText fontSize="small" style={{ flex: 1, lineHeight: 20 }}>
                      {objective}
                    </CustomText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags with Glassmorphism */}
          {video.tags && video.tags.length > 0 && (
            <View style={[styles.tagsSection, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#06B6D4', '#0891B2']}
                  style={styles.sectionIcon}
                >
                  <CustomIcon name="local-offer" size={20} color="white" />
                </LinearGradient>
                <CustomText fontSize="normal" bold style={styles.sectionTitle}>
                  Tags
                </CustomText>
              </View>
              <View style={styles.tagsContainer}>
                {video.tags.map((tag, index) => (
                  <LinearGradient
                    key={index}
                    colors={[colors.primary + '30', colors.primary + '20']}
                    style={styles.tag}
                  >
                    <CustomText fontSize="small" style={{ color: colors.primary }}>
                      #{tag}
                    </CustomText>
                  </LinearGradient>
                ))}
              </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  heroSection: {
    marginBottom: 24,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: Math.min(280, screenWidth * 0.7),
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  thumbnailContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    zIndex: 1,
  },
  overlayTitle: {
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 16,
  },
  overlayBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  overlayXpBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  overlayCategoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  noThumbnailContainer: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  xpBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  qualitySection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dialContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dial: {
    transform: [{ rotate: '0deg' }],
  },
  dialCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 60,
  },
  dialBottom: {
    alignItems: 'center',
    marginTop: 8,
  },
  descriptionContainer: {
    marginTop: 20,
    width: '100%',
  },
  descriptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  descriptionText: {
    flex: 1,
    lineHeight: 20,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: screenWidth > 400 ? 'row' : 'column',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: screenWidth > 400 ? 1 : undefined,
    alignItems: 'center',
    padding: screenWidth > 400 ? 20 : 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
    minHeight: 120,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedSection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  advancedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  advancedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedTitle: {
    fontSize: 16,
  },
  advancedContent: {
    paddingTop: 16,
  },
  metricsGrid: {
    gap: 16,
  },
  metricCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricVisualization: {
    width: '100%',
  },
  metricBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tagsSection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
  insightsSection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  insightCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  complexityBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeawaysContainer: {
    marginTop: 16,
  },
  takeawayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  takeawayBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moodSection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  moodCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toneBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  energyBar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  emotionalImpactContainer: {
    marginTop: 16,
  },
  learningSection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  objectivesContainer: {
    marginTop: 16,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  objectiveNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 