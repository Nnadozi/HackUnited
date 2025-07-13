import { useUserStore } from '@/stores/userStore';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  
  // Force re-render when authentication state changes
  useEffect(() => {
    console.log('Index: hasCompletedOnboarding =', hasCompletedOnboarding, 'isAuthenticated =', isAuthenticated);
  }, [hasCompletedOnboarding, isAuthenticated]);
  
  if (hasCompletedOnboarding && isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }
  
  return <Redirect href="/(onboarding)" />;
} 