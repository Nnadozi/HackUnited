import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '../lib/supabaseService';
import { useThemeStore } from '../stores/themeStore';
import EmailAuthScreen from './EmailAuthScreen';

WebBrowser.maybeCompleteAuthSession();

interface AuthScreenProps {
  onAuthComplete: (userInfo: any) => void;
}

export default function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const { isDark, colors, setThemeMode } = useThemeStore();
  const theme = colors;

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    // You'll need to replace these with your actual Google OAuth client IDs
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    checkAppleAuthAvailability();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuthSuccess(response.authentication?.accessToken);
    }
  }, [response]);

  const checkAppleAuthAvailability = async () => {
    if (Platform.OS === 'ios') {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setIsAppleAvailable(isAvailable);
    }
  };

  const calculateTargetXP = (level: number): number => {
    const xpRequirements = [5, 10, 20, 35, 50, 75];
    return xpRequirements[level] || 75;
  };

  const handleGoogleAuthSuccess = async (accessToken: string | undefined) => {
    if (!accessToken) {
      Alert.alert('Error', 'Failed to get access token from Google');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const googleUserInfo = await userInfoResponse.json();
      
      // Create or update user in our database
      const userData = await userService.upsertUser({
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        provider: 'google',
        profile_picture: googleUserInfo.picture,
        current_xp: 0,
        total_xp: 0,
        current_level: 0,
      });

      if (userData) {
        const userInfo = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          provider: 'google' as const,
          profilePicture: userData.profile_picture,
          currentXp: userData.current_xp,
          targetXp: calculateTargetXP(userData.current_level),
          progress: userData.current_xp / calculateTargetXP(userData.current_level),
          currentLevel: userData.current_level,
        };

        // Store user info and token securely
        await SecureStore.setItemAsync('user_info', JSON.stringify(userInfo));
        await SecureStore.setItemAsync('auth_token', accessToken);
        await SecureStore.setItemAsync('auth_provider', 'google');
        
        onAuthComplete(userInfo);
      } else {
        Alert.alert('Error', 'Failed to create user profile. Please try again.');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert('Sign In Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === 'cancel') {
        setIsLoading(false);
      }
      // Success is handled in useEffect
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('Sign In Error', 'Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (!isAppleAvailable) {
      Alert.alert('Apple Sign-In', 'Apple Sign-In is not available on this device.');
      return;
    }

    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const userInfo = {
          id: credential.user,
          email: credential.email || `${credential.user}@privaterelay.appleid.com`,
          name: credential.fullName ? 
            `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() || 'Apple User' :
            'Apple User',
          provider: 'apple',
          profile_picture: undefined,
        };

        // Create or update user in our database
        const userData = await userService.upsertUser({
          email: credential.email || `${credential.user}@privaterelay.appleid.com`,
          name: credential.fullName ? 
            `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() || 'Apple User' :
            'Apple User',
          provider: 'apple',
          profile_picture: undefined,
          current_xp: 0,
          total_xp: 0,
          current_level: 0,
        });

        if (userData) {
          const userInfo = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            provider: 'apple' as const,
            profilePicture: userData.profile_picture,
            currentXp: userData.current_xp,
            targetXp: calculateTargetXP(userData.current_level),
            progress: userData.current_xp / calculateTargetXP(userData.current_level),
            currentLevel: userData.current_level,
          };

          // Store user info and token securely
          await SecureStore.setItemAsync('user_info', JSON.stringify(userInfo));
          await SecureStore.setItemAsync('auth_token', credential.identityToken);
          await SecureStore.setItemAsync('auth_provider', 'apple');
          
          onAuthComplete(userInfo);
        } else {
          Alert.alert('Error', 'Failed to create user profile. Please try again.');
        }
      }
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled the sign-in
        setIsLoading(false);
        return;
      }
      console.error('Apple sign in error:', error);
      Alert.alert('Sign In Error', 'Failed to sign in with Apple. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  if (showEmailAuth) {
    return (
      <EmailAuthScreen
        onAuthComplete={onAuthComplete}
        onBack={() => setShowEmailAuth(false)}
      />
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

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        {/* Logo/Title */}
        <View style={{ alignItems: 'center', marginBottom: 64 }}>
          <View 
            style={{ 
              width: 100, 
              height: 100, 
              borderRadius: 50, 
              backgroundColor: theme.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Image source={require('../assets/images/icon.png')} style={{ width: 60, height: 60, borderRadius: 15 }} />
          </View>
          <Text style={{ 
            fontSize: 32, 
            fontWeight: 'bold', 
            color: theme.text,
            textAlign: 'center',
            marginBottom: 8,
          }}>
            Welcome to Clarity
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: theme.secondary,
            textAlign: 'center',
            lineHeight: 24,
          }}>
            Track your video consumption and level up your digital habits
          </Text>
        </View>

        {/* Authentication Options */}
        <View style={{ marginBottom: 32 }}>
          {/* Apple Sign In */}
          {isAppleAvailable && (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={isLoading}
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                marginBottom: 16,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="white" />
                  <Text style={{ 
                    color: 'white', 
                    fontSize: 16, 
                    fontWeight: '600',
                    marginLeft: 12,
                  }}>
                    Sign in with Apple
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Google Sign In */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.card,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.border,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={{ 
                  color: theme.text, 
                  fontSize: 16, 
                  fontWeight: '600',
                  marginLeft: 12,
                }}>
                  Sign in with Google
                </Text>
              </>
            )}
          </Pressable>

          {/* Email Sign In */}
          <Pressable
            onPress={() => setShowEmailAuth(true)}
            disabled={isLoading}
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.primary,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <Ionicons name="mail" size={20} color="white" />
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: '600',
              marginLeft: 12,
            }}>
              Sign in with Email
            </Text>
          </Pressable>
        </View>

        {/* Terms */}
        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ 
            fontSize: 14, 
            color: theme.secondary,
            textAlign: 'center',
            lineHeight: 20,
          }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 