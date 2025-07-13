import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import CustomText from './CustomText';

export const LevelUpModal = () => {
  const { justLeveledUp, resetLevelUp, currentLevel, user } = useUserStore();
  const { colors } = useThemeStore();
  
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (justLeveledUp) {
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.5);
    }
  }, [justLeveledUp]);

  if (!justLeveledUp) return null;

  return (
    <Modal visible transparent animationType="none">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              backgroundColor: colors.background,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim
            }
          ]}
        >
          <Ionicons name="star" size={80} color="#FFD700" style={styles.starIcon} />
          
          <CustomText 
            fontSize="XL"
            bold
            style={{ color: colors.primary, marginBottom: 8 }}
          >
            LEVEL UP!
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
            style={{ color: colors.text, marginBottom: 24 }}
          >
            You've reached Level {currentLevel}!
          </CustomText>
          
          <Pressable 
            onPress={resetLevelUp} 
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <CustomText 
              fontSize="normal"
              bold
              style={{ color: 'white' }}
            >
              Keep Going!
            </CustomText>
          </Pressable>
        </Animated.View>
        <ConfettiCannon 
          count={200} 
          origin={{ x: -10, y: 0 }} 
          explosionSpeed={400} 
          fallSpeed={3000}
        />
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