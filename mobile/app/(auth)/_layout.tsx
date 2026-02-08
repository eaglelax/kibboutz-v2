import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: COLORS.gray[900],
        },
        headerShadowVisible: false,
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Connexion',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Inscription',
        }}
      />
    </Stack>
  );
}
