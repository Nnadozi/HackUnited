import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';
import { Friend, FriendRequest, useUserStore } from '../stores/userStore';

type TabType = 'friends' | 'leaderboard' | 'requests';

interface FriendsScreenProps {
  onNavigateBack: () => void;
}

export default function FriendsScreen({ onNavigateBack }: FriendsScreenProps) {
  const { colors, isDark, setThemeMode } = useThemeStore();
  const theme = colors;
  
  const { 
    friends, 
    friendRequests,
    getLeaderboard, 
    removeFriend, 
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    searchUsers,
    syncFriendsData
  } = useUserStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const leaderboard = getLeaderboard();

  useEffect(() => {
    // Auto-sync friends data when component mounts
    syncFriendsData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (email: string) => {
    setIsSendingRequest(true);
    try {
      const success = await sendFriendRequest(email);
      if (success) {
        Alert.alert('Success', 'Friend request sent!');
        setShowAddFriendModal(false);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        Alert.alert('Error', 'User not found or already friends');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send friend request');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleRemoveFriend = (friend: Friend) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.name} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => removeFriend(friend.id) 
        }
      ]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncFriendsData();
    setIsRefreshing(false);
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Unknown';
    
    const now = new Date();
    const activeTime = new Date(lastActive);
    const diffInMinutes = Math.floor((now.getTime() - activeTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getLevelBadgeColor = (level: number) => {
    const colors = ['#9E9E9E', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    return colors[level] || '#9E9E9E';
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.profilePicture || 'https://i.pravatar.cc/150?u=default' }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: theme.border
          }}
        />
        {item.isOnline && (
          <View style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#4CAF50',
            borderWidth: 2,
            borderColor: theme.card
          }} />
        )}
      </View>
      
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.text,
          marginBottom: 2
        }}>
          {item.name}
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.text,
          opacity: 0.6
        }}>
          {item.isOnline ? 'Online' : `Last seen ${formatLastActive(item.lastActive)}`}
        </Text>
      </View>
      
      <View style={{ alignItems: 'flex-end' }}>
        <View style={{
          backgroundColor: getLevelBadgeColor(item.currentLevel),
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 4
        }}>
          <Ionicons name="diamond" size={12} color="white" />
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: 'white',
            marginLeft: 4
          }}>
            L{item.currentLevel}
          </Text>
        </View>
        <Text style={{
          fontSize: 12,
          color: theme.text,
          opacity: 0.6
        }}>
          {item.totalXP} XP
        </Text>
      </View>
      
      <Pressable
        onPress={() => handleRemoveFriend(item)}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: theme.background,
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 12
        }}
      >
        <Ionicons name="ellipsis-horizontal" size={16} color={theme.text} />
      </Pressable>
    </View>
  );

  const renderLeaderboardItem = ({ item, index }: { item: Friend; index: number }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : theme.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '700',
          color: index < 3 ? 'white' : theme.text
        }}>
          {index + 1}
        </Text>
      </View>
      
      <Image
        source={{ uri: item.profilePicture || 'https://i.pravatar.cc/150?u=default' }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.border,
          marginRight: 12
        }}
      />
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.text,
          marginBottom: 2
        }}>
          {item.friendshipDate === 'You' ? `${item.name} (You)` : item.name}
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.text,
          opacity: 0.6
        }}>
          Level {item.currentLevel}
        </Text>
      </View>
      
      <Text style={{
        fontSize: 18,
        fontWeight: '700',
        color: theme.primary
      }}>
        {item.totalXP}
      </Text>
    </View>
  );

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <Image
        source={{ uri: item.fromUser.profilePicture || 'https://i.pravatar.cc/150?u=default' }}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: theme.border,
          marginRight: 12
        }}
      />
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.text,
          marginBottom: 2
        }}>
          {item.fromUser.name}
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.text,
          opacity: 0.6
        }}>
          {item.fromUser.email}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => rejectFriendRequest(item.id)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.background,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="close" size={18} color="#F44336" />
        </Pressable>
        
        <Pressable
          onPress={() => acceptFriendRequest(item.id)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.primary,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="checkmark" size={18} color="white" />
        </Pressable>
      </View>
    </View>
  );

  const renderSearchResult = ({ item }: { item: Friend }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    }}>
      <Image
        source={{ uri: item.profilePicture || 'https://i.pravatar.cc/150?u=default' }}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: theme.border,
          marginRight: 12
        }}
      />
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.text,
          marginBottom: 2
        }}>
          {item.name}
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.text,
          opacity: 0.6
        }}>
          {item.email}
        </Text>
      </View>
      
      <Pressable
        onPress={() => handleSendFriendRequest(item.email)}
        disabled={isSendingRequest}
        style={{
          backgroundColor: theme.primary,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 12,
          opacity: isSendingRequest ? 0.6 : 1
        }}
      >
        {isSendingRequest ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: 'white'
          }}>
            Add
          </Text>
        )}
      </Pressable>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="people-outline" size={48} color={theme.border} />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.text,
                  marginTop: 16,
                  marginBottom: 8
                }}>
                  No friends yet
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: theme.text,
                  opacity: 0.6,
                  textAlign: 'center'
                }}>
                  Add friends to see them here
                </Text>
              </View>
            }
          />
        );
      
      case 'leaderboard':
        return (
          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
          />
        );
      
      case 'requests':
        return (
          <FlatList
            data={friendRequests}
            renderItem={renderFriendRequest}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="mail-outline" size={48} color={theme.border} />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.text,
                  marginTop: 16,
                  marginBottom: 8
                }}>
                  No friend requests
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: theme.text,
                  opacity: 0.6,
                  textAlign: 'center'
                }}>
                  Friend requests will appear here
                </Text>
              </View>
            }
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border + '40'
      }}>
        <Pressable onPress={onNavigateBack}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={{
          fontSize: 28,
          fontWeight: '800',
          color: theme.text
        }}>
          Friends
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
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
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={theme.text} />
          </Pressable>
          
          <Pressable
            onPress={() => setShowAddFriendModal(true)}
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
            <Ionicons name="person-add" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 8
      }}>
        {[
          { key: 'friends', label: 'Friends', count: friends.length },
          { key: 'leaderboard', label: 'Leaderboard', count: leaderboard.length },
          { key: 'requests', label: 'Requests', count: friendRequests.length }
        ].map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key as TabType)}
            style={{
              flex: 1,
              backgroundColor: activeTab === tab.key ? theme.primary : theme.card,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === tab.key ? 'white' : theme.text
            }}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={{
                backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : theme.primary,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
                minWidth: 20,
                alignItems: 'center'
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: activeTab === tab.key ? 'white' : 'white'
                }}>
                  {tab.count}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {renderTabContent()}
      </View>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriendModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddFriendModal(false)}
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
            paddingBottom: 40,
            maxHeight: '80%'
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: theme.text
              }}>
                Add Friend
              </Text>
              <Pressable
                onPress={() => setShowAddFriendModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.card,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="close" size={18} color={theme.text} />
              </Pressable>
            </View>

            <TextInput
              style={{
                backgroundColor: theme.card,
                borderRadius: 16,
                padding: 16,
                fontSize: 16,
                color: theme.text,
                marginBottom: 16
              }}
              placeholder="Search by name or email..."
              placeholderTextColor={theme.text + '60'}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />

            {isSearching ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{
                  fontSize: 16,
                  color: theme.text,
                  marginTop: 12
                }}>
                  Searching...
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  searchQuery.length > 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <Ionicons name="search-outline" size={48} color={theme.border} />
                      <Text style={{
                        fontSize: 16,
                        color: theme.text,
                        marginTop: 12
                      }}>
                        No users found
                      </Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <Text style={{
                        fontSize: 16,
                        color: theme.text,
                        opacity: 0.6
                      }}>
                        Start typing to search for friends
                      </Text>
                    </View>
                  )
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 