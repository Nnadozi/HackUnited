import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LevelUpModal } from "../../components/LevelUpModal";
import { GlobalXPFeedback } from "../../components/XPFeedback";
import { useThemeStore } from "../../stores/themeStore";

const TAB_ITEMS = [
  { name: "home", icon: "home", route: "/(tabs)/home" },
  { name: "videos", icon: "videocam", route: "/(tabs)/videos" },
  { name: "add-video", icon: "add-circle", route: "/(tabs)/add-video" },
  { name: "friends", icon: "people", route: "/(tabs)/friends" },
  { name: "leaderboard", icon: "trophy", route: "/(tabs)/leaderboard" },
];

export default function TabsLayout() {
  const { colors } = useThemeStore();
  const theme = colors; 
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] || "home";

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={() => {
          return (
            <View style={styles.tabBarContainer}>
              <View style={[
                styles.tabBarShadow,
                { borderRadius: 32 },
                { backgroundColor: theme.primary }
              ]}>
                <View style={[
                  styles.tabBar,
                  { backgroundColor: theme.background },
                ]}>
                  {TAB_ITEMS.map((tab, idx) => {
                    const focused = currentRoute === tab.name;
                    const isAddButton = tab.name === 'add-video';
                    return (
                      <Pressable
                        key={tab.name}
                        onPress={() => router.replace(tab.route as any)}
                        style={[
                          styles.tabButton,
                          {
                            backgroundColor: focused ? theme.primary : "transparent",
                          },
                          isAddButton && styles.addButton,
                          isAddButton && {
                            shadowColor: theme.primary,
                          },
                          focused &&
                            isAddButton && {
                              borderWidth: 3,
                              borderColor: "white",
                              shadowOpacity: 0.5,
                              shadowRadius: 12,
                            },
                        ]}
                      >
                        <Ionicons
                          name={tab.icon as any}
                          size={isAddButton ? 36 : 28}
                          color={
                            isAddButton 
                              ? (theme.background === '#E5EBEA' ? '#101419' : 'white') // Black in light mode, white in dark mode
                              : focused 
                                ? 'white'
                                : theme.text
                          }
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="videos" />
        <Tabs.Screen name="add-video" />
        <Tabs.Screen name="friends" />
        <Tabs.Screen name="leaderboard" />
      </Tabs>
      
      {/* Global XP Feedback Animation */}
      <GlobalXPFeedback />
      
      {/* Level Up Modal with Confetti */}
      <LevelUpModal />
    </>
  );
}


const TAB_BUTTON_SIZE = 56;
const TAB_BAR_HEIGHT = 72; // pill height (padding + button size)

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: '100%',
  },
  tabBarShadow: {
    width: '90%',
    borderRadius: 32,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 32,
    height: TAB_BAR_HEIGHT,
  },
  tabButton: {
    width: TAB_BUTTON_SIZE,
    height: TAB_BUTTON_SIZE,
    borderRadius: TAB_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});