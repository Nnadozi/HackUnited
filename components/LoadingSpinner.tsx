import { useTheme } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import CustomText from './CustomText';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  subText?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  subTextStyle?: TextStyle;
  variant?: 'inline' | 'fullscreen' | 'button';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  text,
  subText,
  containerStyle,
  textStyle,
  subTextStyle,
  variant = 'fullscreen'
}) => {
  const { colors } = useTheme();
  const spinnerColor = color || colors.primary;

  const renderContent = () => (
    <>
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && (
        <CustomText 
          style={textStyle ? { marginTop: "2%", ...textStyle } : { marginTop: "2%" }} 
          bold={variant === 'button'}
          color={variant === 'button' ? spinnerColor : colors.primary}
        >
          {text}
        </CustomText>
      )}
      {subText && (
        <CustomText 
          style={subTextStyle ? { marginTop: "1%", ...subTextStyle } : { marginTop: "1%" }} 
          fontSize="normal"
          opacity={0.7}
        >
          {subText}
        </CustomText>
      )}
    </>
  );

  if (variant === 'inline') {
    return (
      <View style={[styles.inlineContainer, containerStyle]}>
        {renderContent()}
      </View>
    );
  }

  if (variant === 'button') {
    return (
      <View style={[styles.buttonContainer, containerStyle]}>
        <ActivityIndicator size="small" color={spinnerColor} />
        {text && (
          <CustomText 
            style={textStyle ? { marginLeft: 8, ...textStyle } : { marginLeft: 8 }} 
            fontSize="small"
            color={spinnerColor}
          >
            {text}
          </CustomText>
        )}
      </View>
    );
  }

  // fullscreen variant (default)
  return (
    <View style={[styles.fullscreenContainer, containerStyle]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  inlineContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingSpinner; 