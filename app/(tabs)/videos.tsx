import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import CustomIcon from '../../components/CustomIcon';
import CustomText from '../../components/CustomText';
import Page from '../../components/Page';
import VideoDetailModal from '../../components/VideoDetailModal';
import VideoPreview from '../../components/VideoPreview';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore, Video } from '../../stores/userStore';

type SortOption = 'newest' | 'oldest' | 'quality_high' | 'quality_low' | 'xp_high' | 'xp_low';
type FilterOption = 'all' | 'educational' | 'entertainment' | 'gaming' | 'productivity' | 'brain_rot';

export default function VideosScreen() {
  const { colors } = useThemeStore();
  const videos = useUserStore((s) => s.videos);
  const removeVideo = useUserStore((s) => s.removeVideo);
  const syncVideos = useUserStore((s) => s.syncVideos);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Sync videos when component mounts
  useEffect(() => {
    syncVideos();
  }, [syncVideos]);

  // Get all unique tags from videos
  const getAllTags = () => {
    const allTags = new Set<string>();
    videos.forEach(video => {
      video.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  // Filter and sort videos
  const getFilteredAndSortedVideos = () => {
    let filteredVideos = [...videos];

    // Apply category filter
    if (filterBy !== 'all') {
      filteredVideos = filteredVideos.filter(video => video.category === filterBy);
    }

    // Apply tag filter
    if (selectedTag) {
      filteredVideos = filteredVideos.filter(video => 
        video.tags?.includes(selectedTag)
      );
    }

    // Apply sorting
    filteredVideos.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'quality_high':
          return (b.quality_score || 0) - (a.quality_score || 0);
        case 'quality_low':
          return (a.quality_score || 0) - (b.quality_score || 0);
        case 'xp_high':
          return b.xp_awarded - a.xp_awarded;
        case 'xp_low':
          return a.xp_awarded - b.xp_awarded;
        default:
          return 0;
      }
    });

    return filteredVideos;
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeVideo(id) },
      ]
    );
  };

  const handleVideoPress = (video: Video) => {
    setSelectedVideo(video);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedVideo(null);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncVideos();
    } catch (error) {
      console.error('Error refreshing videos:', error);
    } finally {
      setRefreshing(false);
    }
  }, [syncVideos]);

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'quality_high': return 'Quality: High to Low';
      case 'quality_low': return 'Quality: Low to High';
      case 'xp_high': return 'XP: High to Low';
      case 'xp_low': return 'XP: Low to High';
      default: return 'Newest First';
    }
  };

  const getFilterLabel = (filter: FilterOption) => {
    switch (filter) {
      case 'all': return 'All Categories';
      case 'educational': return '🎓 Educational';
      case 'entertainment': return '🎬 Entertainment';
      case 'gaming': return '🎮 Gaming';
      case 'productivity': return '💼 Productivity';
      case 'brain_rot': return '🧠 Brain Rot';
      default: return 'All Categories';
    }
  };

  const filteredVideos = getFilteredAndSortedVideos();
  const allTags = getAllTags();

  return (
    <Page style={{justifyContent: 'flex-start'}}>
      <View style={styles.header}>
        <CustomText fontSize="large" bold>My Videos</CustomText>
        <Pressable 
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, { backgroundColor: colors.primary }]}
        >
          <CustomIcon name="filter" size={20} color="white" />
        </Pressable>
      </View>

      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Sort Options */}
          <View style={styles.filterSection}>
            <CustomText fontSize="small" bold opacity={0.8}>Sort by:</CustomText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {(['newest', 'oldest', 'quality_high', 'quality_low', 'xp_high', 'xp_low'] as SortOption[]).map((sort) => (
                <Pressable
                  key={sort}
                  onPress={() => setSortBy(sort)}
                  style={[
                    styles.filterChip,
                    { backgroundColor: sortBy === sort ? colors.primary : colors.background },
                    { borderColor: colors.border }
                  ]}
                >
                  <CustomText 
                    fontSize="small" 
                    style={{ color: sortBy === sort ? 'white' : colors.text }}
                  >
                    {getSortLabel(sort)}
                  </CustomText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Category Filter */}
          <View style={styles.filterSection}>
            <CustomText fontSize="small" bold opacity={0.8}>Category:</CustomText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {(['all', 'educational', 'entertainment', 'gaming', 'productivity', 'brain_rot'] as FilterOption[]).map((filter) => (
                <Pressable
                  key={filter}
                  onPress={() => setFilterBy(filter)}
                  style={[
                    styles.filterChip,
                    { backgroundColor: filterBy === filter ? colors.primary : colors.background },
                    { borderColor: colors.border }
                  ]}
                >
                  <CustomText 
                    fontSize="small" 
                    style={{ color: filterBy === filter ? 'white' : colors.text }}
                  >
                    {getFilterLabel(filter)}
                  </CustomText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <View style={styles.filterSection}>
              <CustomText fontSize="small" bold opacity={0.8}>Tags:</CustomText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <Pressable
                  onPress={() => setSelectedTag('')}
                  style={[
                    styles.filterChip,
                    { backgroundColor: selectedTag === '' ? colors.primary : colors.background },
                    { borderColor: colors.border }
                  ]}
                >
                  <CustomText 
                    fontSize="small" 
                    style={{ color: selectedTag === '' ? 'white' : colors.text }}
                  >
                    All Tags
                  </CustomText>
                </Pressable>
                {allTags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => setSelectedTag(tag)}
                    style={[
                      styles.filterChip,
                      { backgroundColor: selectedTag === tag ? colors.primary : colors.background },
                      { borderColor: colors.border }
                    ]}
                  >
                    <CustomText 
                      fontSize="small" 
                      style={{ color: selectedTag === tag ? 'white' : colors.text }}
                    >
                      {tag}
                    </CustomText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <CustomText fontSize="large" opacity={0.6}>
              {videos.length === 0 ? 'No videos yet' : 'No videos match your filters'}
            </CustomText>
            <CustomText fontSize="small" opacity={0.4} style={{ marginTop: 8 }}>
              {videos.length === 0 
                ? 'Add your first video to get started!' 
                : 'Try adjusting your filters to see more videos'
              }
            </CustomText>
          </View>
        ) : (
          <View style={styles.videoList}>
            <CustomText fontSize="small" opacity={0.6} style={styles.resultCount}>
              {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
            </CustomText>
            {filteredVideos.map((video) => (
              <VideoPreview
                key={video.id}
                video={video}
                onPress={() => handleVideoPress(video)}
                onDelete={() => handleDelete(video.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <VideoDetailModal
        visible={modalVisible}
        video={selectedVideo}
        onClose={handleCloseModal}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
  },
  filtersContainer: {
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterScroll: {
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  videoList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultCount: {
    marginBottom: 16,
    textAlign: 'center',
  },
}); 