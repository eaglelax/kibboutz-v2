import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants';
import { ProductCard, CategoryCard } from '../../src/components';
import api from '../../src/services/api';
import { Product, Category } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [catResponse, prodResponse] = await Promise.all([
        api.getCategories(),
        api.getProducts({ limit: 10 }),
      ]);

      if (catResponse.success && catResponse.data) {
        setCategories(catResponse.data);
      }
      if (prodResponse.success && prodResponse.data) {
        setProducts(prodResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/search' as any)}
        activeOpacity={0.7}
      >
        <Ionicons name="search-outline" size={20} color={COLORS.gray[400]} />
        <Text style={styles.searchPlaceholder}>Rechercher un produit...</Text>
      </TouchableOpacity>

      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Produits frais</Text>
        <Text style={styles.heroSubtitle}>
          Directement du producteur à votre table
        </Text>
        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => router.push('/categories')}
        >
          <Text style={styles.heroButtonText}>Découvrir</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <TouchableOpacity onPress={() => router.push('/categories')}>
          <Text style={styles.seeAll}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <CategoryCard
              category={item}
              onPress={() => router.push(`/categories?selected=${item.id}`)}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );

  const renderProducts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Produits populaires</Text>
      </View>
      <View style={styles.productsGrid}>
        {products.map((product) => (
          <View key={product.id} style={styles.productItem}>
            <ProductCard
              product={product}
              onPress={() => router.push(`/product/${product.id}`)}
            />
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary[500]]}
          tintColor={COLORS.primary[500]}
        />
      }
    >
      {renderHeader()}
      {renderCategories()}
      {renderProducts()}
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
  header: {
    padding: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: COLORS.gray[400],
  },
  heroSection: {
    backgroundColor: COLORS.primary[500],
    borderRadius: 16,
    padding: SPACING.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.primary[100],
    marginTop: SPACING.xs,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  heroButtonText: {
    color: COLORS.primary[600],
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary[600],
    fontWeight: '500',
  },
  categoriesList: {
    paddingHorizontal: SPACING.md,
  },
  categoryItem: {
    marginRight: SPACING.sm,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
  },
  productItem: {
    width: '48%',
    marginBottom: SPACING.md,
    marginRight: '4%',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
