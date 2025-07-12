import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';

WebBrowser.maybeCompleteAuthSession();

interface AuthScreenProps {
  onAuthComplete: (userInfo: any) => void;
}

export default function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const { isDark, colors, setThemeMode } = useThemeStore();
  const theme = colors;

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Web client ID - you'll need to get this from Google Cloud Console
    // For now, using a placeholder - you'll need to replace this with your actual web client ID
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
      
      const userInfo = {
        id: `google_${googleUserInfo.id}`,
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        provider: 'google',
        profilePicture: googleUserInfo.picture,
      };

      // Store user info securely
      await SecureStore.setItemAsync('user_info', JSON.stringify(userInfo));
      await SecureStore.setItemAsync('auth_token', accessToken);
      
      onAuthComplete(userInfo);
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
          email: credential.email || 'user@privaterelay.appleid.com',
          name: credential.fullName ? 
            `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() || 'Apple User' :
            'Apple User',
          provider: 'apple',
          profilePicture: null,
        };

        // Store user info securely
        await SecureStore.setItemAsync('user_info', JSON.stringify(userInfo));
        await SecureStore.setItemAsync('auth_token', credential.identityToken);
        
        onAuthComplete(userInfo);
      }
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled the sign-in
        return;
      }
      Alert.alert('Sign In Error', 'Failed to sign in with Apple. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

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
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Ionicons name="diamond" size={48} color="white" />
          </View>
          <Text style={{ 
            fontSize: 36, 
            fontWeight: '700', 
            color: theme.text, 
            marginBottom: 12,
            textAlign: 'center'
          }}>
            Welcome to Clarity
          </Text>
          <Text style={{ 
            fontSize: 18, 
            color: theme.text, 
            opacity: 0.7, 
            textAlign: 'center',
            lineHeight: 26,
            paddingHorizontal: 16
          }}>
            Level up your productivity by tracking video quality
          </Text>
        </View>

        {/* Sign In Buttons */}
        <View style={{ gap: 16 }}>
          {/* Apple Sign In - Only show on iOS */}
          {Platform.OS === 'ios' && isAppleAvailable && (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={isLoading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 60,
                borderRadius: 16,
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                opacity: isLoading ? 0.7 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
              ) : (
                <>
                  <Ionicons 
                    name="logo-apple" 
                    size={24} 
                    color={isDark ? '#000000' : '#FFFFFF'} 
                  />
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: isDark ? '#000000' : '#FFFFFF', 
                    marginLeft: 12 
                  }}>
                    Continue with Apple
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Google Sign In */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isLoading || !request}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 60,
              borderRadius: 16,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              opacity: (isLoading || !request) ? 0.7 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <>
                <Ionicons 
                  name="logo-google" 
                  size={24} 
                  color="#4285F4" 
                />
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: theme.text, 
                  marginLeft: 12 
                }}>
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Setup Instructions */}
        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 14, 
            color: theme.text, 
            opacity: 0.6, 
            textAlign: 'center',
            lineHeight: 20
          }}>
            To use Google Sign-In, you'll need to configure{'\n'}
            your Google Cloud Console credentials
          </Text>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 14, 
            color: theme.text, 
            opacity: 0.6, 
            textAlign: 'center',
            lineHeight: 20
          }}>
            By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 