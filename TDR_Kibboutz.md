# TERMES DE RÉFÉRENCE (TDR)
## Projet KIBBOUTZ - Plateforme d'Intermédiation Agroalimentaire

---

## 1. CONTEXTE ET JUSTIFICATION

### 1.1 Problématique

Dans le secteur agroalimentaire, les consommateurs urbains font face à des prix élevés dus à la multiplication des intermédiaires dans la chaîne de distribution. Chaque maillon (grossistes, transporteurs, détaillants) ajoute sa marge, augmentant significativement le prix final.

Parallèlement, les producteurs locaux peinent à écouler leurs stocks faute d'accès direct aux marchés urbains et dépendent d'intermédiaires qui réduisent leurs marges.

### 1.2 Solution proposée

**KIBBOUTZ** est une plateforme numérique d'intermédiation directe entre :
- **Les producteurs agricoles locaux** (fournisseurs)
- **Les consommateurs** (ménages et entreprises)

La plateforme élimine les intermédiaires traditionnels en centralisant l'offre et la demande, tout en assurant la logistique de livraison.

### 1.3 Proposition de valeur

| Pour les consommateurs | Pour les producteurs |
|------------------------|----------------------|
| Prix réduits (économies de 20-40%) | Accès direct à une large clientèle |
| Produits frais et locaux | Écoulement rapide des stocks |
| Livraison à domicile | Prix de vente justes |
| Traçabilité des produits | Visibilité accrue |

---

## 2. OBJECTIFS DU PROJET

### 2.1 Objectif général

Développer une plateforme numérique permettant aux consommateurs d'accéder à des produits agroalimentaires à prix producteur, tout en offrant aux agriculteurs locaux un canal de vente directe.

### 2.2 Objectifs spécifiques

1. Créer une base de données de producteurs locaux avec leurs catalogues produits
2. Permettre aux clients de passer des commandes en ligne
3. Gérer la logistique de livraison (fournisseur → client)
4. Assurer la traçabilité des commandes
5. Mettre en place un système de paiement sécurisé
6. Construire une architecture évolutive pour les extensions futures

### 2.3 Vision à long terme

- Extension vers d'autres secteurs (artisanat, services)
- Partenariats B2B (hôtels, restaurants, cantines)
- Programme de fidélité multi-niveaux (Silver, Gold, Diamant)
- Expansion géographique

---

## 3. PÉRIMÈTRE DU MVP (Minimum Viable Product)

### 3.1 Inclus dans le MVP

| Module | Fonctionnalités |
|--------|-----------------|
| **Gestion des utilisateurs** | Inscription, authentification, profils (client, producteur, admin, livreur) |
| **Catalogue produits** | Catégories agroalimentaires, fiches produits, stocks, prix |
| **Commandes** | Panier, validation, suivi de commande |
| **Livraison** | Attribution livreur, suivi GPS, confirmation livraison |
| **Paiements** | Intégration paiement mobile (Orange Money, MTN Money, etc.) |
| **Administration** | Dashboard, gestion utilisateurs, rapports |

### 3.2 Exclus du MVP (Version future)

- Programme de fidélité (cartes Silver, Gold, Diamant)
- Partenariats B2B (hôtels, restaurants)
- Système d'abonnement annuel
- Extension à d'autres domaines que l'agroalimentaire
- Marketplace multi-vendeurs avancée

---

## 4. SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES

### 4.1 Module Authentification & Utilisateurs

#### 4.1.1 Types d'utilisateurs

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **Client** | Consommateur (ménage ou entreprise) | Commander, payer, suivre, noter |
| **Producteur** | Fournisseur agricole | Gérer catalogue, voir commandes, valider stocks |
| **Livreur** | Agent de livraison | Voir missions, confirmer livraisons |
| **Admin** | Gestionnaire plateforme | Accès complet, validation, rapports |

#### 4.1.2 Fonctionnalités d'authentification

- **Inscription** : Email/téléphone, vérification OTP
- **Connexion** : Email/téléphone + mot de passe
- **Récupération mot de passe** : Par email ou SMS
- **Profil utilisateur** : Informations personnelles, adresses, historique
- **Vérification producteur** : Validation manuelle par admin (documents requis)

---

### 4.2 Module Catalogue Produits

#### 4.2.1 Structure des catégories (MVP - Agroalimentaire)

