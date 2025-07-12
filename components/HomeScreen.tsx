import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';
import { getXPProgress, useUserStore, Video } from '../stores/userStore';

interface HomeScreenProps {
  onNavigateToLibrary: () => void;
}

export default function HomeScreen({ onNavigateToLibrary }: HomeScreenProps) {
  const { colors, isDark, setThemeMode } = useThemeStore();
  const theme = colors;
  const [refreshing, setRefreshing] = useState(false);
  
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

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate refresh
    applyDailyDecay();
    setRefreshing(false);
  };

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

  const getLevelBadgeColor = (level: number) => {
    const colors = ['#9E9E9E', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    return colors[level] || '#9E9E9E';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 24, 
        paddingVertical: 20,
        backgroundColor: theme.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.border + '40'
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '800', 
            color: theme.text,
            marginBottom: 4
          }}>
            Good morning!
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: theme.text, 
            opacity: 0.7,
            fontWeight: '500'
          }}>
            {user?.name || 'User'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Level Badge */}
          <View style={{
            backgroundColor: getLevelBadgeColor(currentLevel),
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Ionicons name="diamond" size={16} color="white" />
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '700', 
              color: 'white',
              marginLeft: 4
            }}>
              L{currentLevel}
            </Text>
          </View>
          
          {/* Theme Toggle */}
          <Pressable 
            onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 22,
              backgroundColor: theme.card,
              justifyContent: 'center',
              alignItems: 'center',
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
            onPress={handleLogout}
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 22,
              backgroundColor: theme.card,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* XP Progress Card */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, marginBottom: 24 }}>
          <View style={{ 
            backgroundColor: theme.card, 
            borderRadius: 24, 
            padding: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
            borderWidth: 1,
            borderColor: theme.border + '40'
          }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 20 
            }}>
              <View>
                <Text style={{ 
                  fontSize: 24, 
                  fontWeight: '800', 
                  color: theme.text,
                  marginBottom: 4
                }}>
                  Level {currentLevel}
                </Text>
                <Text style={{ 
                  fontSize: 16, 
                  color: theme.text, 
                  opacity: 0.7,
                  fontWeight: '500'
                }}>
                  {totalXP} Total XP
                </Text>
              </View>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.primary + '20',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Ionicons name="diamond" size={28} color={theme.primary} />
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 12 
              }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: theme.text, 
                  opacity: 0.7,
                  fontWeight: '600'
                }}>
                  Progress to Level {currentLevel + 1}
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: theme.text, 
                  opacity: 0.7,
                  fontWeight: '600'
                }}>
                  {xpProgress.current}/{xpProgress.required} XP
                </Text>
              </View>
              
              <View style={{ 
                height: 8, 
                backgroundColor: theme.border + '60', 
                borderRadius: 4, 
                overflow: 'hidden' 
              }}>
                <View style={{ 
                  height: '100%', 
                  width: `${Math.min(xpProgress.percentage, 100)}%`, 
                  backgroundColor: theme.primary, 
                  borderRadius: 4 
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
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: theme.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Ionicons name="trophy" size={12} color={theme.primary} />
                </View>
                <Text style={{ 
                  fontSize: 14, 
                  color: theme.text, 
                  marginLeft: 8,
                  opacity: 0.7,
                  fontWeight: '500'
                }}>
                  {currentLevel === 5 ? 'Max Level Reached!' : `${xpProgress.required - xpProgress.current} XP to next level`}
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
            marginBottom: 20 
          }}>
            <Text style={{ 
              fontSize: 22, 
              fontWeight: '800', 
              color: theme.text 
            }}>
              Today's Activity
            </Text>
            <Pressable onPress={onNavigateToLibrary}>
              <Text style={{ 
                fontSize: 16, 
                color: theme.primary, 
                fontWeight: '700' 
              }}>
                View All
              </Text>
            </Pressable>
          </View>

          <View style={{ 
            backgroundColor: theme.card, 
            borderRadius: 20, 
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: theme.border + '40'
          }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 20 
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: theme.text,
                  marginBottom: 4
                }}>
                  Videos Watched
                </Text>
                <Text style={{ 
                  fontSize: 32, 
                  fontWeight: '800', 
                  color: theme.primary 
                }}>
                  {todaysVideos.length}
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: theme.text,
                  marginBottom: 4
                }}>
                  XP Earned
                </Text>
                <Text style={{ 
                  fontSize: 32, 
                  fontWeight: '800', 
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
                  fontSize: 16, 
                  fontWeight: '700', 
                  color: theme.text, 
                  marginBottom: 16,
                  opacity: 0.8
                }}>
                  Recent Videos
                </Text>
                {todaysVideos.slice(0, 3).map((video) => (
                  <View key={video.id} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: theme.background,
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.primary + '20',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Ionicons 
                        name={getVideoIcon(video) as any} 
                        size={20} 
                        color={theme.primary} 
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={{ 
                        fontSize: 15, 
                        fontWeight: '600', 
                        color: theme.text,
                        marginBottom: 2
                      }} numberOfLines={1}>
                        {video.title}
                      </Text>
                      <Text style={{ 
                        fontSize: 13, 
                        color: theme.text, 
                        opacity: 0.6,
                        fontWeight: '500'
                      }}>
                        {video.category} • {video.platform}
                      </Text>
                    </View>
                    <View style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: getXPColor(video.xp_awarded) + '20'
                    }}>
                      <Text style={{ 
                        fontSize: 14, 
                        fontWeight: '700', 
                        color: getXPColor(video.xp_awarded) 
                      }}>
                        {video.xp_awarded > 0 ? '+' : ''}{video.xp_awarded}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.border + '40',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <Ionicons name="videocam-outline" size={32} color={theme.border} />
                </View>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '600',
                  color: theme.text, 
                  opacity: 0.6, 
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  No videos tracked today
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: theme.text, 
                  opacity: 0.5, 
                  textAlign: 'center'
                }}>
                  Add videos to start earning XP!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 24, marginBottom: 40 }}>
          <Text style={{ 
            fontSize: 22, 
            fontWeight: '800', 
            color: theme.text, 
            marginBottom: 20 
          }}>
            Quick Actions
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable 
              onPress={onNavigateToLibrary}
              style={{ 
                flex: 1,
                backgroundColor: theme.primary, 
                borderRadius: 20, 
                padding: 24,
                alignItems: 'center',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <Ionicons name="add-circle-outline" size={24} color="white" />
              </View>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '700', 
                color: 'white' 
              }}>
                Add Video
              </Text>
            </Pressable>
            
            <Pressable 
              onPress={onNavigateToLibrary}
              style={{ 
                flex: 1,
                backgroundColor: theme.card, 
                borderRadius: 20, 
                padding: 24,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
                borderColor: theme.border + '40'
              }}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <Ionicons name="library-outline" size={24} color={theme.primary} />
              </View>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '700', 
                color: theme.text 
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