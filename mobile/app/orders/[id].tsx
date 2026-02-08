import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Button } from '../../src/components';
import { useAuthStore } from '../../src/stores';
import api from '../../src/services/api';
import {
  Order,
  OrderItem,
  OrderStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  UNIT_LABELS,
} from '../../src/types';

const PRODUCER_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string; icon: string }>> = {
  PENDING: { next: 'PREPARING', label: 'Confirmer la commande', icon: 'checkmark-circle-outline' },
  PREPARING: { next: 'READY', label: 'Commande prête', icon: 'checkmark-done-outline' },
  READY: { next: 'IN_DELIVERY', label: 'En attente de livraison', icon: 'bicycle-outline' },
  IN_DELIVERY: { next: 'DELIVERED', label: 'Marquer comme livrée', icon: 'bag-check-outline' },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.getOrder(id as string);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Erreur', 'Impossible de charger la commande');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const doCancelOrder = async () => {
    try {
      await api.cancelOrder(id as string);
      fetchOrder();
    } catch (error: any) {
      const msg = error?.response?.data?.error || error.message || 'Impossible d\'annuler la commande';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Erreur', msg);
      }
    }
  };

  const handleCancelOrder = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous vraiment annuler cette commande ?')) {
        doCancelOrder();
      }
    } else {
      const { Alert } = require('react-native');
      Alert.alert(
        'Annuler la commande',
        'Voulez-vous vraiment annuler cette commande ?',
        [
          { text: 'Non', style: 'cancel' },
          { text: 'Oui, annuler', style: 'destructive', onPress: doCancelOrder },
        ]
      );
    }
  };

  const showError = (msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Erreur', msg);
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await api.updateOrderStatus(id as string, newStatus);
      if (res.success) {
        fetchOrder();
      } else {
        showError(res.error || 'Impossible de mettre à jour le statut');
      }
    } catch (error: any) {
      showError(error?.response?.data?.error || 'Impossible de mettre à jour le statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.errorText}>Commande non trouvée</Text>
        <Button title="Retour" onPress={() => router.back()} />
      </View>
    );
  }

  const canCancel = order.status === 'PENDING';

  return (
    <ScrollView style={styles.container}>
      {/* Order Header */}
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[order.status] + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
            {STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      {/* Order Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suivi de commande</Text>
        <View style={styles.timeline}>
          {(['PENDING', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED'] as const).map(
            (status, index) => {
              const statusOrder = ['PENDING', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED'];
              const currentIndex = statusOrder.indexOf(order.status);
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <View key={status} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      isCompleted && styles.timelineDotCompleted,
                      isCurrent && styles.timelineDotCurrent,
                    ]}
                  >
                    {isCompleted && (
                      <Ionicons name="checkmark" size={12} color={COLORS.white} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelCompleted,
                      isCurrent && styles.timelineLabelCurrent,
                    ]}
                  >
                    {STATUS_LABELS[status]}
                  </Text>
                  {index < 4 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
              );
            }
          )}
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Articles ({order.items?.length || 0})
        </Text>
        {order.items?.map((item: OrderItem) => {
          const primaryImage =
            item.product?.images?.find((img) => img.isPrimary) ||
            item.product?.images?.[0];

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => router.push(`/product/${item.productId}`)}
            >
              <View style={styles.itemImage}>
                {primaryImage ? (
                  <Image source={{ uri: primaryImage.url }} style={styles.image} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>🌱</Text>
                  </View>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product?.name || 'Produit'}
                </Text>
                <Text style={styles.itemQuantity}>
                  {item.quantity} x {formatPrice(item.price)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {formatPrice(item.quantity * item.price)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <View style={styles.addressCard}>
            <Ionicons name="location-outline" size={20} color={COLORS.gray[500]} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>{order.deliveryAddress.label}</Text>
              <Text style={styles.addressText}>{order.deliveryAddress.street}</Text>
              <Text style={styles.addressText}>
                {order.deliveryAddress.city}, {order.deliveryAddress.country}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Payment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paiement</Text>
        <View style={styles.paymentCard}>
          <Ionicons
            name={
              order.paymentMethod === 'CASH_ON_DELIVERY'
                ? 'cash-outline'
                : order.paymentMethod === 'MOBILE_MONEY'
                ? 'phone-portrait-outline'
                : 'card-outline'
            }
            size={20}
            color={COLORS.gray[600]}
          />
          <Text style={styles.paymentMethod}>
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </Text>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Résumé</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryValue}>
              {order.deliveryFee === 0 ? 'Gratuite' : formatPrice(order.deliveryFee)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      {order.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      )}

      {/* Producer Actions */}
      {user?.role === 'PRODUCER' && PRODUCER_TRANSITIONS[order.status] && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.producerActionButton}
            onPress={() => handleUpdateStatus(PRODUCER_TRANSITIONS[order.status]!.next)}
            disabled={updatingStatus}
            activeOpacity={0.8}
          >
            <Ionicons
              name={PRODUCER_TRANSITIONS[order.status]!.icon as any}
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.producerActionText}>
              {updatingStatus ? 'Mise à jour...' : PRODUCER_TRANSITIONS[order.status]!.label}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Client Actions */}
      {canCancel && user?.role !== 'PRODUCER' && (
        <View style={styles.actions}>
          <Button
            title="Annuler la commande"
            onPress={handleCancelOrder}
            variant="outline"
            fullWidth
          />
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.gray[600],
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
  },
  orderInfo: {},
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  orderDate: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  timeline: {
    paddingLeft: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineDotCurrent: {
    backgroundColor: COLORS.primary[500],
  },
  timelineLabel: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginLeft: SPACING.md,
  },
  timelineLabelCompleted: {
    color: COLORS.gray[600],
  },
  timelineLabelCurrent: {
    color: COLORS.gray[900],
    fontWeight: '600',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    width: 2,
    height: 24,
    backgroundColor: COLORS.gray[200],
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.success,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.gray[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  itemQuantity: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  addressInfo: {
    marginLeft: SPACING.sm,
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
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  paymentMethod: {
    fontSize: 14,
    color: COLORS.gray[700],
    marginLeft: SPACING.sm,
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
  notesText: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  actions: {
    padding: SPACING.md,
  },
  producerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  producerActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
