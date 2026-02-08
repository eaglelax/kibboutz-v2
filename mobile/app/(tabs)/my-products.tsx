import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Product, UNIT_LABELS } from '../../src/types';
import { api } from '../../src/services/api';

export default function MyProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      const res = await api.getMyProducts({ page: pageNum, limit: 20 });
      if (res.success && res.data) {
        if (append) {
          setProducts(prev => [...prev, ...res.data!]);
        } else {
          setProducts(res.data);
        }
        const totalPages = res.pagination?.totalPages || 1;
        setHasMore(pageNum < totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/my-products') {
      setLoading(true);
      fetchProducts(1);
    }
  }, [pathname, fetchProducts]);

  const handleRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    fetchProducts(1);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchProducts(page + 1, true);
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await api.updateProduct(product.id, { isActive: !product.isActive });
      if (res.success) {
        setProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le statut du produit');
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Supprimer le produit',
      `Voulez-vous vraiment supprimer "${product.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.deleteProduct(product.id);
              if (res.success) {
                setProducts(prev => prev.filter(p => p.id !== product.id));
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR') + ' FCFA';
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const primaryImage = item.images?.find(img => img.isPrimary) || item.images?.[0];

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push({ pathname: '/producer/product-form', params: { id: item.id } })}
        activeOpacity={0.7}
      >
        <View style={styles.productRow}>
          {primaryImage ? (
            <Image source={{ uri: primaryImage.url }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.noImage]}>
              <Ionicons name="image-outline" size={24} color={COLORS.gray[300]} />
            </View>
          )}

          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.isActive ? COLORS.primary[100] : COLORS.gray[100] },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: item.isActive ? COLORS.primary[700] : COLORS.gray[500] },
                  ]}
                >
                  {item.isActive ? 'Actif' : 'Inactif'}
                </Text>
              </View>
            </View>

            <Text style={styles.productCategory}>
              {item.category?.name || 'Sans catégorie'}
            </Text>

            <View style={styles.productDetails}>
              <Text style={styles.productPrice}>
                {formatPrice(item.price)}/{UNIT_LABELS[item.unit] || item.unit}
              </Text>
              <Text style={styles.productStock}>
                Stock: {item.stock}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleActive(item)}
            >
              <Ionicons
                name={item.isActive ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={item.isActive ? COLORS.primary[600] : COLORS.gray[400]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="leaf-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Aucun produit</Text>
        <Text style={styles.emptyText}>
          Commencez par ajouter votre premier produit
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/producer/product-form')}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.emptyButtonText}>Ajouter un produit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={products.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary[500]]}
            tintColor={COLORS.primary[500]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.primary[500]} />
            </View>
          ) : null
        }
      />

      {products.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/producer/product-form')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
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
  list: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  emptyList: {
    flexGrow: 1,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  productRow: {
    flexDirection: 'row',
    padding: SPACING.sm,
    alignItems: 'center',
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.md,
  },
  noImage: {
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray[900],
    flex: 1,
    marginRight: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  productStock: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  actions: {
    marginLeft: SPACING.xs,
    gap: SPACING.xs,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
  footerLoader: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
