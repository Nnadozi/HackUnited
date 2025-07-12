import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';

const { width: screenWidth } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to Clarity',
    description: 'Break free from brain rot content and level up your productivity through mindful video consumption.',
    icon: 'diamond-outline',
    color: '#20B2AA',
  },
  {
    id: 2,
    title: 'Track Your Videos',
    description: 'Add videos you watch daily. Our AI analyzes content quality - educational content earns XP, brain rot loses it.',
    icon: 'videocam-outline',
    color: '#48CAE4',
  },
  {
    id: 3,
    title: 'Level Up System',
    description: 'Earn 1-3 XP for quality content. Reach Level 5 with 200 XP total. Lose 2 videos worth of progress daily if inactive.',
    icon: 'trending-up-outline',
    color: '#20B2AA',
  },
  {
    id: 4,
    title: 'Build Better Habits',
    description: 'Transform your viewing habits. Gaming content = negative XP. Learning & productivity = positive XP.',
    icon: 'bulb-outline',
    color: '#48CAE4',
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { isDark, setThemeMode, colors } = useThemeStore();
  const theme = colors;

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffsetX / screenWidth);
    setCurrentPage(page);
  };

  const goToPage = (page: number) => {
    scrollViewRef.current?.scrollTo({ x: page * screenWidth, animated: true });
    setCurrentPage(page);
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      goToPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
      />
      
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
          <Text 
            style={{ 
              fontSize: 18, 
              fontWeight: '600',
              color: theme.primary 
            }}
          >
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Lottie Animation - only show on first page */}
      {currentPage === 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 128, marginBottom: 32 }}>
          <LottieView
            source={require('../assets/animations/clarity.json')}
            autoPlay
            loop={false}
            style={{ width: 300, height: 120 }}
          />
        </View>
      )}

      {/* XP Progress Demo - show on level up page */}
      {currentPage === 2 && (
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>Level 2</Text>
              <Text style={{ fontSize: 14, color: theme.text, opacity: 0.7 }}>15/20 XP</Text>
            </View>
            <View style={{ height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: '75%', backgroundColor: theme.primary, borderRadius: 4 }} />
            </View>
            <Text style={{ fontSize: 12, color: theme.text, opacity: 0.6, marginTop: 4 }}>5 XP to Level 3</Text>
          </View>
        </View>
      )}

      {/* Onboarding Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {onboardingData.map((item, index) => (
          <View 
            key={item.id} 
            style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center', 
              paddingHorizontal: 32,
              width: screenWidth 
            }}
          >
            {/* Icon */}
            <View 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center', 
                width: 128, 
                height: 128, 
                borderRadius: 64, 
                marginBottom: 48,
                backgroundColor: `${item.color}20` 
              }}
            >
              <Ionicons 
                name={item.icon as any} 
                size={64} 
                color={item.color} 
              />
            </View>

            {/* Title */}
            <Text 
              style={{ 
                fontSize: 30, 
                fontWeight: 'bold', 
                textAlign: 'center', 
                marginBottom: 24,
                color: theme.text 
              }}
            >
              {item.title}
            </Text>

            {/* Description */}
            <Text 
              style={{ 
                fontSize: 18, 
                textAlign: 'center', 
                lineHeight: 28, 
                paddingHorizontal: 16,
                color: theme.text, 
                opacity: 0.8 
              }}
            >
              {item.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 24 }}>
        {onboardingData.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => goToPage(index)}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              marginHorizontal: 8,
              backgroundColor: index === currentPage ? theme.primary : theme.border,
              opacity: index === currentPage ? 1 : 0.3,
            }}
          />
        ))}
      </View>

      {/* Next/Get Started Button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <Pressable
          onPress={handleNext}
          style={{ 
            flexDirection: 'row', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 56, 
            borderRadius: 16,
            backgroundColor: theme.primary 
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>
            {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color="white" 
            style={{ marginLeft: 8 }}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
} 