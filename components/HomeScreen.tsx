import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';
import { getXPProgress, useUserStore, Video } from '../stores/userStore';

interface HomeScreenProps {
  onNavigateToLibrary: () => void;
}

export default function HomeScreen({ onNavigateToLibrary }: HomeScreenProps) {
  const { colors, isDark, setThemeMode } = useThemeStore();
  const theme = colors;
  
  const { 
    user, 
    currentXP, 
    currentLevel, 
    totalXP,
    getTodaysVideos,
    getTotalXPToday,
    applyDailyDecay,
    logout 
  } = useUserStore();

  const todaysVideos = getTodaysVideos();
  const todaysXP = getTotalXPToday();
  const xpProgress = getXPProgress(currentXP, currentLevel);

  useEffect(() => {
    // Apply daily decay when component mounts
    applyDailyDecay();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
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
    if (xp > 0) return '#4CAF50'; // Green for positive
    if (xp < 0) return '#F44336'; // Red for negative
    return theme.text; // Default for neutral
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 24, 
        paddingVertical: 16 
      }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>
            Welcome back!
          </Text>
          <Text style={{ fontSize: 16, color: theme.text, opacity: 0.7 }}>
            {user?.name || 'User'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Theme Toggle */}
          <Pressable 
            onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 20,
              backgroundColor: theme.card,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons 
              name={isDark ? 'sunny' : 'moon'} 
              size={20} 
              color={theme.text} 
            />
          </Pressable>
          
          <Pressable onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* XP Progress Card */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ 
            backgroundColor: theme.card, 
            borderRadius: 20, 
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 16 
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>
                Level {currentLevel}
              </Text>
              <Text style={{ fontSize: 16, color: theme.text, opacity: 0.7 }}>
                {totalXP} Total XP
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 8 
              }}>
                <Text style={{ fontSize: 14, color: theme.text, opacity: 0.7 }}>
                  Progress to Level {currentLevel + 1}
                </Text>
                <Text style={{ fontSize: 14, color: theme.text, opacity: 0.7 }}>
                  {xpProgress.current}/{xpProgress.required} XP
                </Text>
              </View>
              
              <View style={{ 
                height: 12, 
                backgroundColor: theme.border, 
                borderRadius: 6, 
                overflow: 'hidden' 
              }}>
                <View style={{ 
                  height: '100%', 
                  width: `${Math.min(xpProgress.percentage, 100)}%`, 
                  backgroundColor: theme.primary, 
                  borderRadius: 6 
                }} />
              </View>
            </View>

            {/* Level Info */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="diamond" size={20} color={theme.primary} />
                <Text style={{ 
                  fontSize: 14, 
                  color: theme.text, 
                  marginLeft: 8,
                  opacity: 0.7 
                }}>
                  {currentLevel === 5 ? 'Max Level!' : `${xpProgress.required - xpProgress.current} XP to next level`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Today's Activity */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 16 
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>
              Today's Activity
            </Text>
            <Pressable onPress={onNavigateToLibrary}>
              <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '600' }}>
                View All
              </Text>
            </Pressable>
          </View>

          <View style={{ 
            backgroundColor: theme.card, 
            borderRadius: 16, 
            padding: 20,
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 16 
            }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                  Videos Watched
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.primary }}>
                  {todaysVideos.length}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                  XP Earned
                </Text>
                <Text style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: getXPColor(todaysXP) 
                }}>
                  {todaysXP > 0 ? '+' : ''}{todaysXP}
                </Text>
              </View>
            </View>

            {/* Recent Videos */}
            {todaysVideos.length > 0 ? (
              <View>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600', 
                  color: theme.text, 
                  marginBottom: 12,
                  opacity: 0.8
                }}>
                  Recent Videos
                </Text>
                {todaysVideos.slice(0, 3).map((video) => (
                  <View key={video.id} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: theme.background,
                    borderRadius: 8
                  }}>
                    <Ionicons 
                      name={getVideoIcon(video) as any} 
                      size={20} 
                      color={theme.primary} 
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ 
                        fontSize: 14, 
                        fontWeight: '500', 
                        color: theme.text 
                      }} numberOfLines={1}>
                        {video.title}
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: theme.text, 
                        opacity: 0.6 
                      }}>
                        {video.category} • {video.platform}
                      </Text>
                    </View>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: getXPColor(video.xp_awarded) 
                    }}>
                      {video.xp_awarded > 0 ? '+' : ''}{video.xp_awarded}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Ionicons name="videocam-outline" size={48} color={theme.border} />
                <Text style={{ 
                  fontSize: 16, 
                  color: theme.text, 
                  opacity: 0.6, 
                  marginTop: 8,
                  textAlign: 'center'
                }}>
                  No videos tracked today
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: theme.text, 
                  opacity: 0.5, 
                  textAlign: 'center',
                  marginTop: 4
                }}>
                  Add videos to start earning XP!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: theme.text, 
            marginBottom: 16 
          }}>
            Quick Actions
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable 
              onPress={onNavigateToLibrary}
              style={{ 
                flex: 1,
                backgroundColor: theme.primary, 
                borderRadius: 16, 
                padding: 20,
                alignItems: 'center'
              }}
            >
              <Ionicons name="add-circle-outline" size={32} color="white" />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: 'white', 
                marginTop: 8 
              }}>
                Add Video
              </Text>
            </Pressable>
            
            <Pressable 
              onPress={onNavigateToLibrary}
              style={{ 
                flex: 1,
                backgroundColor: theme.card, 
                borderRadius: 16, 
                padding: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.border
              }}
            >
              <Ionicons name="library-outline" size={32} color={theme.primary} />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: theme.text, 
                marginTop: 8 
              }}>
                View Library
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 