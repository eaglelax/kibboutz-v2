import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';

const FAQ_ITEMS = [
  {
    question: 'Comment passer une commande ?',
    answer: 'Parcourez les produits, ajoutez-les au panier, puis validez votre commande en choisissant une adresse de livraison et un mode de paiement.',
  },
  {
    question: 'Comment suivre ma commande ?',
    answer: 'Rendez-vous dans l\'onglet "Commandes" pour voir le statut de toutes vos commandes en temps réel.',
  },
  {
    question: 'Quels sont les modes de paiement ?',
    answer: 'Nous acceptons le paiement à la livraison (Cash on Delivery). Le paiement par Mobile Money sera bientôt disponible.',
  },
  {
    question: 'Comment devenir producteur ?',
    answer: 'Lors de l\'inscription, choisissez le type de compte "Producteur". Votre compte sera validé par notre équipe.',
  },
  {
    question: 'La livraison est-elle gratuite ?',
    answer: 'La livraison est gratuite pour les commandes de plus de 20 000 FCFA. En dessous, des frais de 1 000 FCFA s\'appliquent.',
  },
];

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        {FAQ_ITEMS.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nous contacter</Text>
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => Linking.openURL('mailto:support@kibboutz.com')}
        >
          <Ionicons name="mail-outline" size={22} color={COLORS.primary[600]} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>support@kibboutz.com</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => Linking.openURL('tel:+237600000000')}
        >
          <Ionicons name="call-outline" size={22} color={COLORS.primary[600]} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Téléphone</Text>
            <Text style={styles.contactValue}>+237 6XX XXX XXX</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  faqItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  answer: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  contactInfo: {
    marginLeft: SPACING.md,
  },
  contactLabel: {
    fontSize: 13,
    color: COLORS.gray[500],
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray[800],
    marginTop: 2,
  },
});