```
AGROALIMENTAIRE
├── Fruits
│   ├── Fruits tropicaux
│   ├── Agrumes
│   └── Fruits de saison
├── Légumes
│   ├── Légumes feuilles
│   ├── Légumes racines
│   └── Légumes fruits
├── Céréales & Tubercules
│   ├── Riz
│   ├── Maïs
│   ├── Manioc
│   └── Igname
├── Produits transformés
│   ├── Huiles
│   ├── Farines
│   └── Conserves artisanales
├── Produits d'élevage
│   ├── Volailles
│   ├── Oeufs
│   └── Produits laitiers
└── Épices & Condiments
```

#### 4.2.2 Fiche produit

| Champ | Type | Obligatoire |
|-------|------|-------------|
| Nom du produit | Texte | Oui |
| Description | Texte long | Oui |
| Catégorie | Sélection | Oui |
| Prix unitaire | Nombre | Oui |
| Unité de mesure | Sélection (kg, unité, litre, tas) | Oui |
| Quantité minimum | Nombre | Oui |
| Stock disponible | Nombre | Oui |
| Images | Fichiers (max 5) | Oui (min 1) |
| Origine/Localisation | Texte | Oui |
| Date de récolte/production | Date | Non |
| Certifications | Tags | Non |

#### 4.2.3 Fonctionnalités catalogue

- **Recherche** : Par nom, catégorie, producteur, localisation
- **Filtres** : Prix, disponibilité, distance, note producteur
- **Tri** : Prix croissant/décroissant, popularité, nouveautés
- **Favoris** : Sauvegarde de produits préférés

---

### 4.3 Module Commandes

#### 4.3.1 Processus de commande

```
[1. PANIER] → [2. ADRESSE] → [3. LIVRAISON] → [4. PAIEMENT] → [5. CONFIRMATION]
```

**Étape 1 - Panier**
- Ajout/suppression de produits
- Modification des quantités
- Calcul automatique du sous-total
- Vérification des stocks en temps réel

**Étape 2 - Adresse de livraison**
- Sélection adresse enregistrée
- Ajout nouvelle adresse
- Géolocalisation (optionnel)

**Étape 3 - Options de livraison**
- Livraison standard (J+2 à J+5)
- Livraison express (J+1) - supplément
- Point de retrait (si disponible)
- Créneau horaire préféré

**Étape 4 - Paiement**
- Mobile Money (Orange, MTN, Moov)
- Paiement à la livraison (COD)
- Portefeuille Kibboutz (solde rechargeable)

**Étape 5 - Confirmation**
- Récapitulatif de commande
- Numéro de commande unique
- Notification SMS/Email
- Estimation de livraison

#### 4.3.2 Statuts de commande

| Statut | Description | Notification |
|--------|-------------|--------------|
| `PENDING` | En attente de paiement | - |
| `PAID` | Paiement confirmé | Client + Producteur |
| `PREPARING` | En préparation chez le producteur | Client |
| `READY` | Prêt pour enlèvement | Livreur |
| `PICKED_UP` | Récupéré par le livreur | Client |
| `IN_TRANSIT` | En cours de livraison | Client (GPS) |
| `DELIVERED` | Livré | Client (demande de notation) |
| `CANCELLED` | Annulé | Tous |
| `REFUNDED` | Remboursé | Client |

#### 4.3.3 Gestion des commandes multi-producteurs

Une commande peut contenir des produits de plusieurs producteurs :
- Regroupement intelligent par zone géographique
- Attribution à un ou plusieurs livreurs
- Suivi unifié côté client

---

### 4.4 Module Livraison

#### 4.4.1 Workflow de livraison

```
PRODUCTEUR                    LIVREUR                      CLIENT
    │                            │                            │
    ├── Prépare commande         │                            │
    ├── Marque "Prêt" ──────────►│                            │
    │                            ├── Reçoit mission           │
    │                            ├── Accepte/Refuse           │
    │                            ├── Se rend chez producteur  │
    │◄── Confirme enlèvement ────┤                            │
    │                            ├── En route vers client ───►│
    │                            │                            ├── Suit en temps réel
    │                            ├── Arrive ─────────────────►│
    │                            │                            ├── Confirme réception
    │                            ├── Livraison confirmée      │
    │                            │                            ├── Note la livraison
```

