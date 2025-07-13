import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { getXPDescription } from '../utils/videoAnalysis';
import CustomText from './CustomText';

interface XPFeedbackProps {
  xpChange: number;
  userLevel: number;
  onComplete?: () => void;
}

const XPFeedback: React.FC<XPFeedbackProps> = ({ xpChange, userLevel, onComplete }) => {
  const { colors } = useThemeStore();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (xpChange !== 0) {
      // Start animation
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
      translateY.value = withSequence(
        withSpring(0, { damping: 15 }),
        withDelay(2000, withTiming(-30, { duration: 400 }))
      );

      // Hide after delay
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 400 }, () => {
          if (onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [xpChange]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ]
    };
  });

  if (xpChange === 0) return null;

  const isPositive = xpChange > 0;
  const isHighValue = Math.abs(xpChange) >= 3;
  const isMediumValue = Math.abs(xpChange) >= 1 && Math.abs(xpChange) < 3;
  const isAdvancedLevel = userLevel >= 5;
  const description = getXPDescription(xpChange, userLevel);
  
  // Determine colors based on XP value
  const getBackgroundColor = () => {
    if (isPositive) {
      // +3 and +4 XP gains are green, +1 and +2 are treated as negative colours
      if (xpChange >= 3) return '#4CAF50'; // Bright green for high positive (3 & 4)
      // Lower positive gains use the same colours as negative
      return '#F44336'; // Red for +1 & +2
    } else {
      if (isHighValue) return '#F44336'; // Bright red for high negative
      if (isMediumValue) return '#FF5722'; // Orange-red for medium negative
      return '#FF9800'; // Orange for low negative
    }
  };

  const getBorderColor = () => {
    if (isPositive) {
      if (xpChange >= 3) return '#2E7D32'; // Darker green border
      return '#C62828'; // Dark red border for +1 & +2
    } else {
      if (isHighValue) return '#C62828';
      if (isMediumValue) return '#D84315';
      return '#F57C00';
    }
  };

  const getIcon = () => {
    if (isPositive) {
      if (xpChange >= 3) return 'trending-up';
      // For +1/+2 show arrow-down to reinforce penalty colour
      return 'arrow-down';
    }
    // Negative XP
    if (isHighValue) return 'trending-down';
    return 'arrow-down';
  };

  const getIconSize = () => {
    if (isHighValue || xpChange >= 3) return 28;
    if (isMediumValue) return 24;
    return 20;
  };
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        }
      ]}>
        <Ionicons 
          name={getIcon()} 
          size={getIconSize()} 
          color="white" 
        />
        <CustomText 
          style={styles.xpText}
          color="white"
          bold
          fontSize={isHighValue ? 'large' : 'normal'}
        >
          {isPositive ? '+' : ''}{xpChange} XP
        </CustomText>
        
        {isHighValue && (
          <View style={styles.effectsContainer}>
            <Ionicons name="sparkles" size={18} color="#FFD700" />
            {isPositive && (
              <Ionicons name="star" size={14} color="#FFF" style={{ marginLeft: 4 }} />
            )}
          </View>
        )}
        
        {isMediumValue && (
          <View style={styles.effectsContainer}>
            <Ionicons 
              name={isPositive ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color="white" 
            />
          </View>
        )}
      </View>
      
      <View style={[styles.descriptionContainer, { backgroundColor: getBackgroundColor() }]}>
        <CustomText 
          style={styles.qualityText}
          color={colors.text}
          fontSize="small"
          opacity={0.9}
          textAlign="center"
          bold
        >
          {description}
        </CustomText>
        
        {isAdvancedLevel && (
          <CustomText 
            style={styles.advancedText}
            color={colors.primary}
            fontSize="small"
            opacity={0.8}
            textAlign="center"
          >
            🎯 Level {userLevel} Standards Applied
          </CustomText>
        )}
      </View>
    </Animated.View>
  );
};

// Global XP Feedback component that watches for changes
export const GlobalXPFeedback: React.FC = () => {
  const lastXpChange = useUserStore((s) => s.lastXpChange);
  const currentLevel = useUserStore((s) => s.currentLevel);
  const resetXpChange = useUserStore((s) => s.resetLevelUp); // We'll use this to reset
  const [currentXpChange, setCurrentXpChange] = React.useState(0);

  useEffect(() => {
    if (lastXpChange !== 0) {
      setCurrentXpChange(lastXpChange);
    }
  }, [lastXpChange]);

  const handleComplete = () => {
    setCurrentXpChange(0);
    // Reset the XP change in the store
    resetXpChange();
  };

  return (
    <View style={styles.globalContainer}>
      <XPFeedback 
        xpChange={currentXpChange} 
        userLevel={currentLevel}
        onComplete={handleComplete} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  globalContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  xpText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  sparkleContainer: {
    marginLeft: 8,
  },
  qualityText: {
    marginTop: 8,
    maxWidth: 200,
  },
  advancedText: {
    marginTop: 4,
    maxWidth: 200,
  },
  effectsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  descriptionContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});

export default XPFeedback; 