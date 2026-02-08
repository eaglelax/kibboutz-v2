import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Button } from '../../src/components';
import api from '../../src/services/api';
import { Address } from '../../src/types';

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = async () => {
    try {
      const response = await api.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      await api.setDefaultAddress(id);
      fetchAddresses();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette adresse ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteAddress(id);
            fetchAddresses();
          } catch (error: any) {
            Alert.alert('Erreur', error.message);
          }
        },
      },
    ]);
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.labelRow}>
          <Ionicons name="location" size={18} color={COLORS.primary[600]} />
          <Text style={styles.label}>{item.label}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Par défaut</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.street}>{item.street || item.fullAddress}</Text>
      <Text style={styles.city}>
        {item.quarter ? `${item.quarter}, ` : ''}{item.city}, {item.country}
      </Text>
      {item.phone && <Text style={styles.phone}>{item.phone}</Text>}

      <View style={styles.actions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Ionicons name="star-outline" size={16} color={COLORS.primary[600]} />
            <Text style={styles.actionText}>Par défaut</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddress}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAddresses(); }}
            colors={[COLORS.primary[500]]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={64} color={COLORS.gray[300]} />
              <Text style={styles.emptyTitle}>Aucune adresse</Text>
              <Text style={styles.emptyText}>Ajoutez une adresse de livraison</Text>
            </View>
          ) : null
        }
      />

      <View style={styles.footer}>
        <Button
          title="Ajouter une adresse"
          onPress={() => router.push('/profile/address-new')}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  addressHeader: {
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  defaultBadge: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  defaultText: {
    fontSize: 10,
    color: COLORS.primary[700],
    fontWeight: '600',
  },
  street: {
    fontSize: 14,
    color: COLORS.gray[700],
  },
  city: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  phone: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.primary[600],
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
});
