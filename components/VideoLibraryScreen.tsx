import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore, Video } from '../stores/userStore';

interface VideoLibraryScreenProps {
  onNavigateBack: () => void;
}

export default function VideoLibraryScreen({ onNavigateBack }: VideoLibraryScreenProps) {
  const { colors, isDark, setThemeMode } = useThemeStore();
  const theme = colors;
  
  const { videos, addVideo, removeVideo } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeVideo = async (url: string) => {
    // Import the enhanced video analysis utility
    const { generateEnhancedVideoAnalysis, generateMockVideoData } = await import('../utils/videoAnalysis');
    
    setIsAnalyzing(true);
    
    try {
      // Try enhanced analysis first (includes web scraping for YouTube)
      const videoData = await generateEnhancedVideoAnalysis(url);
      setIsAnalyzing(false);
      return videoData;
    } catch (error) {
      console.error('Enhanced analysis failed, falling back to mock data:', error);
      
      // Fallback to mock data if enhanced analysis fails
      const videoData = generateMockVideoData(url);
      setIsAnalyzing(false);
      return videoData;
    }
  };

  const handleAddVideo = async () => {
    if (!videoUrl.trim()) {
      Alert.alert('Error', 'Please enter a video URL');
      return;
    }

    try {
      const videoData = await analyzeVideo(videoUrl);
      addVideo(videoData);
      setVideoUrl('');
      setShowAddModal(false);
      Alert.alert('Success', `Video added! ${videoData.xp_awarded > 0 ? `+${videoData.xp_awarded}` : videoData.xp_awarded} XP`);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze video. Please try again.');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setVideoUrl(clipboardContent);
      } else {
        Alert.alert('Clipboard Empty', 'No content found in clipboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read clipboard content');
    }
  };

  const handleDeleteVideo = (video: Video) => {
    Alert.alert(
      'Delete Video',
      `Are you sure you want to delete "${video.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeVideo(video.id) }
      ]
    );
  };

  const getVideoIcon = (video: Video) => {
    switch (video.platform) {
      case 'youtube': return 'logo-youtube';
      case 'instagram': return 'logo-instagram';
      case 'tiktok': return 'logo-tiktok';
      default: return 'videocam-outline';
    }
  };

  const getXPColor = (xp: number) => {
    if (xp > 0) return '#4CAF50';
    if (xp < 0) return '#F44336';
    return theme.text;
  };

  const getCategoryColor = (category: Video['category']) => {
    switch (category) {
      case 'educational': return '#4CAF50';
      case 'productivity': return '#2196F3';
      case 'gaming': return '#F44336';
      case 'brain_rot': return '#FF5722';
      case 'entertainment': return '#FF9800';
      default: return theme.border;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 24, 
        paddingVertical: 20,
        backgroundColor: theme.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.border + '40'
      }}>
        <Pressable 
          onPress={onNavigateBack} 
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 22,
            backgroundColor: theme.card,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: '800', 
          color: theme.text, 
          flex: 1 
        }}>
          Video Library
        </Text>
        
        {/* Theme Toggle */}
        <Pressable 
          onPress={toggleTheme}
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 22,
            backgroundColor: theme.card,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={20} 
            color={theme.text} 
          />
        </Pressable>
        
        <Pressable 
          onPress={() => setShowAddModal(true)}
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 22,
            backgroundColor: theme.primary,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={{ 
        flexDirection: 'row', 
        paddingHorizontal: 24, 
        paddingVertical: 20,
        gap: 16
      }}>
        <View style={{ 
          flex: 1, 
          alignItems: 'center',
          backgroundColor: theme.card,
          borderRadius: 20,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor: theme.border + '40'
        }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '800', 
            color: theme.text,
            marginBottom: 4
          }}>
            {videos.length}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: theme.text, 
            opacity: 0.7,
            fontWeight: '600'
          }}>
            Total Videos
          </Text>
        </View>
        <View style={{ 
          flex: 1, 
          alignItems: 'center',
          backgroundColor: theme.card,
          borderRadius: 20,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor: theme.border + '40'
        }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '800', 
            color: theme.primary,
            marginBottom: 4
          }}>
            {videos.reduce((sum, v) => sum + v.xp_awarded, 0)}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: theme.text, 
            opacity: 0.7,
            fontWeight: '600'
          }}>
            Total XP
          </Text>
        </View>
        <View style={{ 
          flex: 1, 
          alignItems: 'center',
          backgroundColor: theme.card,
          borderRadius: 20,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor: theme.border + '40'
        }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '800', 
            color: theme.text,
            marginBottom: 4
          }}>
            {Math.round(videos.reduce((sum, v) => sum + v.quality_score, 0) / Math.max(videos.length, 1))}%
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: theme.text, 
            opacity: 0.7,
            fontWeight: '600'
          }}>
            Avg Quality
          </Text>
        </View>
      </View>

      {/* Video List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {videos.length === 0 ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingVertical: 80,
            paddingHorizontal: 24
          }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme.card,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 8,
            }}>
              <Ionicons name="videocam-outline" size={48} color={theme.primary} />
            </View>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '800',
              color: theme.text, 
              marginBottom: 12,
              textAlign: 'center'
            }}>
              No videos yet
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: theme.text, 
              opacity: 0.6, 
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 32
            }}>
              Add your first video to start tracking your content quality and earning XP!
            </Text>
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={{
                backgroundColor: theme.primary,
                borderRadius: 16,
                paddingHorizontal: 32,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '700', 
                color: 'white', 
                marginLeft: 8 
              }}>
                Add First Video
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            {videos.map((video) => (
              <View key={video.id} style={{ 
                backgroundColor: theme.card,
                borderRadius: 24,
                padding: 24,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 8,
                borderWidth: 1,
                borderColor: theme.border + '40'
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
                  <View style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: theme.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <Ionicons 
                      name={getVideoIcon(video) as any} 
                      size={28} 
                      color={theme.primary} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: '700', 
                      color: theme.text,
                      marginBottom: 8,
                      lineHeight: 24
                    }}>
                      {video.title}
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      color: theme.text, 
                      opacity: 0.6,
                      marginBottom: 16,
                      fontWeight: '500'
                    }}>
                      {formatDate(video.date_watched)} • {video.platform}
                    </Text>
                    
                    {/* Category and XP */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <View style={{ 
                        backgroundColor: getCategoryColor(video.category), 
                        paddingHorizontal: 16, 
                        paddingVertical: 8, 
                        borderRadius: 20 
                      }}>
                        <Text style={{ 
                          fontSize: 12, 
                          fontWeight: '700', 
                          color: 'white' 
                        }}>
                          {video.category.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: getXPColor(video.xp_awarded) + '20',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20
                      }}>
                        <Text style={{ 
                          fontSize: 14, 
                          fontWeight: '800', 
                          color: getXPColor(video.xp_awarded) 
                        }}>
                          {video.xp_awarded > 0 ? '+' : ''}{video.xp_awarded} XP
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Pressable 
                    onPress={() => handleDeleteVideo(video)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: theme.background,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.text} opacity={0.6} />
                  </Pressable>
                </View>
                
                {/* Video Stats */}
                {video.views && (
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                    paddingTop: 20,
                    borderTopWidth: 1,
                    borderTopColor: theme.border + '40'
                  }}>
                    <Text style={{ 
                      fontSize: 14, 
                      color: theme.text, 
                      opacity: 0.6,
                      fontWeight: '500'
                    }}>
                      {video.views?.toLocaleString()} views
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      color: theme.text, 
                      opacity: 0.6,
                      fontWeight: '500'
                    }}>
                      Quality: {video.quality_score}%
                    </Text>
                  </View>
                )}

                {/* Scraped Data */}
                {video.scraped_data && (
                  <View style={{ 
                    paddingTop: 20,
                    borderTopWidth: 1,
                    borderTopColor: theme.border + '40'
                  }}>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '700', 
                      color: theme.text,
                      marginBottom: 12
                    }}>
                      Analysis Details
                    </Text>
                    
                    {video.scraped_data.channel_name && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ 
                          fontSize: 12, 
                          color: theme.text, 
                          opacity: 0.6,
                          fontWeight: '500'
                        }}>
                          Channel: {video.scraped_data.channel_name}
                        </Text>
                      </View>
                    )}

                    {video.scraped_data.hashtags && video.scraped_data.hashtags.length > 0 && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ 
                          fontSize: 12, 
                          color: theme.text, 
                          opacity: 0.6,
                          fontWeight: '500',
                          marginBottom: 4
                        }}>
                          Hashtags:
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {video.scraped_data.hashtags.slice(0, 5).map((tag, index) => (
                            <View key={index} style={{
                              backgroundColor: theme.primary + '20',
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 12
                            }}>
                              <Text style={{ 
                                fontSize: 10, 
                                color: theme.primary,
                                fontWeight: '600'
                              }}>
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {video.scraped_data.description && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ 
                          fontSize: 12, 
                          color: theme.text, 
                          opacity: 0.6,
                          fontWeight: '500',
                          marginBottom: 4
                        }}>
                          Description:
                        </Text>
                        <Text style={{ 
                          fontSize: 11, 
                          color: theme.text, 
                          opacity: 0.5,
                          lineHeight: 16
                        }}>
                          {video.scraped_data.description.length > 150 
                            ? video.scraped_data.description.substring(0, 150) + '...'
                            : video.scraped_data.description}
                        </Text>
                      </View>
                    )}

                    {video.scraped_data.keywords && video.scraped_data.keywords.length > 0 && (
                      <View>
                        <Text style={{ 
                          fontSize: 12, 
                          color: theme.text, 
                          opacity: 0.6,
                          fontWeight: '500',
                          marginBottom: 4
                        }}>
                          Keywords: {video.scraped_data.keywords.slice(0, 3).join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Video Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'flex-end' 
          }}>
            <View style={{ 
              backgroundColor: theme.background,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 32,
              paddingBottom: Platform.OS === 'ios' ? 48 : 32,
              maxHeight: '80%'
            }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 24
              }}>
                <Text style={{ 
                  fontSize: 28, 
                  fontWeight: '800', 
                  color: theme.text 
                }}>
                  Add Video
                </Text>
                <Pressable 
                  onPress={() => setShowAddModal(false)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: theme.card,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Ionicons name="close" size={24} color={theme.text} />
                </Pressable>
              </View>
              
              <Text style={{ 
                fontSize: 16, 
                color: theme.text, 
                opacity: 0.7, 
                marginBottom: 24,
                lineHeight: 24
              }}>
                Paste a video URL to analyze its content quality and earn XP
              </Text>
              
              <View style={{ marginBottom: 24 }}>
                <TextInput
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 20,
                    padding: 20,
                    fontSize: 16,
                    color: theme.text,
                    borderWidth: 2,
                    borderColor: theme.border + '40',
                    minHeight: 100,
                    textAlignVertical: 'top'
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  placeholderTextColor={theme.text + '60'}
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  multiline
                  numberOfLines={4}
                />
                
                {/* Paste Button */}
                <Pressable
                  onPress={handlePasteFromClipboard}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    backgroundColor: theme.primary,
                    borderRadius: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Ionicons name="clipboard-outline" size={16} color="white" />
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '700', 
                    color: 'white', 
                    marginLeft: 8 
                  }}>
                    Paste
                  </Text>
                </Pressable>
              </View>
              
              <Pressable
                onPress={handleAddVideo}
                disabled={isAnalyzing || !videoUrl.trim()}
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 20,
                  padding: 20,
                  alignItems: 'center',
                  opacity: (isAnalyzing || !videoUrl.trim()) ? 0.6 : 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                {isAnalyzing ? (
                  <>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '700', 
                      color: 'white', 
                      marginRight: 12 
                    }}>
                      Analyzing...
                    </Text>
                    <View style={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: 10, 
                      borderWidth: 2, 
                      borderColor: 'white', 
                      borderTopColor: 'transparent',
                      transform: [{ rotate: '0deg' }]
                    }} />
                  </>
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="white" />
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '700', 
                      color: 'white', 
                      marginLeft: 12 
                    }}>
                      Add Video
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
} 