#### 4.4.2 Fonctionnalités livreur

- **Dashboard missions** : Liste des livraisons assignées
- **Navigation GPS** : Itinéraire optimisé
- **Scan QR** : Confirmation d'enlèvement/livraison
- **Communication** : Chat/appel avec client
- **Historique** : Livraisons effectuées, gains

#### 4.4.3 Calcul des frais de livraison

```
Frais = Frais_base + (Distance × Tarif_km) + Supplément_express
```

| Paramètre | Valeur indicative |
|-----------|-------------------|
| Frais de base | 500 FCFA |
| Tarif par km | 100 FCFA/km |
| Supplément express | +50% |
| Livraison gratuite à partir de | 15 000 FCFA |

---

### 4.5 Module Paiements

#### 4.5.1 Méthodes de paiement MVP

| Méthode | Intégration | Frais |
|---------|-------------|-------|
| Orange Money | API Orange | ~1-2% |
| MTN Mobile Money | API MTN | ~1-2% |
| Paiement à la livraison | Interne | 0% |
| Portefeuille Kibboutz | Interne | 0% |

#### 4.5.2 Flux financier

```
CLIENT ──► KIBBOUTZ (Compte séquestre) ──► PRODUCTEUR (après livraison)
                      │
                      └──► LIVREUR (commission)
```

#### 4.5.3 Répartition des revenus

| Destinataire | Part |
|--------------|------|
| Producteur | Prix produit - Commission Kibboutz |
| Livreur | Frais de livraison - Commission Kibboutz |
| Kibboutz | Commission (5-10% sur produits + 10-15% sur livraison) |

---

### 4.6 Module Administration

#### 4.6.1 Dashboard principal

- **KPIs temps réel** :
  - Commandes du jour/semaine/mois
  - Chiffre d'affaires
  - Nombre d'utilisateurs actifs
  - Taux de conversion
  - Panier moyen

- **Alertes** :
  - Commandes en attente
  - Producteurs à valider
  - Litiges ouverts
  - Stocks critiques

#### 4.6.2 Gestion des utilisateurs

- Validation des producteurs (vérification documents)
- Suspension/activation de comptes
- Gestion des rôles et permissions
- Historique des actions

#### 4.6.3 Gestion des commandes

- Vue d'ensemble des commandes
- Filtres par statut, date, producteur, client
- Intervention manuelle (annulation, remboursement)
- Export des données

#### 4.6.4 Rapports et statistiques

- Rapport des ventes par période
- Performance des producteurs
- Performance des livreurs
- Analyse géographique
- Produits les plus vendus

---

### 4.7 Module Notifications

#### 4.7.1 Canaux de notification

| Canal | Usage |
|-------|-------|
| Push (App) | Alertes temps réel |
| SMS | Confirmations critiques |
| Email | Récapitulatifs, factures |
| In-App | Historique notifications |

#### 4.7.2 Types de notifications

**Client**
- Confirmation de commande
- Mise à jour statut commande
- Livreur en route
- Demande de notation
- Promotions (opt-in)

**Producteur**
- Nouvelle commande reçue
- Rappel préparation
- Paiement reçu
- Stock faible

**Livreur**
- Nouvelle mission disponible
- Rappel d'enlèvement
- Paiement commission

---

### 4.8 Module Évaluations & Avis

#### 4.8.1 Système de notation

- **Note produit** : 1-5 étoiles + commentaire
- **Note producteur** : Moyenne des notes produits + qualité service
- **Note livreur** : Ponctualité, état des produits, courtoisie

#### 4.8.2 Règles

- Notation possible uniquement après livraison confirmée
- Délai de notation : 7 jours après livraison
- Modération des commentaires (filtre automatique + manuel)

---

## 5. ARCHITECTURE TECHNIQUE

### 5.1 Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ App iOS  │  │ App And. │  │ Web App  │  │ Admin    │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼─────────────┼───────────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (REST API)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌────────▼────────┐   ┌──────▼──────┐
│ Auth Service  │   │ Core Service    │   │ Notif Svc   │
│ (JWT/OAuth)   │   │ (Business Logic)│   │ (Push/SMS)  │
└───────┬───────┘   └────────┬────────┘   └──────┬──────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   (Database)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
       │ Redis Cache │ │ S3/Minio  │ │ Elasticsearch│
       │             │ │ (Media)   │ │ (Search)  │
       └─────────────┘ └───────────┘ └───────────┘
