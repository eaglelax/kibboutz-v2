import { ScrollView, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../src/constants';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Conditions Générales d'Utilisation</Text>
      <Text style={styles.date}>Dernière mise à jour : Février 2026</Text>

      <Text style={styles.heading}>1. Objet</Text>
      <Text style={styles.paragraph}>
        Les présentes conditions générales d'utilisation régissent l'accès et l'utilisation
        de l'application mobile Kibboutz, plateforme de mise en relation entre producteurs
        agricoles locaux et consommateurs.
      </Text>

      <Text style={styles.heading}>2. Inscription</Text>
      <Text style={styles.paragraph}>
        L'utilisation de l'application nécessite la création d'un compte. L'utilisateur
        s'engage à fournir des informations exactes et à jour. Deux types de comptes sont
        disponibles : Client et Producteur.
      </Text>

      <Text style={styles.heading}>3. Commandes</Text>
      <Text style={styles.paragraph}>
        Les commandes sont passées via l'application. Le paiement s'effectue à la livraison
        (Cash on Delivery). Kibboutz agit en tant qu'intermédiaire et ne peut être tenu
        responsable de la qualité des produits fournis par les producteurs.
      </Text>

      <Text style={styles.heading}>4. Livraison</Text>
      <Text style={styles.paragraph}>
        La livraison est assurée par des livreurs partenaires. Les frais de livraison sont
        de 1 000 FCFA pour les commandes inférieures à 20 000 FCFA. La livraison est
        gratuite au-delà de ce montant.
      </Text>

      <Text style={styles.heading}>5. Annulation</Text>
      <Text style={styles.paragraph}>
        Les commandes peuvent être annulées tant qu'elles n'ont pas été prises en charge
        par le producteur (statut "En attente" ou "Confirmée"). Aucune annulation n'est
        possible une fois la préparation commencée.
      </Text>

      <Text style={styles.heading}>6. Données personnelles</Text>
      <Text style={styles.paragraph}>
        Kibboutz s'engage à protéger les données personnelles de ses utilisateurs
        conformément à la réglementation en vigueur. Les données collectées sont utilisées
        uniquement dans le cadre du fonctionnement de la plateforme.
      </Text>

      <Text style={styles.heading}>7. Contact</Text>
      <Text style={styles.paragraph}>
        Pour toute question relative aux présentes conditions, vous pouvez nous contacter
        à l'adresse support@kibboutz.com.
      </Text>

      <Text style={styles.footer}>
        En utilisant l'application Kibboutz, vous acceptez les présentes conditions
        générales d'utilisation.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginBottom: SPACING.xl,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  footer: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray[700],
    marginTop: SPACING.xl,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
