import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants';
import { Button, Input } from '../../src/components';
import api from '../../src/services/api';

export default function NewAddressScreen() {
  const router = useRouter();

  const [label, setLabel] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [quarter, setQuarter] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!label.trim()) newErrors.label = 'Le nom de l\'adresse est requis';
    if (!fullAddress.trim()) newErrors.fullAddress = 'L\'adresse est requise';
    if (!city.trim()) newErrors.city = 'La ville est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.createAddress({
        label: label.trim(),
        fullAddress: fullAddress.trim(),
        city: city.trim(),
        quarter: quarter.trim() || undefined,
        isDefault,
      });
      if (response.success) {
        Alert.alert('Succès', 'Adresse ajoutée', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'ajouter l\'adresse');
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
        <Input
          label="Nom de l'adresse"
          placeholder="Ex: Maison, Bureau, Chez Maman..."
          value={label}
          onChangeText={setLabel}
          error={errors.label}
        />

        <Input
          label="Adresse complète"
          placeholder="Rue, numéro, bâtiment..."
          value={fullAddress}
          onChangeText={setFullAddress}
          multiline
          numberOfLines={2}
          error={errors.fullAddress}
        />

        <Input
          label="Ville"
          placeholder="Ex: Douala, Yaoundé..."
          value={city}
          onChangeText={setCity}
          error={errors.city}
        />

        <Input
          label="Quartier (optionnel)"
          placeholder="Ex: Bonanjo, Bastos..."
          value={quarter}
          onChangeText={setQuarter}
        />

        <Input
          label="Téléphone de contact (optionnel)"
          placeholder="+237 6XX XXX XXX"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Adresse par défaut</Text>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: COLORS.gray[300], true: COLORS.primary[300] }}
            thumbColor={isDefault ? COLORS.primary[500] : COLORS.gray[100]}
          />
        </View>

        <Button
          title="Enregistrer l'adresse"
          onPress={handleSave}
          loading={loading}
          fullWidth
          style={{ marginTop: SPACING.lg }}
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
});
