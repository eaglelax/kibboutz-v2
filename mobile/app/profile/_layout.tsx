import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.white },
        headerTintColor: COLORS.gray[900],
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        headerBackTitle: 'Retour',
        contentStyle: { backgroundColor: COLORS.gray[50] },
      }}
    >
      <Stack.Screen name="edit" options={{ title: 'Modifier le profil' }} />
      <Stack.Screen name="addresses" options={{ title: 'Mes adresses' }} />
      <Stack.Screen name="address-new" options={{ title: 'Nouvelle adresse' }} />
      <Stack.Screen name="favorites" options={{ title: 'Favoris' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="help" options={{ title: 'Aide & Support' }} />
      <Stack.Screen name="terms" options={{ title: "Conditions d'utilisation" }} />
    </Stack>
  );
}
