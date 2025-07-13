import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import CustomText from './CustomText';

interface CustomTagProps {
  text: string;
  size?: 'small' | 'normal' | 'large';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onPress?: () => void;
  style?: any;
}

export default function CustomTag({ 
  text, 
  size = 'normal', 
  variant = 'default',
  onPress,
  style 
}: CustomTagProps) {
  const { colors } = useThemeStore();
  
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: colors.primary,
          text: '#FFFFFF',
          border: colors.primary
        };
      case 'secondary':
        return {
          background: colors.secondary,
          text: '#FFFFFF',
          border: colors.secondary
        };
      case 'success':
        return {
          background: '#4CAF50',
          text: '#FFFFFF',
          border: '#4CAF50'
        };
      case 'warning':
        return {
          background: '#FF9800',
          text: '#FFFFFF',
          border: '#FF9800'
        };
      case 'error':
        return {
          background: '#F44336',
          text: '#FFFFFF',
          border: '#F44336'
        };
      default:
        return {
          background: colors.tagBackground,
          text: colors.tagText,
          border: colors.tagBorder
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          fontSize: 10
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
          fontSize: 14
        };
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
          fontSize: 12
        };
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: variantColors.background,
          borderColor: variantColors.border,
          borderWidth: 1,
          ...sizeStyles
        },
        style
      ]}
      onTouchEnd={onPress}
    >
      <CustomText
        fontSize="small"
        style={{
          color: variantColors.text,
          fontSize: sizeStyles.fontSize,
          fontWeight: '500'
        }}
      >
        {text}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 6,
  },
}); 