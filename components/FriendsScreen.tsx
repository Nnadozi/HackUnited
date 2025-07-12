import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';
import { Friend, useUserStore } from '../stores/userStore';

export default function FriendsScreen() {
  const { colors, isDark, setThemeMode } = useThemeStore();
  const theme = colors;
  
  const { getLeaderboard, addFriend, removeFriend } = useUserStore();
  const leaderboard = getLeaderboard();

  const [showAddModal, setShowAddModal] = useState(false);
  const [friendName, setFriendName] = useState('');

  const handleAddFriend = () => {
    if (!friendName.trim()) {
      Alert.alert('Error', 'Please enter a friend\'s name');
      return;
    }

    const newFriend: Friend = {
      id: `friend_${Date.now()}`,
      name: friendName,
      totalXP: Math.floor(Math.random() * 200),
      currentLevel: Math.floor(Math.random() * 5),
      profilePicture: `https://i.pravatar.cc/150?u=${friendName}`
    };

    addFriend(newFriend);
    setFriendName('');
    setShowAddModal(false);
  };

  const LeaderboardItem = ({ item, index }: { item: Friend, index: number }) => {
    const isUser = item.name.includes('(You)');
    const rank = index + 1;
    let rankColor = theme.text;
    if (rank === 1) rankColor = '#FFD700'; // Gold
    if (rank === 2) rankColor = '#C0C0C0'; // Silver
    if (rank === 3) rankColor = '#CD7F32'; // Bronze

    return (
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 12, 
        paddingHorizontal: 20,
        backgroundColor: isUser ? theme.primary + '20' : theme.card,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: isUser ? 2 : 1,
        borderColor: isUser ? theme.primary : theme.border,
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: rankColor, width: 30 }}>
          {rank}
        </Text>
        <Image 
          source={{ uri: item.profilePicture }} 
          style={{ width: 48, height: 48, borderRadius: 24, marginHorizontal: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>{item.name}</Text>
          <Text style={{ fontSize: 14, color: theme.text, opacity: 0.7 }}>
            Level {item.currentLevel} • {item.totalXP} XP
          </Text>
        </View>
        {!isUser && (
          <Pressable onPress={() => removeFriend(item.id)}>
            <Ionicons name="person-remove-outline" size={20} color="#F44336" />
          </Pressable>
        )}
      </View>
    );
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
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, flex: 1 }}>
          Leaderboard
        </Text>
        <Pressable onPress={() => setShowAddModal(true)}>
          <Ionicons name="person-add-outline" size={24} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {leaderboard.map((item, index) => (
          <LeaderboardItem key={item.id} item={item} index={index} />
        ))}
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{ 
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            width: '90%',
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>
              Add a Friend
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.background,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.border,
                marginBottom: 16
              }}
              placeholder="Enter friend's name or email"
              placeholderTextColor={theme.text + '80'}
              value={friendName}
              onChangeText={setFriendName}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text style={{ fontSize: 16, color: theme.text, opacity: 0.7 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddFriend}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.primary }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 