import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';

export default function DoneScreen() {
  const { colors } = useThemeStore();
  const theme = colors;
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const handleNext = () => {
    completeOnboarding();
    router.navigate('/(tabs)/home');
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      {/* Icon */}
      <View 
        style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: 128, 
          height: 128, 
          borderRadius: 64, 
          marginBottom: 16,
          backgroundColor: theme.primary
        }}
      >
        <Ionicons 
          name="bulb-outline" 
          size={64} 
          color={theme.background} 
        />
      </View>
      {/* Title */}
      <CustomText textAlign='center' fontSize='XL' bold>
        Build Better Habits
      </CustomText>
      {/* Description */}
      <CustomText textAlign='center' fontSize='normal'>
        Transform your viewing habits. Gaming content = negative XP. Learning & productivity = positive XP.
      </CustomText>
      {/* Get Started Button */}
      <CustomButton
          onPress={handleNext}
          style={{marginTop: 15}}
          title='Get Started'
          width={"80%"}
        />
    </View>
  );
} 