```

### 5.2 Stack technique recommandée

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Mobile** | React Native / Flutter | Cross-platform, productivité |
| **Web** | React.js / Next.js | Performance, SEO |
| **API** | Node.js (NestJS) / Python (FastAPI) | Scalabilité, écosystème |
| **Base de données** | PostgreSQL | Robustesse, relations complexes |
| **Cache** | Redis | Performance, sessions |
| **Stockage fichiers** | AWS S3 / Minio | Scalabilité médias |
| **Recherche** | Elasticsearch | Recherche full-text |
| **Notifications Push** | Firebase Cloud Messaging | Standard marché |
| **SMS** | Twilio / Orange SMS API | Fiabilité |
| **Paiement** | API Mobile Money locales | Adaptation marché |

### 5.3 Modèle de données (Schéma simplifié)

```
┌──────────────────┐       ┌──────────────────┐
│      USERS       │       │   USER_PROFILES  │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │──────►│ user_id (FK)     │
│ email            │       │ type (enum)      │
│ phone            │       │ business_name    │
│ password_hash    │       │ documents        │
│ role             │       │ verified_at      │
│ status           │       │ rating           │
│ created_at       │       └──────────────────┘
└──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐       ┌──────────────────┐
│    ADDRESSES     │       │    CATEGORIES    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ user_id (FK)     │       │ name             │
│ label            │       │ parent_id (FK)   │◄──┐
│ street           │       │ icon             │   │
│ city             │       │ domain           │───┘
│ latitude         │       │ is_active        │
│ longitude        │       └──────────────────┘
│ is_default       │                │
└──────────────────┘                │ 1:N
                                    ▼
┌──────────────────┐       ┌──────────────────┐
│     PRODUCTS     │◄──────│  PRODUCT_IMAGES  │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ producer_id (FK) │       │ product_id (FK)  │
│ category_id (FK) │       │ url              │
│ name             │       │ is_primary       │
│ description      │       └──────────────────┘
│ price            │
│ unit             │
│ min_quantity     │
│ stock            │
│ origin           │
│ is_active        │
└──────────────────┘
         │
         │ N:M (via order_items)
         ▼
┌──────────────────┐       ┌──────────────────┐
│     ORDERS       │──────►│   ORDER_ITEMS    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ client_id (FK)   │       │ order_id (FK)    │
│ address_id (FK)  │       │ product_id (FK)  │
│ delivery_id (FK) │       │ quantity         │
│ status           │       │ unit_price       │
│ subtotal         │       │ subtotal         │
│ delivery_fee     │       └──────────────────┘
│ total            │
│ payment_method   │
│ payment_status   │
│ notes            │
│ created_at       │
└──────────────────┘
         │
         │ 1:1
         ▼
┌──────────────────┐       ┌──────────────────┐
│   DELIVERIES     │       │    PAYMENTS      │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ order_id (FK)    │       │ order_id (FK)    │
│ driver_id (FK)   │       │ amount           │
│ status           │       │ method           │
│ pickup_time      │       │ transaction_id   │
│ delivery_time    │       │ status           │
│ distance_km      │       │ provider_response│
│ fee              │       │ created_at       │
└──────────────────┘       └──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│    REVIEWS       │       │  NOTIFICATIONS   │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ user_id (FK)     │       │ user_id (FK)     │
│ target_type      │       │ type             │
│ target_id        │       │ title            │
│ rating           │       │ body             │
│ comment          │       │ data (JSON)      │
│ created_at       │       │ read_at          │
└──────────────────┘       │ created_at       │
                           └──────────────────┘

-- Tables préparées pour extensions futures --

┌──────────────────┐       ┌──────────────────┐
│   DOMAINS        │       │ LOYALTY_CARDS    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ name             │       │ user_id (FK)     │
│ slug             │       │ tier (enum)      │
│ is_active        │       │ valid_from       │
│ -- Future ext.-- │       │ valid_until      │
└──────────────────┘       │ discount_percent │
                           │ -- Future ext.-- │
