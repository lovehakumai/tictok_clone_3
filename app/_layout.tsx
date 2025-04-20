// app/_layout.tsx
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '../global.css'; // グローバルCSSをインポート
import { AuthContext, AuthProvider } from '@/providers/AuthProvider';
import { CardStyleInterpolators } from '@react-navigation/stack';

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
        <Stack.Screen name="comment" options={{headersShown: false, presantation: "modal"}}/>
        <Stack.Screen name="followers" options={{headersShown: false}}/>
        <Stack.Screen name='user' options={{headerShown: false}}/>
        <Stack.Screen name='chat' options={{headerShown: false}}/>
        <Stack.Screen name='activity' options={{headerShown: false}}/>
        <Stack.Screen name='search' options={{headerShown: false}}/>
        <Stack.Screen name="camera" options={{headersShown: false, presentation: "modal"}}/>
      </Stack>
    </AuthProvider>
  );
}
