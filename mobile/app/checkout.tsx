import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants';
import { Button, Input } from '../src/components';
import { useCartStore, useAuthStore } from '../src/stores';
import api from '../src/services/api';
import { Address, PaymentMethod, PAYMENT_METHOD_LABELS } from '../src/types';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
        const defaultAddress = response.data.find((a: Address) => a.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        } else if (response.data.length > 0) {
          setSelectedAddress(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setFetchingAddresses(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const deliveryFee = cart && cart.subtotal >= 20000 ? 0 : 1000;
  const total = (cart?.subtotal || 0) + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Erreur', 'Veuillez sélectionner une adresse de livraison');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createOrder({
        addressId: selectedAddress,
        notes: notes.trim() || undefined,
      });

      if (response.success && response.data) {
        await clearCart();
        Alert.alert(
          'Commande confirmée',
          'Votre commande a été passée avec succès',
          [
            {
              text: 'Voir ma commande',
              onPress: () => router.replace(`/orders/${response.data!.id}`),
            },
            {
              text: 'Continuer mes achats',
              onPress: () => router.replace('/(tabs)/categories'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de passer la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Panier vide</Text>
        <Text style={styles.emptyText}>Ajoutez des produits pour commander</Text>
        <Button
          title="Voir les produits"
          onPress={() => router.push('/categories')}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    );
  }

  const paymentMethods: PaymentMethod[] = ['CASH_ON_DELIVERY', 'MOBILE_MONEY', 'CARD'];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          {fetchingAddresses ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : addresses.length === 0 ? (
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => router.push('/profile/address-new' as any)}
            >
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary[600]} />
              <Text style={styles.addAddressText}>Ajouter une adresse</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressCard,
                  selectedAddress === address.id && styles.addressCardSelected,
                ]}
                onPress={() => setSelectedAddress(address.id)}
              >
                <View style={styles.radioOuter}>
                  {selectedAddress === address.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>{address.label}</Text>
                  <Text style={styles.addressText}>{address.street}</Text>
                  <Text style={styles.addressText}>
                    {address.city}, {address.country}
                  </Text>
                  {address.phone && (
                    <Text style={styles.addressPhone}>{address.phone}</Text>
                  )}
                </View>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Par défaut</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentOption,
                paymentMethod === method && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method)}
            >
              <View style={styles.radioOuter}>
                {paymentMethod === method && <View style={styles.radioInner} />}
              </View>
              <View style={styles.paymentInfo}>
                <Ionicons
                  name={
                    method === 'CASH_ON_DELIVERY'
                      ? 'cash-outline'
                      : method === 'MOBILE_MONEY'
                      ? 'phone-portrait-outline'
                      : 'card-outline'
                  }
                  size={24}
                  color={paymentMethod === method ? COLORS.primary[600] : COLORS.gray[600]}
                />
                <Text
                  style={[
                    styles.paymentLabel,
                    paymentMethod === method && styles.paymentLabelSelected,
                  ]}
                >
                  {PAYMENT_METHOD_LABELS[method]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (optionnel)</Text>
          <Input
            placeholder="Instructions pour la livraison..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Articles ({cart.itemCount})
              </Text>
              <Text style={styles.summaryValue}>{formatPrice(cart.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Livraison</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee === 0 ? 'Gratuite' : formatPrice(deliveryFee)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>{formatPrice(total)}</Text>
        </View>
        <Button
          title="Confirmer la commande"
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={!selectedAddress}
          style={{ flex: 1 }}
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
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
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
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  loadingText: {
    color: COLORS.gray[500],
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary[200],
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
  },
  addAddressText: {
    fontSize: 14,
    color: COLORS.primary[600],
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  addressCardSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary[500],
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  addressText: {
    fontSize: 13,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  addressPhone: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: COLORS.primary[700],
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.gray[700],
    marginLeft: SPACING.sm,
  },
  paymentLabelSelected: {
    color: COLORS.primary[700],
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.gray[900],
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: SPACING.md,
  },
  totalSection: {},
  bottomTotalLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
});
