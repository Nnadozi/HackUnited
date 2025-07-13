import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import CustomText from './CustomText';

export const LevelUpModal = () => {
  const { justLeveledUp, resetLevelUp, currentLevel, user, videos } = useUserStore();
  const { colors } = useThemeStore();
  
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const starRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get recent video quality to determine animation intensity
  const getRecentVideoQuality = () => {
    const recentVideos = videos.slice(0, 3);
    if (recentVideos.length === 0) return 2;
    
    const avgQuality = recentVideos.reduce((sum, video) => 
      sum + (video.quality_score || 50), 0) / recentVideos.length;
    
    return Math.floor(avgQuality / 25); // 0-4 scale
  };

  const qualityLevel = getRecentVideoQuality();
  const isHighQuality = qualityLevel >= 3; // Quality 3-4

  useEffect(() => {
    if (justLeveledUp) {
      // Enhanced animations for high quality videos
      if (isHighQuality) {
        // Star rotation animation
        Animated.loop(
          Animated.timing(starRotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();

        // Pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }

      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: isHighQuality ? 3 : 4, // More bouncy for high quality
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.5);
      starRotateAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [justLeveledUp, isHighQuality]);

  if (!justLeveledUp) return null;

  const starRotation = starRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible transparent animationType="none">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              backgroundColor: colors.background,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              borderColor: isHighQuality ? '#FFD700' : colors.primary,
            }
          ]}
        >
          <Animated.View
            style={{
              transform: [
                { rotate: isHighQuality ? starRotation : '0deg' },
                { scale: pulseAnim }
              ],
            }}
          >
            <Ionicons 
              name="star" 
              size={isHighQuality ? 100 : 80} 
              color="#FFD700" 
              style={styles.starIcon} 
            />
          </Animated.View>
          
          <CustomText 
            fontSize="XL"
            bold
            style={{ 
              color: isHighQuality ? '#FFD700' : colors.primary, 
              marginBottom: 8,
              textShadowColor: isHighQuality ? 'rgba(255, 215, 0, 0.5)' : 'transparent',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            {isHighQuality ? '🎉 AMAZING LEVEL UP! 🎉' : 'LEVEL UP!'}
          </CustomText>
          <CustomText 
            fontSize="normal"
            style={{ color: colors.text, marginBottom: 4 }}
          >
            Congratulations, {user?.name}!
          </CustomText>
          <CustomText 
            fontSize="large"
            bold
            style={{ color: colors.text, marginBottom: 8 }}
          >
            You've reached Level {currentLevel}!
          </CustomText>
          
          {isHighQuality && (
            <CustomText 
              fontSize="small"
              style={{ 
                color: '#FFD700', 
                marginBottom: 16,
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              Your high-quality video choices are paying off! 🌟
            </CustomText>
          )}
          
          <Pressable 
            onPress={resetLevelUp} 
            style={[
              styles.button, 
              { 
                backgroundColor: isHighQuality ? '#FFD700' : colors.primary,
                shadowColor: isHighQuality ? '#FFD700' : colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }
            ]}
          >
            <CustomText 
              fontSize="normal"
              bold
              style={{ color: isHighQuality ? '#000' : 'white' }}
            >
              {isHighQuality ? 'Keep Excelling!' : 'Keep Going!'}
            </CustomText>
          </Pressable>
        </Animated.View>
        
        {/* Enhanced confetti for high quality */}
        <ConfettiCannon 
          count={isHighQuality ? 300 : 200} 
          origin={{ x: -10, y: 0 }} 
          explosionSpeed={isHighQuality ? 500 : 400} 
          fallSpeed={isHighQuality ? 2500 : 3000}
          colors={isHighQuality ? ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00CED1'] : undefined}
        />
        
        {/* Additional confetti from right side for high quality */}
        {isHighQuality && (
          <ConfettiCannon 
            count={150} 
            origin={{ x: 400, y: 0 }} 
            explosionSpeed={450} 
            fallSpeed={2800}
            colors={['#FFD700', '#FFA500', '#FF6347']}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  starIcon: {
    marginBottom: 16,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 