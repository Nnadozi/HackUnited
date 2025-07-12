import AuthScreen from '@/components/AuthScreen';
import FriendsScreen from '@/components/FriendsScreen';
import HomeScreen from '@/components/HomeScreen';
import { LevelUpModal } from '@/components/LevelUpModal';
import OnboardingFlow from '@/components/OnboardingFlow';
import VideoLibraryScreen from '@/components/VideoLibraryScreen';
import { useThemeStore } from '@/stores/themeStore';
import { useUserStore } from '@/stores/userStore';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, AppState, Pressable, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

type AppView = 'loading' | 'onboarding' | 'auth' | 'main';

export default function Index() {
  const [view, setView] = useState<AppView>('loading');
  const { colors } = useThemeStore();
  const { 
    setUser, 
    completeOnboarding, 
    applyDailyDecay, 
    lastXpChange,
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
        return <HomeScreen onNavigateToLibrary={() => {}} />;
      case 'library':
        return <VideoLibraryScreen onNavigateBack={() => {}} />;
      case 'friends':
        return <FriendsScreen />;
      default:
        return <HomeScreen onNavigateToLibrary={() => {}} />;
    }
  };

  const MainApp = () => (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
      
      {/* Custom Tab Bar */}
      <View style={{ 
        flexDirection: 'row',
        height: 80,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        {['home', 'library', 'friends'].map(tab => (
          <Pressable 
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons 
              name={
                tab === 'home' ? 'home' : 
                tab === 'library' ? 'library' : 'people'
              } 
              size={24} 
              color={activeTab === tab ? colors.primary : colors.text} 
            />
            <Text style={{ 
              color: activeTab === tab ? colors.primary : colors.text, 
              fontSize: 12,
              marginTop: 4
            }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      
      <LevelUpModal />
      <XPFeedback />
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
