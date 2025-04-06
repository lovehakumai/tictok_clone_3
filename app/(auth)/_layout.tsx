import React from 'react'
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function () {
  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false}} />
        <Stack.Screen 
          name="signup" 
          options={{ 
            headerShown: false, 
            presentation: "modal", 
            contentStyle: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }, // 背景を半透明に
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
  );
};