┌──────────────────┐       └──────────────────┘
│   PARTNERS       │
├──────────────────┤
│ id (PK)          │
│ name             │
│ type (enum)      │
│ -- Future ext.-- │
└──────────────────┘
```

### 5.4 Considérations de sécurité

| Aspect | Mesure |
|--------|--------|
| Authentification | JWT avec refresh tokens, 2FA optionnel |
| Données sensibles | Chiffrement AES-256 au repos |
| API | HTTPS obligatoire, rate limiting |
| Paiements | Conformité PCI-DSS via providers |
| RGPD | Consentement explicite, droit à l'oubli |
| Injection SQL | ORM avec requêtes paramétrées |
| XSS | Sanitization des entrées, CSP headers |

---

## 6. INTERFACES UTILISATEUR (WIREFRAMES)

### 6.1 Application Client

#### Écrans principaux

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
│  │ Accueil │  │Catégorie│  │ Panier  │  │Commandes│  │ Profil│ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

ACCUEIL                    CATÉGORIES                 DÉTAIL PRODUIT
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ [Recherche...] 🔍│      │ ◄ Fruits         │      │ ◄ Tomates Bio    │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ Catégories       │      │ ┌──────┐┌──────┐ │      │ [  Image(s)    ] │
│ ┌──┐┌──┐┌──┐┌──┐ │      │ │Mangue││Papaye│ │      │                  │
│ │🍎││🥬││🌾││🧈│ │      │ │2500F ││1800F │ │      │ Producteur: xxx  │
│ └──┘└──┘└──┘└──┘ │      │ └──────┘└──────┘ │      │ Origine: xxx     │
├──────────────────┤      │ ┌──────┐┌──────┐ │      │ Prix: 2500 F/kg  │
│ Populaires       │      │ │Ananas││Orange│ │      │                  │
│ ┌────────────┐   │      │ │3000F ││2000F │ │      │ [- ] 2 kg [+ ]   │
│ │ Tomates    │   │      │ └──────┘└──────┘ │      │                  │
│ │ 1500F/kg ⭐4.5│ │      │                  │      │ Total: 5000 F    │
│ └────────────┘   │      │                  │      │                  │
│ ┌────────────┐   │      │                  │      │ [Ajouter panier] │
│ │ Oignons    │   │      │                  │      └──────────────────┘
│ │ 800F/kg ⭐4.2│  │      │                  │
│ └────────────┘   │      │                  │
└──────────────────┘      └──────────────────┘

PANIER                     CHECKOUT                   SUIVI COMMANDE
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ ◄ Mon Panier (3) │      │ ◄ Paiement       │      │ ◄ Commande #1234 │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ ┌──────────────┐ │      │ Adresse          │      │ Statut: En route │
│ │🍅 Tomates 2kg│ │      │ ┌──────────────┐ │      │ ────●────○────○  │
│ │    3000F [x] │ │      │ │ 📍 Maison    │ │      │ Préparé Enlevé   │
│ └──────────────┘ │      │ │ Rue xxx...   │ │      │                  │
│ ┌──────────────┐ │      │ └──────────────┘ │      │ Livreur: Jean    │
│ │🧅 Oignons 1kg│ │      │                  │      │ 📞 +xxx          │
│ │    800F  [x] │ │      │ Mode paiement    │      │                  │
│ └──────────────┘ │      │ ○ Orange Money   │      │ [Voir sur carte] │
│                  │      │ ● MTN Money      │      │                  │
│ Sous-total: 3800F│      │ ○ À la livraison │      │ ┌──────────────┐ │
│ Livraison: 500F  │      │                  │      │ │   [CARTE]    │ │
│ ──────────────── │      │ Total: 4300F     │      │ │   📍 ───     │ │
│ Total: 4300F     │      │                  │      │ │      🚗     │ │
│                  │      │ [Confirmer]      │      │ └──────────────┘ │
│ [Commander]      │      └──────────────────┘      └──────────────────┘
└──────────────────┘
```

### 6.2 Application Producteur

