import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants';
import { ProductCard } from '../src/components';
import api from '../src/services/api';
import { Product } from '../src/types';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setProducts([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await api.getProducts({ search: text.trim(), limit: 30 });
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSearch = (text: string) => {
    setQuery(text);
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => handleSearch(text), 400);
    setTimer(newTimer);
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productItem, index % 2 === 0 ? styles.left : styles.right]}>
      <ProductCard
        product={item}
        onPress={() => router.push(`/product/${item.id}`)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={COLORS.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          placeholderTextColor={COLORS.gray[400]}
          value={query}
          onChangeText={debouncedSearch}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(query)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setProducts([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
        </View>
      )}

      {!loading && searched && products.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={COLORS.gray[300]} />
          <Text style={styles.emptyTitle}>Aucun résultat</Text>
          <Text style={styles.emptyText}>
            Aucun produit ne correspond à "{query}"
          </Text>
        </View>
      )}

      {!loading && !searched && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={COLORS.gray[300]} />
          <Text style={styles.emptyTitle}>Rechercher</Text>
          <Text style={styles.emptyText}>
            Tapez au moins 2 caractères pour rechercher
          </Text>
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray[900],
    paddingVertical: SPACING.xs,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  listContent: {
    padding: SPACING.md,
  },
  productItem: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  left: {
    marginRight: SPACING.sm / 2,
  },
  right: {
    marginLeft: SPACING.sm / 2,
  },
});
