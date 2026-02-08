import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants';
import { Button, Input } from '../../src/components';
import { useAuthStore } from '../../src/stores';
import api from '../../src/services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!lastName.trim()) newErrors.lastName = 'Le nom est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.updateProfile({ firstName, lastName, phone });
      if (response.success) {
        await fetchUser();
        Alert.alert('Succès', 'Profil mis à jour', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstName?.[0]?.toUpperCase() || 'U'}
              {lastName?.[0]?.toUpperCase() || ''}
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <Input
            label="Prénom"
            placeholder="Votre prénom"
            value={firstName}
            onChangeText={setFirstName}
            error={errors.firstName}
          />
          <Input
            label="Nom"
            placeholder="Votre nom"
            value={lastName}
            onChangeText={setLastName}
            error={errors.lastName}
          />
          <Input
            label="Email"
            value={user?.email || ''}
            editable={false}
            style={{ color: COLORS.gray[400] }}
          />
          <Input
            label="Téléphone"
            placeholder="+237 6XX XXX XXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Button
          title="Enregistrer"
          onPress={handleSave}
          loading={loading}
          fullWidth
          style={{ marginTop: SPACING.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SPACING.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
  },
  form: {
    marginBottom: SPACING.md,
  },
});
