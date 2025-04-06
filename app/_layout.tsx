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

  // 子のレイアウトを邪魔しないようにシンプルに
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false, // ヘッダーを非表示に設定
        }}
      />
    </AuthProvider>
  );
}
