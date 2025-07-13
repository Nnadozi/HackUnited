import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import CustomText from '../../components/CustomText';
import Page from '../../components/Page';
import { useThemeStore } from '../../stores/themeStore';
import { Friend, FriendRequest, useUserStore } from '../../stores/userStore';

const { width: screenWidth } = Dimensions.get('window');

export default function FriendsScreen() {
  const { colors } = useThemeStore();
  const theme = colors;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    friends,
    friendRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getLeaderboard,
    syncFriendsData
  } = useUserStore();

  useEffect(() => {
    syncFriendsData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (friendId: string) => {
    try {
      const success = await sendFriendRequest(friendId);
      if (success) {
        Alert.alert('Success', 'Friend request sent!');
        setSearchResults([]);
        setSearchQuery('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      Alert.alert('Success', 'Friend request rejected');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(friendId);
              Alert.alert('Success', 'Friend removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await syncFriendsData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const renderFriend = (friend: Friend) => (
    <View key={friend.id} style={[styles.friendCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.friendInfo}>
        <View style={styles.avatar}>
          <CustomText fontSize="large" bold>{friend.name.charAt(0)}</CustomText>
        </View>
        <View style={styles.friendDetails}>
          <CustomText fontSize="normal" bold numberOfLines={1}>{friend.name}</CustomText>
          <CustomText fontSize="small" opacity={0.7} numberOfLines={1}>Level {friend.currentLevel} • {friend.totalXP} XP</CustomText>
          <CustomText fontSize="small" opacity={0.5} numberOfLines={1}>{friend.email}</CustomText>
        </View>
      </View>
      <View style={styles.friendActions}>
        <CustomButton
          title="✕"
          onPress={() => handleRemoveFriend(friend.id)}
          style={[styles.iconButton, { backgroundColor: '#F44336' }] as any}
          width={32}
        />
      </View>
    </View>
  );

  const renderFriendRequest = (request: FriendRequest) => (
    <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.friendInfo}>
        <View style={styles.avatar}>
          <CustomText fontSize="large" bold>{request.fromUser.name.charAt(0)}</CustomText>
        </View>
        <View style={styles.friendDetails}>
          <CustomText fontSize="normal" bold numberOfLines={1}>{request.fromUser.name}</CustomText>
          <CustomText fontSize="small" opacity={0.7} numberOfLines={1}>{request.fromUser.email}</CustomText>
        </View>
      </View>
      <View style={styles.requestActions}>
        <CustomButton
          title="✓"
          onPress={() => handleAcceptRequest(request.id)}
          style={[styles.iconButton, { backgroundColor: '#4CAF50' }] as any}
          width={32}
        />
        <CustomButton
          title="✕"
          onPress={() => handleRejectRequest(request.id)}
          style={[styles.iconButton, { backgroundColor: '#F44336' }] as any}
          width={32}
        />
      </View>
    </View>
  );

  const renderSearchResult = (user: Friend) => (
    <View key={user.id} style={[styles.searchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.friendInfo}>
        <View style={styles.avatar}>
          <CustomText fontSize="large" bold>{user.name.charAt(0)}</CustomText>
        </View>
        <View style={styles.friendDetails}>
          <CustomText fontSize="normal" bold numberOfLines={1}>{user.name}</CustomText>
          <CustomText fontSize="small" opacity={0.7} numberOfLines={1}>Level {user.currentLevel} • {user.totalXP} XP</CustomText>
          <CustomText fontSize="small" opacity={0.5} numberOfLines={1}>{user.email}</CustomText>
        </View>
      </View>
      <CustomButton
        title="Add Friend"
        onPress={() => handleSendRequest(user.id)}
        style={styles.addButton}
      />
    </View>
  );

  return (
    <Page style={{justifyContent: 'flex-start', paddingHorizontal: 20}}>
      <CustomText fontSize="large" bold style={styles.title}>Friends</CustomText>
      
      {/* Search Section */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.searchInputWrapper}>
          <CustomInput
            placeholder="Search users by username..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              ...styles.searchInput,
              color: colors.text,
              backgroundColor: colors.background,
              borderColor: colors.border
            }}
            width="100%"
            placeholderTextColor={colors.text + '80'}
          />
        </View>
        <CustomButton
          title="Search"
          onPress={handleSearch}
          disabled={isSearching}
          isLoading={isSearching}
          style={styles.searchButton}
          width={100}
        />
      </View>

      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <CustomText fontSize="normal" bold style={styles.sectionTitle}>Search Results</CustomText>
            {searchResults.map(renderSearchResult)}
          </View>
        )}

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <View style={styles.section}>
            <CustomText fontSize="normal" bold style={styles.sectionTitle}>
              Friend Requests ({friendRequests.length})
            </CustomText>
            {friendRequests.map(renderFriendRequest)}
          </View>
        )}

        {/* Friends List */}
        <View style={styles.section}>
          <CustomText fontSize="normal" bold style={styles.sectionTitle}>
            Your Friends ({friends.length})
          </CustomText>
          {friends.length > 0 ? (
            friends.map(renderFriend)
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="people-outline" size={48} color={theme.text} />
              <CustomText fontSize="normal" opacity={0.7} textAlign="center">
                No friends yet. Search for users to add friends!
              </CustomText>
            </View>
          )}
        </View>
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
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  searchSection: {
    marginBottom: 24,
    width: '100%',
  },
  section: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
  },
  searchInput: {
    minHeight: 50,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 70,
    height: 50,
  },
  searchResults: {
    marginTop: 16,
    width: '100%',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    minHeight: 80,
    width: '100%',
  },
  requestCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    width: '100%',
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    minHeight: 80,
    width: '100%',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#20B2AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    marginBottom: 4,
  },
  friendActions: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  addButton: {
    minWidth: 100,
    maxWidth: 120,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
  },
}); 