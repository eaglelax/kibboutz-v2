# Comptes d'accès - Kibboutz v2

## Comptes de test

| Role | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@kibboutz.com | admin123 |
| Client | client@kibboutz.com | client123 |
| Producteur | producteur@kibboutz.com | producteur123 |
| Livreur | livreur@kibboutz.com | livreur123 |
| Client 2 | client2@kibboutz.com | client123 |

---

## Base de données

| Paramètre | Valeur |
|-----------|--------|
| Type | MariaDB 10.4 (XAMPP) |
| Hôte | localhost |
| Port | 3306 |
| Utilisateur | root |
| Mot de passe | *(vide)* |
| Base | kibboutz |

---

## URLs

| Service | URL |
|---------|-----|
| API Backend | http://localhost:3001 |
| App Mobile (web) | http://localhost:8081 |
| API depuis émulateur Android | http://10.0.2.2:3001 |

---

## API - Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/login | Connexion |
| POST | /api/auth/register | Inscription |
| GET | /api/products | Liste des produits |
| GET | /api/categories | Liste des catégories |
| GET | /api/cart | Panier de l'utilisateur |
| POST | /api/cart | Ajouter au panier |
| GET | /api/orders | Commandes de l'utilisateur |
| POST | /api/orders | Créer une commande |
