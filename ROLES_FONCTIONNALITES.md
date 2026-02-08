# RÔLES ET FONCTIONNALITÉS - KIBBOUTZ

## Vue d'ensemble

Kibboutz est une marketplace agricole avec 4 rôles distincts, chacun avec des permissions et fonctionnalités spécifiques.

---

## 1. CLIENT

> Utilisateur final qui achète des produits agricoles

### Authentification
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Inscription | Email/téléphone + mot de passe | P0 |
| Connexion | Email ou téléphone | P0 |
| Déconnexion | Terminer la session | P0 |
| Mot de passe oublié | Réinitialisation par email | P1 |
| Modifier profil | Nom, téléphone, photo | P1 |

### Navigation & Catalogue
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Voir catégories | Liste des catégories de produits | P0 |
| Voir produits | Liste avec filtres et tri | P0 |
| Rechercher | Par nom, catégorie | P0 |
| Détail produit | Infos, images, producteur | P0 |
| Filtrer produits | Prix, catégorie, disponibilité | P1 |

### Panier & Commandes
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Ajouter au panier | Avec quantité | P0 |
| Modifier panier | Quantité, supprimer | P0 |
| Voir panier | Récapitulatif avec total | P0 |
| Gérer adresses | CRUD adresses de livraison | P0 |
| Passer commande | Checkout complet | P0 |
| Voir mes commandes | Historique avec statuts | P0 |
| Détail commande | Produits, statut, suivi | P0 |
| Annuler commande | Si statut = PENDING | P1 |

### Paiement (Sprint 1)
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Paiement à la livraison | COD (Cash On Delivery) | P0 |
| Mobile Money | Orange/MTN (V2) | V2 |

### Notifications (V2)
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Statut commande | Push/SMS | V2 |
| Promotions | Notifications marketing | V2 |

---

## 2. PRODUCTEUR (PRODUCER)

> Agriculteur/vendeur qui propose ses produits

### Authentification
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Inscription producteur | Formulaire spécifique | P0 |
| Profil entreprise | Nom commercial, description, localisation | P0 |
| Attente validation | Statut PENDING jusqu'à validation admin | P0 |

### Gestion Produits
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Ajouter produit | Nom, description, prix, unité, stock | P0 |
| Upload images | Jusqu'à 5 images par produit | P0 |
| Modifier produit | Toutes les infos | P0 |
| Supprimer produit | Soft delete (désactiver) | P0 |
| Gérer stock | Mise à jour quantités | P0 |
| Activer/Désactiver | Visibilité du produit | P1 |

### Gestion Commandes
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Voir commandes reçues | Liste des commandes contenant ses produits | P0 |
| Détail commande | Produits commandés, quantités | P0 |
| Marquer "En préparation" | Changer statut PREPARING | P0 |
| Marquer "Prête" | Changer statut READY | P0 |

### Dashboard
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Statistiques ventes | CA, nombre commandes | P1 |
| Produits populaires | Top 5 produits | P1 |
| Revenus par période | Graphique | V2 |

---

## 3. LIVREUR (DELIVERY)

> Personne qui effectue les livraisons (géré par admin en Sprint 1)

### Sprint 1 (Gestion manuelle par Admin)
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Compte livreur | Créé par admin | P0 |
| Assignation | Admin assigne les commandes | P0 |

### V2 (App dédiée)
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Voir livraisons assignées | Liste des commandes à livrer | V2 |
| Accepter/Refuser | Livraison | V2 |
| Marquer "En cours" | IN_DELIVERY | V2 |
| Marquer "Livrée" | DELIVERED + confirmation | V2 |
| Collecter paiement | COD | V2 |
| Navigation GPS | Vers adresse client | V2 |
| Historique livraisons | Avec gains | V2 |

---

## 4. ADMINISTRATEUR (ADMIN)

> Gestionnaire de la plateforme

### Dashboard
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| KPIs principaux | Commandes, CA, utilisateurs | P0 |
| Graphiques | Évolution commandes/CA | P1 |
| Alertes | Commandes en attente | P1 |

### Gestion Utilisateurs
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Liste utilisateurs | Tous les comptes | P0 |
| Filtrer par rôle | CLIENT, PRODUCER, DELIVERY | P0 |
| Voir détail | Infos complètes | P0 |
| Valider producteur | PENDING → ACTIVE | P0 |
| Suspendre compte | ACTIVE → SUSPENDED | P0 |
| Créer livreur | Compte DELIVERY | P0 |

### Gestion Catégories
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Liste catégories | Avec hiérarchie | P0 |
| Ajouter catégorie | Nom, slug, icône | P0 |
| Modifier catégorie | Toutes les infos | P0 |
| Supprimer catégorie | Si pas de produits | P1 |
| Réordonner | Ordre d'affichage | P1 |

