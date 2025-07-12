import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';

interface AuthScreenProps {
  onAuthComplete: (userInfo: any) => void;
}

export default function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState('');
  const { isDark, colors, setThemeMode } = useThemeStore();
  const theme = colors;

  useEffect(() => {
    checkAppleAuthAvailability();
  }, []);

  const checkAppleAuthAvailability = async () => {
    if (Platform.OS === 'ios') {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setIsAppleAvailable(isAvailable);
    }
  };

  const handleGoogleSignIn = async () => {
    setShowNameInput(true);
  };

  const completeGoogleSignIn = async () => {
    if (!userName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }

    setIsLoading(true);
    try {
      // Generate a more realistic email from the name
      const emailName = userName.toLowerCase().replace(/\s+/g, '.');
      const mockUserInfo = {
        id: `google_${Date.now()}`,
        email: `${emailName}@gmail.com`,
        name: userName.trim(),
        provider: 'google',
        profilePicture: null,
      };
      
      // Store user info securely
      await SecureStore.setItemAsync('user_info', JSON.stringify(mockUserInfo));
      await SecureStore.setItemAsync('auth_token', `google_token_${Date.now()}`);
      
      setShowNameInput(false);
      setUserName('');
      onAuthComplete(mockUserInfo);
    } catch (error) {
      Alert.alert('Sign In Error', 'Failed to sign in with Google. Please try again.');
    } finally {
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

  if (showNameInput) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
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
              <Ionicons name="person" size={36} color="white" />
            </View>
            <Text style={{ 
              fontSize: 28, 
              fontWeight: '700', 
              color: theme.text, 
              marginBottom: 8,
              textAlign: 'center'
            }}>
              What's your name?
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: theme.text, 
              opacity: 0.7, 
              textAlign: 'center',
              lineHeight: 24
            }}>
              We'll use this to personalize your experience
            </Text>
          </View>

          <View style={{ marginBottom: 32 }}>
            <TextInput
              style={{
                height: 60,
                borderRadius: 16,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                paddingHorizontal: 20,
                fontSize: 16,
                color: theme.text,
                marginBottom: 20
              }}
              placeholder="Enter your full name"
              placeholderTextColor={theme.text + '80'}
              value={userName}
              onChangeText={setUserName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={completeGoogleSignIn}
            />

            <Pressable
              onPress={completeGoogleSignIn}
              disabled={isLoading || !userName.trim()}
              style={{
                height: 60,
                borderRadius: 16,
                backgroundColor: theme.primary,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: (isLoading || !userName.trim()) ? 0.5 : 1,
                marginBottom: 16
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: 'white' 
                }}>
                  Continue with Google
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setShowNameInput(false);
                setUserName('');
              }}
              style={{
                height: 60,
                borderRadius: 16,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: theme.text 
              }}>
                Back
              </Text>
            </Pressable>
          </View>
        </View>
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
            disabled={isLoading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 60,
              borderRadius: 16,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              opacity: isLoading ? 0.7 : 1,
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

        {/* Footer */}
        <View style={{ marginTop: 48, alignItems: 'center' }}>
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