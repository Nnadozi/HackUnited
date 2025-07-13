import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { useThemeStore } from "../../stores/themeStore";

const TAB_ITEMS = [
  { name: "home", icon: "home", route: "/(tabs)/home" },
  { name: "videos", icon: "videocam", route: "/(tabs)/videos" },
  { name: "add-video", icon: "add-circle", route: "/(tabs)/add-video" },
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
                  {shadowColor: colors.primary},
                  { borderRadius: 32, borderWidth: 2, borderColor: theme.primary },
                  { backgroundColor: theme.background },
                ]}>
                  {TAB_ITEMS.map((tab, idx) => {
                    const focused = currentRoute === tab.name;
                    return (
                      <Pressable
                        key={tab.name}
                        onPress={() => router.replace(tab.route as any)}
                        style={[
                          styles.tabButton,
                          focused
                            ? { backgroundColor: theme.background, borderColor: theme.background }
                            : { backgroundColor: theme.background, borderColor: theme.background },
                        ]}
                      >
                        <Ionicons
                          name={tab.icon as any}
                          size={30}
                          color={focused ? theme.primary : theme.border}
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
      </Tabs>
      
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
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 32,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 0,
    justifyContent: 'space-evenly',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowColor: "#0000"
  },
  tabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 32,
    // Center vertically with the pill
    // pill top: bottom: 32, pill height: TAB_BAR_HEIGHT, button size: TAB_BUTTON_SIZE
    // top = window height - bottom - pill height + (pill height - button size) / 2
    top: Dimensions.get('window').height - 32 - TAB_BAR_HEIGHT + (TAB_BAR_HEIGHT - TAB_BUTTON_SIZE) / 2,
    width: TAB_BUTTON_SIZE,
    height: TAB_BUTTON_SIZE,
    borderRadius: TAB_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 20,
    backgroundColor: '#fff',
  },
});