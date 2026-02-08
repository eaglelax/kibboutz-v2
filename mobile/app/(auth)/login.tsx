import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants';
import { Button, Input } from '../../src/components';
import { useAuthStore } from '../../src/stores';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login(email, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Erreur de connexion',
        error.message || 'Email ou mot de passe incorrect'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue</Text>
          <Text style={styles.subtitle}>
            Connectez-vous pour accéder à vos produits frais
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            style={{ marginTop: SPACING.md }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testAccounts}>
          <Text style={styles.testTitle}>Comptes de test :</Text>
          <Text style={styles.testAccount}>Client: client@kibboutz.com / client123</Text>
          <Text style={styles.testAccount}>Producteur: producteur@kibboutz.com / producteur123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary[600],
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.primary[600],
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  testAccounts: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
  },
  testTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  testAccount: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
  },
});