```
DASHBOARD                  MES PRODUITS               COMMANDES
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ Bonjour, Ferme X │      │ ◄ Mes Produits   │      │ ◄ Commandes      │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ ┌──────────────┐ │      │ [+ Ajouter]      │      │ Nouvelles (3)    │
│ │ Ventes jour  │ │      │                  │      │ ┌──────────────┐ │
│ │   25,000 F   │ │      │ ┌──────────────┐ │      │ │ #1234        │ │
│ └──────────────┘ │      │ │🍅 Tomates    │ │      │ │ 3 articles   │ │
│ ┌──────────────┐ │      │ │ 1500F/kg     │ │      │ │ 5800F        │ │
│ │ Commandes    │ │      │ │ Stock: 50kg  │ │      │ │ [Préparer]   │ │
│ │   12 en att. │ │      │ │ [Modifier]   │ │      │ └──────────────┘ │
│ └──────────────┘ │      │ └──────────────┘ │      │                  │
│ ┌──────────────┐ │      │ ┌──────────────┐ │      │ En préparation   │
│ │ Note moyenne │ │      │ │🧅 Oignons    │ │      │ ┌──────────────┐ │
│ │   ⭐ 4.6     │ │      │ │ 800F/kg      │ │      │ │ #1230        │ │
│ └──────────────┘ │      │ │ Stock: 100kg │ │      │ │ [Prêt ✓]     │ │
│                  │      │ │ [Modifier]   │ │      │ └──────────────┘ │
│ [Voir commandes] │      │ └──────────────┘ │      │                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

### 6.3 Application Livreur

```
MISSIONS                   DÉTAIL MISSION             NAVIGATION
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ Mes Missions     │      │ ◄ Mission #1234  │      │ ◄ Navigation     │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ Disponibles (5)  │      │ ENLÈVEMENT       │      │ ┌──────────────┐ │
│ ┌──────────────┐ │      │ 📍 Ferme Dubois  │      │ │              │ │
│ │ Ferme X → Y  │ │      │ Quartier xxx     │      │ │    [MAP]     │ │
│ │ 3.5 km       │ │      │ 📞 +xxx          │      │ │      🚗     │ │
│ │ 1500F        │ │      │                  │      │ │       ↓      │ │
│ │ [Accepter]   │ │      │ LIVRAISON        │      │ │      📍      │ │
│ └──────────────┘ │      │ 📍 M. Kouame     │      │ │              │ │
│ ┌──────────────┐ │      │ Rue xxx          │      │ └──────────────┘ │
│ │ Centre → Z   │ │      │ 📞 +xxx          │      │                  │
│ │ 5.2 km       │ │      │                  │      │ Distance: 2.3 km │
│ │ 2000F        │ │      │ Articles:        │      │ Temps: ~8 min    │
│ │ [Accepter]   │ │      │ - Tomates 2kg    │      │                  │
│ └──────────────┘ │      │ - Oignons 1kg    │      │ [Arrivé]         │
│                  │      │                  │      │                  │
│ En cours (1)     │      │ [Scanner QR]     │      │                  │
│ ┌──────────────┐ │      │ [Appeler client] │      │                  │
│ │ #1234 ▶      │ │      └──────────────────┘      └──────────────────┘
│ └──────────────┘ │
└──────────────────┘
```

---

## 7. PLANNING PRÉVISIONNEL

### 7.1 Phases du projet

| Phase | Durée | Livrables |
|-------|-------|-----------|
| **Phase 1 - Conception** | 4-6 semaines | Maquettes validées, architecture technique, BDD |
| **Phase 2 - Développement Core** | 10-12 semaines | Backend API, Auth, Catalogue, Commandes |
| **Phase 3 - Applications mobiles** | 8-10 semaines | Apps iOS/Android (Client, Producteur, Livreur) |
| **Phase 4 - Intégrations** | 4-6 semaines | Paiements, Notifications, Maps |
| **Phase 5 - Tests & QA** | 4 semaines | Tests unitaires, intégration, UAT |
| **Phase 6 - Déploiement** | 2 semaines | Mise en production, formation |

### 7.2 Jalons clés

| Jalon | Critère de validation |
|-------|----------------------|
| M1 - Architecture validée | Design technique approuvé |
| M2 - Backend fonctionnel | API testable sur environnement de dev |
| M3 - Apps alpha | Parcours complet testable |
| M4 - Paiements intégrés | Transaction bout-en-bout |
| M5 - Beta fermée | Tests avec utilisateurs pilotes |
| M6 - Lancement MVP | Mise en production |

---

## 8. RESSOURCES NÉCESSAIRES

### 8.1 Équipe projet

| Rôle | Profil | Quantité |
|------|--------|----------|
| Chef de projet | Expérience gestion projets tech | 1 |
| Product Owner | Connaissance métier agroalimentaire | 1 |
| Développeur Backend Senior | Node.js/Python, PostgreSQL, APIs | 1 |
| Développeur Backend Junior | Support développement | 1 |
| Développeur Mobile | React Native/Flutter | 2 |
| Développeur Frontend | React.js, responsive | 1 |
| Designer UI/UX | Expérience apps mobiles | 1 |
| DevOps | CI/CD, Cloud, monitoring | 1 (temps partiel) |
| QA/Testeur | Tests manuels et automatisés | 1 |

### 8.2 Infrastructure

| Élément | Spécification | Coût mensuel estimé |
|---------|---------------|---------------------|
| Serveur application | 4 vCPU, 8GB RAM | 50-100 USD |
| Base de données | PostgreSQL managé | 30-50 USD |
| Stockage fichiers | 100 GB | 10-20 USD |
| CDN | Distribution médias | 20-30 USD |
| Services tiers | SMS, Push, Maps | 50-100 USD |
| **Total infrastructure** | | **160-300 USD/mois** |

### 8.3 Outils

| Catégorie | Outil recommandé |
|-----------|------------------|
| Gestion projet | Jira / Trello / Notion |
| Design | Figma |
| Versioning | Git (GitHub/GitLab) |
| CI/CD | GitHub Actions / GitLab CI |
| Monitoring | Sentry, New Relic |
| Communication | Slack / Discord |

---

## 9. RISQUES ET MITIGATIONS

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Adoption faible des producteurs | Moyenne | Élevé | Programme d'onboarding, formation terrain |
| Problèmes d'intégration paiement | Moyenne | Élevé | Tests précoces, solutions de backup |
| Qualité variable des produits | Moyenne | Moyen | Système de notation, contrôle qualité |
| Logistique défaillante | Moyenne | Élevé | Partenariat transporteurs, livreurs backup |
| Sécurité données | Faible | Élevé | Audit sécurité, conformité RGPD |
| Dépassement budget | Moyenne | Moyen | Suivi hebdomadaire, priorisation MVP |

---

## 10. CRITÈRES DE SUCCÈS MVP

### 10.1 KPIs de lancement (6 mois post-lancement)

| Indicateur | Objectif |
|------------|----------|
| Producteurs inscrits | 50+ |
| Clients actifs | 500+ |
| Commandes/mois | 200+ |
| Panier moyen | 10,000+ FCFA |
| Taux de satisfaction | > 4/5 |
| Taux de rétention (M3) | > 30% |

### 10.2 Critères d'acceptation technique

- [ ] Temps de réponse API < 500ms
- [ ] Disponibilité > 99%
- [ ] Zéro faille de sécurité critique
- [ ] App store rating > 4.0
- [ ] Crash rate < 1%

---

## 11. EXTENSIONS FUTURES (POST-MVP)

### 11.1 Programme de fidélité

| Carte | Prix annuel | Réduction | Avantages |
|-------|-------------|-----------|-----------|
| **Silver** | 10,000 FCFA | 5% | Livraison prioritaire |
| **Gold** | 25,000 FCFA | 10% | + Accès ventes flash |
| **Diamant** | 50,000 FCFA | 15% | + Accès partenaires |

### 11.2 Partenariats B2B

- Hôtels et restaurants
- Cantines d'entreprises
- Traiteurs événementiels
- Supermarchés locaux

### 11.3 Nouveaux domaines

- Artisanat local
- Produits cosmétiques naturels
- Services à domicile

---

## 12. ANNEXES

### Annexe A - Glossaire

| Terme | Définition |
|-------|------------|
| MVP | Minimum Viable Product - Version minimale fonctionnelle |
| COD | Cash On Delivery - Paiement à la livraison |
| OTP | One-Time Password - Code à usage unique |
| KPI | Key Performance Indicator - Indicateur clé de performance |
| UAT | User Acceptance Testing - Tests d'acceptation utilisateur |

### Annexe B - Références

- Étude de marché agroalimentaire local
- Benchmark concurrents (Jumia Food, Glovo, etc.)
- Documentation APIs Mobile Money

---

**Document rédigé le** : 29 janvier 2026
**Version** : 1.0
**Statut** : Draft pour validation

---

*Ce document constitue les termes de référence du projet KIBBOUTZ. Il doit être validé par les parties prenantes avant le démarrage des travaux.*
