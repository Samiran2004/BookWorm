import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from '../components/SafeScreen';
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { checkAuth, user, token } = useAuthStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkAuth();
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return; // ✅ Prevent navigation before ready

    const inAuthGroup = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isReady, user, token, segments]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}