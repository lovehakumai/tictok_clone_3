// app/_layout.tsx
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '../global.css'; // グローバルCSSをインポート
import { AuthContext, AuthProvider } from '@/providers/AuthProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="(auth)" options={{headersShown: false}}/>
        <Stack.Screen name="(tabs)" options={{headersShown: false}}/>
        <Stack.Screen name="camera" options={{headersShown: false, presentation: "modal"}}/>
      </Stack>
    </AuthProvider>
  );
}
