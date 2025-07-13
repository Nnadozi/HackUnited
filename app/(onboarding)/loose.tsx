import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import { useThemeStore } from '../../stores/themeStore';

export default function LooseScreen() {
  const { colors } = useThemeStore();
  const theme = colors;
  const handleNext = () => {
    router.navigate('/(onboarding)/done');
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
          name="trending-up-outline" 
          size={64} 
          color={theme.background} 
        />
      </View>
      {/* Title */}
      <CustomText textAlign='center' fontSize='XL' bold>
        Level Up System
      </CustomText>
      {/* Description */}
      <CustomText textAlign='center' fontSize='normal'>
        Earn 1-3 XP for quality content. Reach Level 5 with 200 XP total. Lose 2 videos worth of progress daily if inactive.
      </CustomText>
      {/* Next Button */}
      <CustomButton
          onPress={handleNext}
          style={{marginTop: 15}}
          title='Next'
          width={"80%"}
        />
    </View>
  );
} 