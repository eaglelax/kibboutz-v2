import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';
import { useCartStore, useAuthStore } from '../../src/stores';
import { View, Text, StyleSheet } from 'react-native';

export default function TabsLayout() {
  const { cart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const isProducer = isAuthenticated && user?.role === 'PRODUCER';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: COLORS.gray[900],
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerTitle: 'Kibboutz',
          headerTitleStyle: {
            color: COLORS.primary[600],
            fontWeight: '700',
            fontSize: 20,
          },
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Catégories',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart-outline" size={size} color={color} />
              {cart && cart.itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cart.itemCount > 9 ? '9+' : cart.itemCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="my-products"
        options={{
          title: 'Mes Produits',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
          href: isProducer ? '/(tabs)/my-products' : null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.primary[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
