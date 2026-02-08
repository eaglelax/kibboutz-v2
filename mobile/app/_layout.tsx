import 'react-native-get-random-values';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/stores';
import { COLORS } from '../src/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const { initialize, isInitialized } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setIsReady(true);
      }
    };

    init();

    // Timeout de secours après 5 secondes
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  if (!isReady && !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary[500] }}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.gray[900],
              headerTitleStyle: {
                fontWeight: '600',
              },
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: COLORS.gray[50],
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[id]"
              options={{
                title: 'Détail produit',
                headerBackTitle: 'Retour',
              }}
            />
            <Stack.Screen
              name="checkout"
              options={{
                title: 'Commande',
                headerBackTitle: 'Retour',
              }}
            />
            <Stack.Screen
              name="orders/[id]"
              options={{
                title: 'Détail commande',
                headerBackTitle: 'Retour',
              }}
            />
            <Stack.Screen
              name="search"
              options={{
                title: 'Rechercher',
                headerBackTitle: 'Retour',
              }}
            />
            <Stack.Screen
              name="producer/product-form"
              options={{
                title: 'Produit',
                headerBackTitle: 'Retour',
              }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
