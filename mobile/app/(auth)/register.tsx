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
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Button, Input } from '../../src/components';
import { useAuthStore } from '../../src/stores';

type AccountType = 'CLIENT' | 'PRODUCER';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [accountType, setAccountType] = useState<AccountType>('CLIENT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    if (!phone) {
      newErrors.phone = 'Le téléphone est requis';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: accountType,
      });
      Alert.alert(
        'Inscription réussie',
        'Votre compte a été créé avec succès',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (error: any) {
      Alert.alert(
        'Erreur d\'inscription',
        error.message || 'Une erreur est survenue lors de l\'inscription'
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
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez la communauté Kibboutz
          </Text>
        </View>

        <View style={styles.accountTypeSection}>
          <Text style={styles.sectionLabel}>Type de compte</Text>
          <View style={styles.accountTypeContainer}>
            <TouchableOpacity
              style={[
                styles.accountTypeButton,
                accountType === 'CLIENT' && styles.accountTypeButtonActive,
              ]}
              onPress={() => setAccountType('CLIENT')}
            >
              <Text
                style={[
                  styles.accountTypeText,
                  accountType === 'CLIENT' && styles.accountTypeTextActive,
                ]}
              >
                Client
              </Text>
              <Text
                style={[
                  styles.accountTypeDesc,
                  accountType === 'CLIENT' && styles.accountTypeDescActive,
                ]}
              >
                Acheter des produits
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.accountTypeButton,
                accountType === 'PRODUCER' && styles.accountTypeButtonActive,
              ]}
              onPress={() => setAccountType('PRODUCER')}
            >
              <Text
                style={[
                  styles.accountTypeText,
                  accountType === 'PRODUCER' && styles.accountTypeTextActive,
                ]}
              >
                Producteur
              </Text>
              <Text
                style={[
                  styles.accountTypeDesc,
                  accountType === 'PRODUCER' && styles.accountTypeDescActive,
                ]}
              >
                Vendre mes produits
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Prénom"
                placeholder="Jean"
                value={firstName}
                onChangeText={setFirstName}
                error={errors.firstName}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Nom"
                placeholder="Dupont"
                value={lastName}
                onChangeText={setLastName}
                error={errors.lastName}
              />
            </View>
          </View>

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
            label="Téléphone"
            placeholder="+237 6XX XXX XXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="S'inscrire"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={{ marginTop: SPACING.lg }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          En vous inscrivant, vous acceptez nos{' '}
          <Text style={styles.termsLink}>Conditions d'utilisation</Text> et notre{' '}
          <Text style={styles.termsLink}>Politique de confidentialité</Text>
        </Text>
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
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  accountTypeSection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  accountTypeButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  accountTypeButtonActive: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  accountTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  accountTypeTextActive: {
    color: COLORS.primary[700],
  },
  accountTypeDesc: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  accountTypeDescActive: {
    color: COLORS.primary[600],
  },
  form: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
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
  terms: {
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary[600],
  },
});
