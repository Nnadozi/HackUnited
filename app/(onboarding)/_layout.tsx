import { Ionicons } from '@expo/vector-icons';
import { router, Slot, useSegments } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/CustomText';
import { useThemeStore } from '../../stores/themeStore';

export default function OnboardingLayout() {
  const { isDark, setThemeMode, colors } = useThemeStore();
  const theme = colors;
  const segments = useSegments();
  const screens = ['welcome', 'levels', 'loose', 'done'];
  const currentScreen = segments[segments.length - 1] || 'welcome';
  const currentIndex = screens.indexOf(currentScreen);

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header with theme toggle and skip button */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
        <Pressable
          onPress={toggleTheme}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.card
          }}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={24}
            color={theme.text}
          />
        </Pressable>
        <Pressable onPress={handleSkip}>
          <CustomText bold>
            Skip
          </CustomText>
        </Pressable>
      </View>

      {/* Render the current onboarding screen */}
      <Slot />

      {/* Page Indicators */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 24 }}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              marginHorizontal: 8,
              backgroundColor: index === currentIndex ? theme.primary : theme.border,
              opacity: index === currentIndex ? 1 : 0.3,
            }}
          />
        ))}
      </View>
    </SafeAreaView>
  );
} 