### Gestion Commandes
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Liste commandes | Toutes avec filtres | P0 |
| Filtrer par statut | PENDING, CONFIRMED, etc. | P0 |
| Détail commande | Infos complètes | P0 |
| Changer statut | Tous les statuts | P0 |
| Assigner livreur | Sélection dans liste | P0 |
| Annuler commande | Avec raison | P1 |

### Gestion Produits
| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Liste tous produits | Tous les producteurs | P1 |
| Modérer produit | Activer/Désactiver | P1 |
| Supprimer produit | En cas de violation | P1 |

---

## MATRICE DES PERMISSIONS

| Action | CLIENT | PRODUCER | DELIVERY | ADMIN |
|--------|--------|----------|----------|-------|
| **CATALOGUE** |
| Voir catégories | ✅ | ✅ | ❌ | ✅ |
| Voir produits | ✅ | ✅ | ❌ | ✅ |
| Créer produit | ❌ | ✅ | ❌ | ❌ |
| Modifier produit | ❌ | ✅ (sien) | ❌ | ✅ |
| Supprimer produit | ❌ | ✅ (sien) | ❌ | ✅ |
| **COMMANDES** |
| Créer commande | ✅ | ❌ | ❌ | ❌ |
| Voir ses commandes | ✅ | ✅ | ✅ | ✅ |
| Voir toutes commandes | ❌ | ❌ | ❌ | ✅ |
| Changer statut | ❌ | ✅ (limité) | ✅ (limité) | ✅ |
| Assigner livreur | ❌ | ❌ | ❌ | ✅ |
| **UTILISATEURS** |
| Voir son profil | ✅ | ✅ | ✅ | ✅ |
| Modifier son profil | ✅ | ✅ | ✅ | ✅ |
| Voir autres profils | ❌ | ❌ | ❌ | ✅ |
| Valider producteur | ❌ | ❌ | ❌ | ✅ |
| Suspendre compte | ❌ | ❌ | ❌ | ✅ |
| **CATÉGORIES** |
| CRUD catégories | ❌ | ❌ | ❌ | ✅ |

---

## STATUTS DE COMMANDE

```
PENDING ──────► CONFIRMED ──────► PREPARING ──────► READY
    │               │                                  │
    │               │                                  │
    ▼               ▼                                  ▼
CANCELLED      CANCELLED                         IN_DELIVERY
                                                       │
                                                       │
                                                       ▼
                                                  DELIVERED
```

### Qui peut changer quel statut ?

| De → Vers | CLIENT | PRODUCER | DELIVERY | ADMIN |
|-----------|--------|----------|----------|-------|
| PENDING → CONFIRMED | ❌ | ❌ | ❌ | ✅ |
| PENDING → CANCELLED | ✅ | ❌ | ❌ | ✅ |
| CONFIRMED → PREPARING | ❌ | ✅ | ❌ | ✅ |
| CONFIRMED → CANCELLED | ❌ | ❌ | ❌ | ✅ |
| PREPARING → READY | ❌ | ✅ | ❌ | ✅ |
| READY → IN_DELIVERY | ❌ | ❌ | ✅ | ✅ |
| IN_DELIVERY → DELIVERED | ❌ | ❌ | ✅ | ✅ |

---

## STATUTS UTILISATEUR

| Statut | Description | Peut se connecter |
|--------|-------------|-------------------|
| PENDING | En attente de validation (producteurs) | ❌ |
| ACTIVE | Compte actif | ✅ |
| SUSPENDED | Compte suspendu par admin | ❌ |

---

## UNITÉS DE PRODUIT

| Code | Libellé | Exemple |
|------|---------|---------|
| KG | Kilogramme | Tomates 1500 FCFA/KG |
| GRAM | Gramme | Épices 500 FCFA/100g |
| UNIT | Unité | Avocat 200 FCFA/pièce |
| LITER | Litre | Huile de palme 2000 FCFA/L |
| TAS | Tas | Bananes 1000 FCFA/tas |
| BUNCH | Botte | Persil 500 FCFA/botte |

---

## MÉTHODES DE PAIEMENT

| Code | Libellé | Sprint |
|------|---------|--------|
| COD | Paiement à la livraison | Sprint 1 |
| MOBILE_MONEY | Orange Money / MTN MoMo | V2 |
| WALLET | Portefeuille Kibboutz | V2 |

---

## LÉGENDE PRIORITÉS

| Code | Signification |
|------|---------------|
| P0 | Indispensable - Sprint 1 |
| P1 | Important - Sprint 1 si temps |
| V2 | Version 2 - Après MVP |
