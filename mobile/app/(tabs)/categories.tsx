import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants';
import { ProductCard } from '../../src/components';
import api from '../../src/services/api';
import { Product, Category } from '../../src/types';

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    (params.selected as string) || null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async (categoryId?: string | null) => {
    setLoading(true);
    try {
      const response = await api.getProducts({
        category: categoryId || undefined,
        limit: 50,
      });
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(selectedCategory);
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(selectedCategory);
  };

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        data={[{ id: null, name: 'Tous', icon: '🏠' }, ...categories]}
        keyExtractor={(item) => item.id || 'all'}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === item.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={styles.filterIcon}>{item.icon || '📦'}</Text>
            <Text
              style={[
                styles.filterText,
                selectedCategory === item.id && styles.filterTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productItem, index % 2 === 0 ? styles.productItemLeft : styles.productItemRight]}>
      <ProductCard
        product={item}
        onPress={() => router.push(`/product/${item.id}`)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {renderCategoryFilter()}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary[500]]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary[500],
  },
  filterIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  filterTextActive: {
    color: COLORS.white,
  },
  productsList: {
    padding: SPACING.md,
  },
  productItem: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  productItemLeft: {
    marginRight: SPACING.sm / 2,
  },
  productItemRight: {
    marginLeft: SPACING.sm / 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
  },
});
