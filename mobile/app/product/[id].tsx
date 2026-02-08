import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Button } from '../../src/components';
import { useCartStore, useAuthStore } from '../../src/stores';
import api from '../../src/services/api';
import { Product, UNIT_LABELS } from '../../src/types';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart, isLoading: cartLoading } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.getProduct(id as string);
      if (response.success && response.data) {
        setProduct(response.data);
        setQuantity(response.data.minQuantity || 1);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Erreur', 'Impossible de charger le produit');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;

    const newQuantity = quantity + delta;
    if (newQuantity < product.minQuantity) {
      Alert.alert(
        'Quantité minimale',
        `La quantité minimale est de ${product.minQuantity} ${UNIT_LABELS[product.unit]}`
      );
      return;
    }
    if (newQuantity > product.stock) {
      Alert.alert('Stock insuffisant', `Stock disponible: ${product.stock}`);
      return;
    }
    setQuantity(newQuantity);
  };

  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      if (Platform.OS === 'web') {
        if (window.confirm('Connexion requise. Voulez-vous vous connecter ?')) {
          router.push('/(auth)/login');
        }
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Connexion requise', 'Connectez-vous pour ajouter des produits au panier', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') },
        ]);
      }
      return;
    }

    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      setAddedToCart(true);
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(error.message || 'Impossible d\'ajouter au panier');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Erreur', error.message || 'Impossible d\'ajouter au panier');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.errorText}>Produit non trouvé</Text>
        <Button title="Retour" onPress={() => router.back()} />
      </View>
    );
  }

  const images = product.images || [];
  const primaryImage = images.find((img) => img.isPrimary) || images[0];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveImageIndex(index);
                }}
              >
                {images.map((image, index) => (
                  <Image
                    key={image.id}
                    source={{ uri: image.url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.pagination}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === activeImageIndex && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>🌱</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.category}>{product.category?.name}</Text>
            <Text style={styles.name}>{product.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              <Text style={styles.unit}>/ {UNIT_LABELS[product.unit]}</Text>
            </View>
          </View>

          {/* Stock Info */}
          <View style={styles.stockInfo}>
            {product.stock > 0 ? (
              <View style={styles.stockBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.stockText}>En stock ({product.stock} disponibles)</Text>
              </View>
            ) : (
              <View style={[styles.stockBadge, styles.outOfStock]}>
                <Ionicons name="close-circle" size={16} color={COLORS.error} />
                <Text style={[styles.stockText, { color: COLORS.error }]}>
                  Rupture de stock
                </Text>
              </View>
            )}
          </View>

          {/* Producer Info */}
          {product.producer && (
            <View style={styles.producerSection}>
              <Text style={styles.sectionTitle}>Producteur</Text>
              <TouchableOpacity style={styles.producerCard}>
                <View style={styles.producerAvatar}>
                  <Text style={styles.producerAvatarText}>
                    {product.producer.firstName?.[0]?.toUpperCase() || 'P'}
                  </Text>
                </View>
                <View style={styles.producerInfo}>
                  <Text style={styles.producerName}>
                    {product.producer.profile?.businessName ||
                     `${product.producer.firstName} ${product.producer.lastName}`}
                  </Text>
                  {product.producer.profile?.location && (
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={COLORS.gray[500]} />
                      <Text style={styles.producerLocation}>{product.producer.profile.location}</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
              </TouchableOpacity>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantité</Text>
            <View style={styles.quantityRow}>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(-1)}
                >
                  <Ionicons name="remove" size={24} color={COLORS.gray[600]} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(1)}
                >
                  <Ionicons name="add" size={24} color={COLORS.gray[600]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.subtotal}>
                {formatPrice(product.price * quantity)}
              </Text>
            </View>
            <Text style={styles.minQuantityInfo}>
              Quantité minimum: {product.minQuantity} {UNIT_LABELS[product.unit]}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {addedToCart ? (
          <View style={styles.addedActions}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.replace('/(tabs)/categories')}
            >
              <Ionicons name="arrow-back-outline" size={18} color={COLORS.primary[600]} />
              <Text style={styles.continueText}>Continuer mes achats</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <Ionicons name="cart-outline" size={18} color={COLORS.white} />
              <Text style={styles.cartButtonText}>Voir le panier</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            title="Ajouter au panier"
            onPress={handleAddToCart}
            loading={cartLoading}
            disabled={product.stock === 0}
            fullWidth
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: COLORS.gray[100],
  },
  image: {
    width: width,
    height: width * 0.8,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white + '80',
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
  },
  category: {
    fontSize: 12,
    color: COLORS.primary[600],
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.sm,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  unit: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginLeft: SPACING.xs,
  },
  stockInfo: {
    marginBottom: SPACING.md,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  outOfStock: {
    opacity: 1,
  },
  stockText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
  },
  producerSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  producerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  producerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  producerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  producerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  producerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  producerLocation: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginLeft: 2,
  },
  descriptionSection: {
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  quantitySection: {
    marginBottom: SPACING.md,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
  },
  quantityButton: {
    padding: SPACING.md,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: SPACING.lg,
    color: COLORS.gray[900],
  },
  subtotal: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  minQuantityInfo: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  bottomBar: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  addedActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.white,
  },
  continueText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary[500],
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
