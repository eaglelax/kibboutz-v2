import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { Product, UNIT_LABELS } from '../types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {primaryImage ? (
          <Image
            source={{ uri: primaryImage.url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🌱</Text>
          </View>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <View style={[styles.badge, styles.warningBadge]}>
            <Text style={styles.badgeText}>Stock limité</Text>
          </View>
        )}
        {product.stock === 0 && (
          <View style={[styles.badge, styles.errorBadge]}>
            <Text style={styles.badgeText}>Rupture</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {product.category?.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.unit}>/{UNIT_LABELS[product.unit]}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: COLORS.gray[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  warningBadge: {
    backgroundColor: COLORS.warning,
  },
  errorBadge: {
    backgroundColor: COLORS.error,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  category: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.xs,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  unit: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginLeft: 2,
  },
});
