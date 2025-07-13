import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import CustomText from '../../components/CustomText';
import Page from '../../components/Page';
import { useThemeStore } from '../../stores/themeStore';
import { Friend, useUserStore } from '../../stores/userStore';

const { width: screenWidth } = Dimensions.get('window');

export default function LeaderboardScreen() {
  const { colors } = useThemeStore();
  const theme = colors;
  const [leaderboard, setLeaderboard] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  
  const { user, getLeaderboard, totalXP } = useUserStore();

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load leaderboard');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadLeaderboard();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh leaderboard');
    } finally {
      setRefreshing(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return theme.text;
    }
  };

  const renderLeaderboardItem = (item: Friend, index: number) => {
    const rank = index + 1;
    const isCurrentUser = item.id === user?.id;
    
    return (
      <View 
        key={item.id} 
        style={[
          styles.leaderboardItem, 
          { 
            backgroundColor: isCurrentUser ? theme.primary + '20' : theme.card,
            borderColor: theme.border,
            borderWidth: isCurrentUser ? 2 : 1
          }
        ]}
      >
        <View style={styles.rankSection}>
          <CustomText 
            fontSize="large" 
            bold 
            style={{ color: getRankColor(rank) }}
          >
            {getRankIcon(rank)}
          </CustomText>
          <CustomText fontSize="small" opacity={0.7}>
            Rank {rank}
          </CustomText>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <CustomText fontSize="large" bold>{item.name.charAt(0)}</CustomText>
          </View>
          <View style={styles.userDetails}>
            <CustomText fontSize="normal" bold numberOfLines={1}>
              {item.name} {isCurrentUser && '(You)'}
            </CustomText>
            <CustomText fontSize="small" opacity={0.7} numberOfLines={1}>
              Level {item.currentLevel} • {item.totalXP} XP
            </CustomText>
            {item.lastActive && (
              <CustomText fontSize="small" opacity={0.5} numberOfLines={1}>
                Last active: {new Date(item.lastActive).toLocaleDateString()}
              </CustomText>
            )}
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <CustomText fontSize="small" opacity={0.7}>Level</CustomText>
            <CustomText fontSize="normal" bold>{item.currentLevel}</CustomText>
          </View>
          <View style={styles.statItem}>
            <CustomText fontSize="small" opacity={0.7}>Total XP</CustomText>
            <CustomText fontSize="normal" bold>{item.totalXP}</CustomText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Page>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsHorizontalScrollIndicator={false}
      >
        <CustomText style={styles.title} fontSize="large" bold>Leaderboard</CustomText>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <View 
            style={[
              styles.tab, 
              { 
                backgroundColor: activeTab === 'global' ? theme.primary : theme.card,
                borderColor: theme.border
              }
            ]}
            onTouchEnd={() => setActiveTab('global')}
          >
            <CustomText 
              fontSize="normal" 
              bold 
              style={{ color: activeTab === 'global' ? '#FFFFFF' : theme.text }}
            >
              Global
            </CustomText>
          </View>
          <View 
            style={[
              styles.tab, 
              { 
                backgroundColor: activeTab === 'friends' ? theme.primary : theme.card,
                borderColor: theme.border
              }
            ]}
            onTouchEnd={() => setActiveTab('friends')}
          >
            <CustomText 
              fontSize="normal" 
              bold 
              style={{ color: activeTab === 'friends' ? '#FFFFFF' : theme.text }}
            >
              Friends
            </CustomText>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardContainer}>
          {leaderboard.length > 0 ? (
            leaderboard.map(renderLeaderboardItem)
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Ionicons name="trophy-outline" size={48} color={theme.text} />
              <CustomText fontSize="normal" opacity={0.7} textAlign="center">
                {activeTab === 'global' 
                  ? 'No users found. Be the first to start earning XP!'
                  : 'No friends found. Add friends to see their rankings!'
                }
              </CustomText>
            </View>
          )}
        </View>

        {/* Current User Stats */}
        {user && (
          <View style={[styles.currentUserCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <CustomText fontSize="normal" bold style={styles.sectionTitle}>Your Stats</CustomText>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <CustomText fontSize="large" bold style={{ color: theme.primary }}>{user.currentLevel}</CustomText>
                <CustomText fontSize="small" opacity={0.7}>Current Level</CustomText>
              </View>
              <View style={styles.statCard}>
                <CustomText fontSize="large" bold style={{ color: theme.primary }}>{user.currentXp}</CustomText>
                <CustomText fontSize="small" opacity={0.7}>Current XP</CustomText>
              </View>
              <View style={styles.statCard}>
                <CustomText fontSize="large" bold style={{ color: theme.primary }}>{totalXP}</CustomText>
                <CustomText fontSize="small" opacity={0.7}>Total XP</CustomText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    width: '100%',
  },
  title: {
    marginBottom: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardContainer: {
    marginBottom: 20,
    width: '100%',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    minHeight: 80,
    width: '100%',
  },
  rankSection: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
    flexShrink: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#20B2AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  statsSection: {
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 80,
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 4,
  },
  currentUserCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    minHeight: 120,
    width: '100%',
  },
}); 