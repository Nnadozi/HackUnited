import AuthScreen from '@/components/AuthScreen';
import FriendsScreen from '@/components/FriendsScreen';
import HomeScreen from '@/components/HomeScreen';
import { LevelUpModal } from '@/components/LevelUpModal';
import OnboardingFlow from '@/components/OnboardingFlow';
import VideoAnalysisTest from '@/components/VideoAnalysisTest';
import VideoLibraryScreen from '@/components/VideoLibraryScreen';
import { useThemeStore } from '@/stores/themeStore';
import { useUserStore } from '@/stores/userStore';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, AppState, Pressable, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

type AppView = 'loading' | 'onboarding' | 'auth' | 'main';

const TabButton = ({ 
  tab, 
  isActive, 
  onPress, 
  icon, 
  label, 
  theme 
}: {
  tab: string;
  isActive: boolean;
  onPress: () => void;
  icon: string;
  label: string;
  theme: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={{ flex: 1, alignItems: 'center' }}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          backgroundColor: isActive ? theme.primary + '20' : 'transparent',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
          minWidth: 60,
          alignItems: 'center',
        }}
      >
        <View style={{ marginBottom: 4 }}>
          <Ionicons 
            name={icon as any} 
            size={24} 
            color={isActive ? theme.primary : theme.text + '80'} 
          />
        </View>
        <Text
          style={{
            fontSize: 12,
            fontWeight: isActive ? '600' : '500',
            color: isActive ? theme.primary : theme.text + '80',
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export default function Index() {
  const [view, setView] = useState<AppView>('loading');
  const { colors } = useThemeStore();
  const { 
    setUser, 
    completeOnboarding, 
    applyDailyDecay, 
    lastXpChange,
    logout,
    isAuthenticated
  } = useUserStore();
  
  const [activeTab, setActiveTab] = useState('home');

  // For XP change animation
  const [xpFeedback, setXpFeedback] = useState<{ amount: number; key: number } | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAuthStatus();
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Watch for logout - when user is no longer authenticated, go to auth screen
  useEffect(() => {
    if (!isAuthenticated && view === 'main') {
      setView('auth');
    }
  }, [isAuthenticated, view]);

  // Effect to trigger XP feedback animation
  useEffect(() => {
    if (lastXpChange !== 0) {
      setXpFeedback({ amount: lastXpChange, key: Date.now() });
      feedbackAnim.setValue(0);
      Animated.sequence([
        Animated.timing(feedbackAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(feedbackAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => setXpFeedback(null));
    }
  }, [lastXpChange]);

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      applyDailyDecay();
    }
  };

  const checkAuthStatus = async () => {
    try {
      const onboardingComplete = await SecureStore.getItemAsync('onboarding_complete');
      if (!onboardingComplete) {
        setView('onboarding');
        return;
      }

      const userInfo = await SecureStore.getItemAsync('user_info');
      const authToken = await SecureStore.getItemAsync('auth_token');

      if (userInfo && authToken) {
        setUser(JSON.parse(userInfo));
        completeOnboarding();
        applyDailyDecay();
        setView('main');
      } else {
        setView('auth');
      }
    } catch (error) {
      setView('auth');
    }
  };

  const handleOnboardingComplete = async () => {
    await SecureStore.setItemAsync('onboarding_complete', 'true');
    setView('auth');
  };

  const handleAuthComplete = (userInfo: any) => {
    setUser(userInfo);
    completeOnboarding();
    setView('main');
  };
  
  const XPFeedback = () => {
    if (!xpFeedback) return null;
    
    const isPositive = xpFeedback.amount > 0;
    const translateY = feedbackAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0]
    });
    
    return (
      <Animated.View style={{
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        padding: 16,
        backgroundColor: isPositive ? '#4CAF50' : '#F44336',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        transform: [{ translateY }],
        opacity: feedbackAnim,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10
      }}>
        <Ionicons name={isPositive ? "arrow-up" : "arrow-down"} size={20} color="white" />
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
          {isPositive ? '+' : ''}{xpFeedback.amount} XP
        </Text>
        {isPositive && <ConfettiCannon count={50} origin={{x: -10, y: 0}} fallSpeed={2000} explosionSpeed={300} />}
      </Animated.View>
    );
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateToLibrary={() => setActiveTab('library')} />;
      case 'library':
        return <VideoLibraryScreen onNavigateBack={() => setActiveTab('home')} />;
      case 'friends':
        return <FriendsScreen onNavigateBack={() => setActiveTab('home')} />;
      case 'test':
        return <VideoAnalysisTest onClose={() => setActiveTab('home')} />;
      default:
        return <HomeScreen onNavigateToLibrary={() => setActiveTab('library')} />;
    }
  };

  const MainApp = () => (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {renderContent()}
      
      {/* Bottom Navigation */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.card,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border + '40',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <TabButton
          tab="home"
          isActive={activeTab === 'home'}
          onPress={() => setActiveTab('home')}
          icon="home"
          label="Home"
          theme={colors}
        />
        <TabButton
          tab="library"
          isActive={activeTab === 'library'}
          onPress={() => setActiveTab('library')}
          icon="videocam"
          label="Library"
          theme={colors}
        />
        <TabButton
          tab="friends"
          isActive={activeTab === 'friends'}
          onPress={() => setActiveTab('friends')}
          icon="people"
          label="Friends"
          theme={colors}
        />
        <TabButton
          tab="test"
          isActive={activeTab === 'test'}
          onPress={() => setActiveTab('test')}
          icon="flask"
          label="Test"
          theme={colors}
        />
      </View>

      {/* XP Feedback Animation */}
      <XPFeedback />
      
      {/* Level Up Modal */}
      <LevelUpModal />
    </View>
  );

  if (view === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  switch (view) {
    case 'onboarding':
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    case 'auth':
      return <AuthScreen onAuthComplete={handleAuthComplete} />;
    case 'main':
      return <MainApp />;
    default:
      return <AuthScreen onAuthComplete={handleAuthComplete} />;
  }

}
