import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Button } from '../../src/components';
import { useCartStore, useAuthStore } from '../../src/stores';
import { CartItem, UNIT_LABELS } from '../../src/types';

export default function CartScreen() {
  const router = useRouter();
  const { cart, isLoading, fetchCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < item.product.minQuantity) {
      Alert.alert(
        'Quantité minimale',
        `La quantité minimale est de ${item.product.minQuantity} ${UNIT_LABELS[item.product.unit]}`
      );
      return;
    }
    if (newQuantity > item.product.stock) {
      Alert.alert('Stock insuffisant', `Stock disponible: ${item.product.stock}`);
      return;
    }
    await updateQuantity(item.id, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous retirer ce produit du panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => removeItem(itemId),
        },
      ]
    );
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Connectez-vous</Text>
        <Text style={styles.emptyText}>
          Connectez-vous pour voir votre panier
        </Text>
        <Button
          title="Se connecter"
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Panier vide</Text>
        <Text style={styles.emptyText}>
          Ajoutez des produits pour commencer
        </Text>
        <Button
          title="Découvrir les produits"
          onPress={() => router.push('/categories')}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    );
  }

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const primaryImage = item.product.images?.find((img) => img.isPrimary) || item.product.images?.[0];

    return (
      <View style={styles.cartItem}>
        <View style={styles.imageContainer}>
          {primaryImage ? (
            <Image source={{ uri: primaryImage.url }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>🌱</Text>
            </View>
          )}
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.itemPrice}>
            {formatPrice(item.product.price)} / {UNIT_LABELS[item.product.unit]}
          </Text>
          <View style={styles.quantityRow}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item, -1)}
              >
                <Ionicons name="remove" size={20} color={COLORS.gray[600]} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item, 1)}
              >
                <Ionicons name="add" size={20} color={COLORS.gray[600]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemSubtotal}>
              {formatPrice(item.product.price * item.quantity)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const deliveryFee = cart.subtotal >= 20000 ? 0 : 1000;
  const total = cart.subtotal + deliveryFee;

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
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
        <Button
          title="Commander"
          onPress={handleCheckout}
          fullWidth
          loading={isLoading}
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
  listContent: {
    padding: SPACING.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  itemPrice: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
  },
  quantityButton: {
    padding: SPACING.xs,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: SPACING.sm,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  removeButton: {
    padding: SPACING.xs,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
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
    marginBottom: SPACING.md,
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
});
