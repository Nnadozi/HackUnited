import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, View } from 'react-native';
import CustomText from './CustomText';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  subText?: string;
  containerStyle?: any;
  textStyle?: any;
  subTextStyle?: any;
  variant?: 'fullscreen' | 'inline' | 'button';
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
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Pulse animation for the container
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Fade animation for text
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Scale animation for spinner
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    fadeAnimation.start();
    scaleAnimation.start();

    return () => {
      pulseAnimation.stop();
      fadeAnimation.stop();
      scaleAnimation.stop();
    };
  }, [pulseAnim, fadeAnim, scaleAnim]);

  const entertainingMessages = [
    "🎬 Analyzing your video...",
    "🤖 AI is thinking hard...",
    "📊 Crunching the numbers...",
    "🎯 Calculating XP rewards...",
    "🧠 Determining brain rot levels...",
    "⭐ Rating content quality...",
    "🎓 Checking educational value...",
    "🚀 Almost there...",
  ];

  const getRandomMessage = () => {
    return entertainingMessages[Math.floor(Math.random() * entertainingMessages.length)];
  };

  const renderContent = () => (
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <ActivityIndicator size={size} color={spinnerColor} />
      </Animated.View>
      
      {text && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <CustomText 
            style={textStyle ? { marginTop: 16, ...textStyle } : { marginTop: 16 }} 
            bold={variant === 'button'}
            color={variant === 'button' ? spinnerColor : colors.primary}
            fontSize="normal"
          >
            {text}
          </CustomText>
        </Animated.View>
      )}
      
      {subText && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <CustomText 
            style={subTextStyle ? { marginTop: 8, ...subTextStyle } : { marginTop: 8 }} 
            fontSize="small"
            opacity={0.7}
          >
            {subText}
          </CustomText>
        </Animated.View>
      )}

      {variant === 'fullscreen' && (
        <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
          <CustomText fontSize="small" opacity={0.6}>
            {getRandomMessage()}
          </CustomText>
        </Animated.View>
      )}

      {variant === 'fullscreen' && (
        <View style={styles.progressDots}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: spinnerColor },
                {
                  opacity: Animated.add(
                    0.3,
                    Animated.multiply(
                      0.7,
                      fadeAnim
                    )
                  )
                }
              ]}
            />
          ))}
        </View>
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
    <Animated.View 
      style={[
        styles.fullscreenContainer, 
        containerStyle,
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      {renderContent()}
    </Animated.View>
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
  progressDots: {
    flexDirection: 'row',
    marginTop: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default LoadingSpinner; 