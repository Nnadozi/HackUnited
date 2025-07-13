import Page from '@/components/Page';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import { useThemeStore } from '../../stores/themeStore';


export default function AuthScreen() {
  const { colors } = useThemeStore();
  const theme = colors;
  const handleNext = () => {
    router.navigate('/(onboarding)/levels');
  };

  return (
    <Page>
        <Image source={require('../../assets/images/icon.png')} style={styles.img} />
        <CustomText textAlign='center' fontSize='XL' bold>
            Welcome to Clarity
        </CustomText>
        <CustomText textAlign='center' fontSize='normal'>
            Level up your productivity by tracking video quality
        </CustomText>
        <CustomButton
          onPress={handleNext}
          style={{marginTop: 15}}
          title="Get Started"
          width={"80%"}
        />
    </Page>
  );
} 

const styles = StyleSheet.create({
  img:{
    width: 150,
    height: 150,
    borderRadius: 30,
    marginBottom: 10,
  }
});