import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import {
  useFonts,
  SpaceGrotesk_700Bold,
  SpaceGrotesk_600SemiBold,
} from '@expo-google-fonts/space-grotesk';
import {
  Manrope_400Regular,
  Manrope_500Medium,
} from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store/auth-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// QueryClient singleton — deve estar fora do componente para não ser recriado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minuto
    },
  },
});

export default function RootLayout() {
  const { initializeAuth, isLoading: isAuthLoading } = useAuthStore();
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_700Bold,
    SpaceGrotesk_600SemiBold,
    Manrope_400Regular,
    Manrope_500Medium,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !isAuthLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D' }} />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
