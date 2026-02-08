import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Button } from '../../src/components';
import { useAuthStore, useCartStore } from '../../src/stores';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setCart } = useCartStore();

  const doLogout = async () => {
    await logout();
    setCart(null);
    router.replace('/');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
        doLogout();
      }
    } else {
      const { Alert } = require('react-native');
      Alert.alert(
        'Déconnexion',
        'Voulez-vous vraiment vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnexion', style: 'destructive', onPress: doLogout },
        ]
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={64} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Connectez-vous</Text>
        <Text style={styles.emptyText}>
          Connectez-vous pour accéder à votre profil
        </Text>
        <Button
          title="Se connecter"
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: SPACING.lg }}
        />
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.registerText}>
            Pas encore de compte ? <Text style={styles.registerTextBold}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems = [
    ...(user?.role === 'PRODUCER'
      ? [
          {
            icon: 'leaf-outline',
            label: 'Mes Produits',
            onPress: () => router.push('/(tabs)/my-products'),
          },
        ]
      : []),
    {
      icon: 'person-outline',
      label: 'Informations personnelles',
      onPress: () => router.push('/profile/edit' as any),
    },
    {
      icon: 'location-outline',
      label: 'Mes adresses',
      onPress: () => router.push('/profile/addresses' as any),
    },
    {
      icon: 'receipt-outline',
      label: 'Historique des commandes',
      onPress: () => router.push('/(tabs)/orders'),
    },
    {
      icon: 'heart-outline',
      label: 'Favoris',
      onPress: () => router.push('/profile/favorites' as any),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => router.push('/profile/notifications' as any),
    },
    {
      icon: 'help-circle-outline',
      label: 'Aide & Support',
      onPress: () => router.push('/profile/help' as any),
    },
    {
      icon: 'document-text-outline',
      label: 'Conditions d\'utilisation',
      onPress: () => router.push('/profile/terms' as any),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
            {user?.lastName?.[0]?.toUpperCase() || ''}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'CLIENT' ? 'Client' :
             user?.role === 'PRODUCER' ? 'Producteur' :
             user?.role === 'DELIVERY' ? 'Livreur' : 'Admin'}
          </Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={COLORS.gray[600]}
              />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.gray[400]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
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
  registerLink: {
    marginTop: SPACING.md,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  registerTextBold: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginTop: SPACING.md,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  roleBadge: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary[700],
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 15,
    color: COLORS.gray[800],
    marginLeft: SPACING.md,
  },
  logoutSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  logoutText: {
    fontSize: 15,
    color: COLORS.error,
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.gray[400],
    marginVertical: SPACING.lg,
  },
});
