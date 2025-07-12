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
  
  const { videos, addVideo, removeVideo, updateVideo } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeVideo = async (url: string) => {
    // Import the video analysis utility
    const { generateMockVideoData } = await import('../utils/videoAnalysis');
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use the analysis utility
    const videoData = generateMockVideoData(url);
    
    setIsAnalyzing(false);
    
    return videoData;
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border
      }}>
        <Pressable onPress={onNavigateBack} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, flex: 1 }}>
          Video Library
        </Text>
        
        {/* Theme Toggle */}
        <Pressable 
          onPress={toggleTheme}
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20,
            backgroundColor: theme.card,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12
          }}
        >
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={20} 
            color={theme.text} 
          />
        </Pressable>
        
        <Pressable onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
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
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>
            {videos.length}
          </Text>
          <Text style={{ fontSize: 14, color: theme.text, opacity: 0.7 }}>
            Total Videos
          </Text>
        </View>
        <View style={{ 
          flex: 1, 
          alignItems: 'center',
          backgroundColor: theme.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.primary }}>
            {videos.reduce((sum, v) => sum + v.xp_awarded, 0)}
          </Text>
          <Text style={{ fontSize: 14, color: theme.text, opacity: 0.7 }}>
            Total XP
          </Text>
        </View>
        <View style={{ 
          flex: 1, 
          alignItems: 'center',
          backgroundColor: theme.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>
            {Math.round(videos.reduce((sum, v) => sum + v.quality_score, 0) / Math.max(videos.length, 1))}%
          </Text>
          <Text style={{ fontSize: 14, color: theme.text, opacity: 0.7 }}>
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
            paddingVertical: 60 
          }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme.card,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              borderWidth: 2,
              borderColor: theme.border,
              borderStyle: 'dashed'
            }}>
              <Ionicons name="videocam-outline" size={48} color={theme.border} />
            </View>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '600',
              color: theme.text, 
              marginBottom: 8,
              textAlign: 'center'
            }}>
              No videos yet
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: theme.text, 
              opacity: 0.6, 
              textAlign: 'center',
              paddingHorizontal: 32,
              lineHeight: 24
            }}>
              Add your first video to start tracking your content quality and earning XP!
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            {videos.map((video) => (
              <View key={video.id} style={{ 
                backgroundColor: theme.card,
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: theme.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: `${theme.primary}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <Ionicons 
                      name={getVideoIcon(video) as any} 
                      size={24} 
                      color={theme.primary} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '600', 
                      color: theme.text,
                      marginBottom: 6,
                      lineHeight: 22
                    }}>
                      {video.title}
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      color: theme.text, 
                      opacity: 0.6,
                      marginBottom: 12
                    }}>
                      {formatDate(video.date_watched)} • {video.platform}
                    </Text>
                    
                    {/* Category and XP */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ 
                        backgroundColor: getCategoryColor(video.category), 
                        paddingHorizontal: 12, 
                        paddingVertical: 6, 
                        borderRadius: 16 
                      }}>
                        <Text style={{ 
                          fontSize: 12, 
                          fontWeight: '600', 
                          color: 'white' 
                        }}>
                          {video.category}
                        </Text>
                      </View>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '700', 
                        color: getXPColor(video.xp_awarded) 
                      }}>
                        {video.xp_awarded > 0 ? '+' : ''}{video.xp_awarded} XP
                      </Text>
                    </View>
                  </View>
                  
                  <Pressable 
                    onPress={() => handleDeleteVideo(video)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: theme.background,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.text} opacity={0.6} />
                  </Pressable>
                </View>
                
                {/* Video Stats */}
                {video.views && (
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: theme.border
                  }}>
                    <Text style={{ fontSize: 12, color: theme.text, opacity: 0.6 }}>
                      {video.views?.toLocaleString()} views
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.text, opacity: 0.6 }}>
                      Quality: {video.quality_score}%
                    </Text>
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
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: Platform.OS === 'ios' ? 40 : 24,
              maxHeight: '80%'
            }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 24
              }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: theme.text }}>
                  Add Video
                </Text>
                <Pressable onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </Pressable>
              </View>
              
              <Text style={{ 
                fontSize: 16, 
                color: theme.text, 
                opacity: 0.7, 
                marginBottom: 16,
                lineHeight: 22
              }}>
                Paste a video URL to analyze its content quality and earn XP
              </Text>
              
              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 16,
                    color: theme.text,
                    borderWidth: 2,
                    borderColor: theme.border,
                    minHeight: 80,
                    textAlignVertical: 'top'
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  placeholderTextColor={theme.text + '60'}
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  multiline
                  numberOfLines={3}
                />
                
                {/* Paste Button */}
                <Pressable
                  onPress={handlePasteFromClipboard}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    backgroundColor: theme.primary,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Ionicons name="clipboard-outline" size={16} color="white" />
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: 'white', 
                    marginLeft: 6 
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
                  borderRadius: 16,
                  padding: 18,
                  alignItems: 'center',
                  opacity: (isAnalyzing || !videoUrl.trim()) ? 0.6 : 1,
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}
              >
                {isAnalyzing ? (
                  <>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: 'white', marginRight: 8 }}>
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
                    <Text style={{ fontSize: 16, fontWeight: '600', color: 'white', marginLeft: 8 }}>
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