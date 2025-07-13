import CustomButton from '@/components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import CustomText from '../../components/CustomText';
import { useThemeStore } from '../../stores/themeStore';

export default function LevelsScreen() {
  const { colors } = useThemeStore();
  const theme = colors;
  const handleNext = () => {
    router.navigate('/(onboarding)/loose');
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
          name="videocam-outline" 
          size={64} 
          color={theme.background} 
        />
      </View>
      {/* Title */}
      <CustomText textAlign='center' fontSize='XL' bold>
        Track Your Videos
      </CustomText>
      {/* Description */}
      <CustomText textAlign='center' fontSize='normal'>
        Add videos you watch daily. Our AI analyzes content quality - educational content earns XP, brain rot loses it.
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