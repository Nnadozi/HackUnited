import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import AuthScreen from './AuthScreen';
import CustomButton from './CustomButton';
import CustomText from './CustomText';
import Page from './Page';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreen {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  buttonText: string;
  onNext: () => void;
}

interface AnimatedScreenProps {
  screen: OnboardingScreen;
  index: number;
  translateX: Animated.SharedValue<number>;
  theme: any;
}

const AnimatedScreen = React.memo(({ screen, index, translateX, theme }: AnimatedScreenProps) => {
  const animatedContentStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    const opacity = interpolate(
      translateX.value,
      inputRange,
      [0, 1, 0],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View key={screen.id} style={styles.screen}>
      <Animated.View style={[{flex: 1}, animatedContentStyle]}>
        <Page>
          {screen.content}
          <CustomText textAlign="center" fontSize="XL" bold>
            {screen.title}
          </CustomText>
          <CustomText textAlign="center" fontSize="normal" style={{ color: theme.secondary }}>
            {screen.subtitle}
          </CustomText>
          <CustomButton
            onPress={screen.onNext}
            style={{ marginTop: 15 }}
            title={screen.buttonText}
            width="80%"
          />
        </Page>
      </Animated.View>
    </View>
  );
});

export default function SwipeableOnboarding() {
  const { isDark, setThemeMode, colors } = useThemeStore();
  const { completeOnboarding, setUser } = useUserStore();
  const theme = colors;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const translateX = useSharedValue(0);
  const panRef = useRef<PanGestureHandler>(null);

  const handleAuthComplete = async (userInfo: any) => {
    try {
      // Set user in store
      await setUser(userInfo);
      
      // Complete onboarding
      completeOnboarding();
      
      // Navigate to home
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error completing authentication:', error);
    }
  };

  const screens: OnboardingScreen[] = [
    {
      id: 'welcome',
      title: 'Welcome to Clarity',
      subtitle: 'Level up your productivity by tracking video quality',
      content: (
        <View style={styles.welcomeContainer}>
          <Image source={require('../assets/images/icon.png')} style={styles.appLogo} />
        </View>
      ),
      buttonText: 'Get Started',
      onNext: () => goToNext()
    },
    {
      id: 'track',
      title: 'Track Your Videos',
      subtitle: 'Add videos you watch daily. Our AI analyzes content quality - educational content earns XP, brain rot loses it.',
      content: (
        <View style={styles.iconContainer}>
          <Ionicons name="videocam-outline" size={64} color={theme.background} />
        </View>
      ),
      buttonText: 'Continue',
      onNext: () => goToNext()
    },
    {
      id: 'levels',
      title: 'Level Up System',
      subtitle: 'Earn 1-3 XP for quality content. Reach Level 5 with 200 XP total. Lose 2 videos worth of progress daily if inactive.',
      content: (
        <View style={styles.levelContainer}>
          <View style={styles.levelItem}>
            <Ionicons name="star" size={32} color={theme.primary} />
            <CustomText fontSize="normal" bold>Infinite Levels</CustomText>
            <CustomText fontSize="small" opacity={0.7}>Progress through levels</CustomText>
          </View>
          <View style={styles.levelItem}>
            <Ionicons name="trending-up" size={32} color={theme.primary} />
            <CustomText fontSize="normal" bold>Smart XP Awards</CustomText>
            <CustomText fontSize="small" opacity={0.7}>Quality content = more XP</CustomText>
          </View>
          <View style={styles.levelItem}>
            <Ionicons name="time" size={32} color={theme.primary} />
            <CustomText fontSize="normal" bold>Daily Progress</CustomText>
            <CustomText fontSize="small" opacity={0.7}>Stay consistent to maintain levels</CustomText>
          </View>
        </View>
      ),
      buttonText: 'Continue',
      onNext: () => goToNext()
    },
    {
      id: 'advanced',
      title: 'Advanced Levels',
      subtitle: 'After Level 5, standards become higher. Only truly excellent content gives positive XP. Choose wisely!',
      content: (
        <View style={styles.advancedContainer}>
          <Ionicons name="warning" size={64} color="#FFA500" />
          <CustomText fontSize="normal" bold style={{ marginTop: 16 }}>
            Higher Standards
          </CustomText>
          <CustomText fontSize="small" opacity={0.7} textAlign="center" style={{ marginTop: 8 }}>
            Level 6+ introduces penalties for mediocre content. Only the best content earns positive XP.
          </CustomText>
        </View>
      ),
      buttonText: 'I Understand',
      onNext: () => goToNext()
    },
    {
      id: 'habits',
      title: 'Build Better Habits',
      subtitle: 'Transform your viewing habits. Gaming content = negative XP. Learning & productivity = positive XP.',
      content: (
        <View style={styles.habitsContainer}>
          <Ionicons name="bulb-outline" size={64} color={theme.primary} />
          <CustomText fontSize="normal" bold style={{ marginTop: 16 }}>
            Mindful Consumption
          </CustomText>
          <CustomText fontSize="small" opacity={0.7} textAlign="center" style={{ marginTop: 8 }}>
            Make every video count towards your personal growth
          </CustomText>
        </View>
      ),
      buttonText: 'Sign In',
      onNext: () => setShowAuth(true)
    }
  ];

  const goToNext = () => {
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
      translateX.value = withSpring(-(currentIndex + 1) * SCREEN_WIDTH, {
        damping: 15,
        stiffness: 80,
        mass: 1,
      });
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      translateX.value = withSpring(-(currentIndex - 1) * SCREEN_WIDTH, {
        damping: 15,
        stiffness: 80,
        mass: 1,
      });
    }
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context: any) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const threshold = SCREEN_WIDTH * 0.3;
      
      if (event.translationX > threshold && event.velocityX > 500) {
        runOnJS(goToPrevious)();
      } else if (event.translationX < -threshold && event.velocityX < -500) {
        runOnJS(goToNext)();
      } else {
        translateX.value = withSpring(-currentIndex * SCREEN_WIDTH, {
          damping: 15,
          stiffness: 80,
          mass: 1,
        });
      }
    }
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }]
    };
  });

  const handleSkip = () => {
    setShowAuth(true);
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  if (showAuth) {
    return <AuthScreen onAuthComplete={handleAuthComplete} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header with theme toggle and skip button */}
      <View style={styles.header}>
        <View
          style={[styles.themeButton, { backgroundColor: theme.card }]}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={24}
            color={theme.text}
            onPress={toggleTheme}
          />
        </View>
        <CustomText bold onPress={handleSkip}>
          Skip
        </CustomText>
      </View>

      {/* Swipeable Content */}
      <PanGestureHandler ref={panRef} onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.container, animatedStyle]}>
          {screens.map((screen, index) => (
            <AnimatedScreen
              key={screen.id}
              screen={screen}
              index={index}
              translateX={translateX}
              theme={theme}
            />
          ))}
        </Animated.View>
      </PanGestureHandler>

      {/* Page Indicators */}
      <View style={styles.indicators}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentIndex ? theme.primary : theme.border,
                opacity: index === currentIndex ? 1 : 0.3,
              }
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  themeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  screen: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appLogo: {
    width: 150,
    height: 150,
    borderRadius: 30,
    marginBottom: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelContainer: {
    gap: 20,
    marginBottom: 20,
  },
  levelItem: {
    alignItems: 'center',
    gap: 8,
  },
  advancedContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  habitsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
}); 

