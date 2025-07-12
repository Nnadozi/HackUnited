import { useThemeStore } from "@/stores/themeStore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { CustomDarkTheme, CustomLightTheme } from "@/constants/Colors";
import { DefaultTheme, DarkTheme, ThemeProvider } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDark } = useThemeStore();
  const [loaded, error] = useFonts({
    'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Bold': require('../assets/fonts/DMSans-Bold.ttf'),
    'DMSans-Italic': require('../assets/fonts/DMSans-Italic.ttf'),
  });
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
    <StatusBar style={isDark ? "light" : "dark"}/>
    <SafeAreaProvider>
      <ThemeProvider
        value={{
          ...(isDark ? DarkTheme : DefaultTheme),
          colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            ...(isDark ? CustomDarkTheme : CustomLightTheme),
          },
        }}
      >
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
    </>
)
}
