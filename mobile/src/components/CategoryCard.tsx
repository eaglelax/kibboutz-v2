import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{category.icon || '📦'}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 80,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray[700],
    textAlign: 'center',
  },
});
