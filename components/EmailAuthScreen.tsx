import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { userService } from '../lib/supabaseService';
import { useThemeStore } from '../stores/themeStore';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';

interface EmailAuthScreenProps {
  onAuthComplete: (userInfo: any) => void;
  onBack: () => void;
}

export default function EmailAuthScreen({ onAuthComplete, onBack }: EmailAuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [canResendCode, setCanResendCode] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  
  const { isDark, colors, setThemeMode } = useThemeStore();
  const theme = colors;

  // Countdown timer for resend button
  useEffect(() => {
    let interval: number;
    if (showVerification && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResendCode(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showVerification, resendCountdown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) {
        Alert.alert('Sign In Error', error.message);
        return;
      }

      if (data.user) {
        // Get user data from our database
        const userData = await userService.getUserByEmail(email.toLowerCase().trim());
        
        if (userData) {
          const userInfo = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            provider: 'email' as const,
            profilePicture: userData.profile_picture,
            currentXp: userData.current_xp,
            targetXp: calculateTargetXP(userData.current_level),
            progress: userData.current_xp / calculateTargetXP(userData.current_level),
            currentLevel: userData.current_level,
          };

          // Store credentials securely
          await SecureStore.setItemAsync('user_info', JSON.stringify(userInfo));
          await SecureStore.setItemAsync('auth_token', data.session?.access_token || '');
          await SecureStore.setItemAsync('refresh_token', data.session?.refresh_token || '');

          onAuthComplete(userInfo);
        } else {
          Alert.alert('Error', 'User data not found. Please try signing up.');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert('Invalid Name', 'Please enter your name.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
          }
        }
      });

      if (error) {
        Alert.alert('Sign Up Error', error.message);
        return;
      }

      if (data.user) {
        // Show verification screen instead of alert
        setShowVerification(true);
        setCanResendCode(false);
        setResendCountdown(60);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: verificationCode,
        type: 'signup'
      });

      if (error) {
        Alert.alert('Verification Error', error.message);
        return;
      }

      if (data.user) {
        // Now that the user is verified, create the user record in our public.users table
        const userData = await userService.upsertUser({
          id: data.user.id,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          provider: 'email',
        });
        
        if (userData) {
          const userInfo = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            provider: 'email' as const,
            profilePicture: userData.profile_picture,
            currentXp: userData.current_xp,
            targetXp: calculateTargetXP(userData.current_level),
            progress: userData.current_xp / calculateTargetXP(userData.current_level),
            currentLevel: userData.current_level,
          };

          // Store credentials securely
          await SecureStore.setItemAsync('user_info', JSON.stringify(userInfo));
          await SecureStore.setItemAsync('auth_token', data.session?.access_token || '');
          await SecureStore.setItemAsync('refresh_token', data.session?.refresh_token || '');

          onAuthComplete(userInfo);
        } else {
          Alert.alert('Error', 'User data not found. Please try signing up.');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Verification Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResendCode) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase().trim()
      });

      if (error) {
        Alert.alert('Resend Error', error.message);
        return;
      }

      setCanResendCode(false);
      setResendCountdown(60);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Resend Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTargetXP = (level: number): number => {
    const xpRequirements = [5, 10, 20, 35, 50, 75];
    return xpRequirements[level] || 75;
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setVerificationCode('');
  };

  const handleBack = () => {
    if (showVerification) {
      setShowVerification(false);
    } else {
      onBack();
    }
  };

  if (showVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <KeyboardAvoidingView 
          style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, marginBottom: 8 }}>Verify Your Email</Text>
            <Text style={{ fontSize: 16, color: theme.secondary, textAlign: 'center' }}>
              Enter the 6-digit code sent to {email}
            </Text>
          </View>
          
          {/* Verification Form */}
          <CustomInput
            placeholder="- - - - - -"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            style={{ fontSize: 24, letterSpacing: 8, marginBottom: 24 }}
          />

          <CustomButton
            title={isLoading ? 'Verifying...' : 'Verify'}
            onPress={handleVerifyCode}
            disabled={isLoading}
            style={{ marginBottom: 24 }}
          />

          {/* Resend Code */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.secondary, fontSize: 16 }}>Didn't receive code? </Text>
            <Pressable onPress={handleResendCode} disabled={!canResendCode}>
              <Text style={{ color: theme.primary, fontSize: 16, fontWeight: 'bold', opacity: canResendCode ? 1 : 0.5 }}>
                {canResendCode ? 'Resend' : `Resend in ${resendCountdown}s`}
              </Text>
            </Pressable>
          </View>

          {/* Back Button */}
          <Pressable onPress={handleBack} style={{ marginTop: 24, alignSelf: 'center' }}>
            <Text style={{ color: theme.secondary, fontSize: 16 }}>Back to Sign Up</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Theme Toggle */}
      <View style={{ 
        position: 'absolute', 
        top: 60, 
        right: 24, 
        zIndex: 10 
      }}>
        <Pressable 
          onPress={toggleTheme}
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 22,
            backgroundColor: theme.card,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={22} 
            color={theme.text} 
          />
        </Pressable>
      </View>

      {/* Back Button */}
      <Pressable 
        onPress={onBack}
        style={{ 
          position: 'absolute', 
          top: 60, 
          left: 24, 
          zIndex: 10,
          width: 44, 
          height: 44, 
          borderRadius: 22,
          backgroundColor: theme.card,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name="arrow-back" size={22} color={theme.text} />
      </Pressable>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View 
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 40, 
                backgroundColor: theme.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Ionicons name="mail" size={32} color="white" />
            </View>
            <Text style={{ 
              fontSize: 28, 
              fontWeight: 'bold', 
              color: theme.text,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: theme.secondary,
              textAlign: 'center',
            }}>
              {isSignUp ? 'Join Clarity to track your progress' : 'Welcome back to Clarity'}
            </Text>
          </View>

          {/* Form */}
          <View style={{ marginBottom: 32 }}>
            {isSignUp && (
              <View style={{ marginBottom: 16 }}>
                <CustomInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                />
              </View>
            )}
            
            <View style={{ marginBottom: 16 }}>
              <CustomInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <CustomInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                secureTextEntry={true}
              />
            </View>

            <CustomButton
              title={isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={isLoading}
              style={{ marginBottom: 16 }}
            />
          </View>

          {/* Toggle Sign In/Up */}
          <View style={{ alignItems: 'center' }}>
            <Pressable
              onPress={() => {
                setIsSignUp(!isSignUp);
                resetForm();
              }}
              style={{ padding: 12 }}
            >
              <Text style={{ color: theme.secondary, fontSize: 16 }}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={{ color: theme.primary, fontWeight: '600' }}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 