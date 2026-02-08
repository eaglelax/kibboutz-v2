import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Button } from '../../src/components';
import { useAuthStore } from '../../src/stores';
import api from '../../src/services/api';
import { Order, STATUS_LABELS, STATUS_COLORS } from '../../src/types';

type Tab = 'my' | 'producer';

export default function OrdersScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const isProducer = user?.role === 'PRODUCER';

  const [activeTab, setActiveTab] = useState<Tab>('my');
  const [orders, setOrders] = useState<Order[]>([]);
  const [producerOrders, setProducerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.getMyOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, []);

  const fetchProducerOrders = useCallback(async () => {
    try {
      const response = await api.getProducerOrders();
      if (response.success && response.data) {
        setProducerOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching producer orders:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchOrders();
    if (isProducer) {
      await fetchProducerOrders();
    }
    setLoading(false);
  }, [fetchOrders, fetchProducerOrders, isProducer]);

  useEffect(() => {
    if (isAuthenticated && pathname === '/orders') {
      loadData();
    }
  }, [isAuthenticated, pathname, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    if (isProducer) {
      await fetchProducerOrders();
    }
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Connectez-vous</Text>
        <Text style={styles.emptyText}>
          Connectez-vous pour voir vos commandes
        </Text>
        <Button
          title="Se connecter"
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    );
  }

  const currentData = activeTab === 'my' ? orders : producerOrders;

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/orders/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          {activeTab === 'producer' && (item as any).user && (
            <Text style={styles.clientName}>
              Client: {(item as any).user.firstName} {(item as any).user.lastName}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[item.status] + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}
          >
            {STATUS_LABELS[item.status]}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Articles</Text>
          <Text style={styles.detailValue}>{item.items?.length || 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>
          {activeTab === 'my' ? 'Aucune commande' : 'Aucune commande reçue'}
        </Text>
        <Text style={styles.emptyText}>
          {activeTab === 'my'
            ? "Vous n'avez pas encore passé de commande"
            : "Aucun client n'a encore commandé vos produits"}
        </Text>
        {activeTab === 'my' && (
          <Button
            title="Découvrir les produits"
            onPress={() => router.push('/categories')}
            style={{ marginTop: SPACING.lg }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isProducer && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.tabActive]}
            onPress={() => setActiveTab('my')}
          >
            <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
              Mes commandes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'producer' && styles.tabActive]}
            onPress={() => setActiveTab('producer')}
          >
            <Text style={[styles.tabText, activeTab === 'producer' && styles.tabTextActive]}>
              Commandes reçues
            </Text>
            {producerOrders.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{producerOrders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={currentData.length === 0 ? { flexGrow: 1 } : styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary[500]]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: SPACING.xs,
  },
  tabActive: {
    borderBottomColor: COLORS.primary[500],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[500],
  },
  tabTextActive: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: COLORS.primary[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  clientName: {
    fontSize: 13,
    color: COLORS.primary[600],
    fontWeight: '500',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  detailRow: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginTop: 2,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary[600],
    marginTop: 2,
  },
  orderFooter: {
    alignItems: 'flex-end',
    marginTop: SPACING.sm,
  },
});
