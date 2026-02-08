import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="heart-outline" size={64} color={COLORS.gray[300]} />
      <Text style={styles.title}>Favoris</Text>
      <Text style={styles.text}>
        Cette fonctionnalité sera bientôt disponible.
      </Text>
      <Text style={styles.subtext}>
        Vous pourrez sauvegarder vos produits préférés ici.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginTop: SPACING.md,
  },
  text: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    color: COLORS.gray[400],
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});
