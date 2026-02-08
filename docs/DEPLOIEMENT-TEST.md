# Deploiement pour Tests avec Amis

## Architecture

```
Telephones (APK)  →  API (Render, gratuit)  →  MySQL (Railway, gratuit)
```

---

## Etape 1 : Base de donnees MySQL sur Railway

1. Creer un compte sur https://railway.app (connexion via GitHub)
2. New Project → Provision MySQL
3. Recuperer les identifiants dans l'onglet **Variables** :
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
4. Construire l'URL de connexion :
   ```
   mysql://USER:PASSWORD@HOST:PORT/DATABASE
   ```

### Pousser le schema et les donnees

```bash
cd "C:\Users\JOACHIM\Documents\kibboutz v2\api"

# Mettre a jour le .env avec l'URL Railway
# DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE

# Pousser le schema
npx tsx src/db/push-schema.ts

# Inserer les donnees de test
npm run db:seed
```

---

## Etape 2 : API Express sur Render

1. Creer un compte sur https://render.com
2. Pousser le code API sur un repo GitHub (si pas deja fait)
3. New → Web Service → connecter le repo
4. Configuration :
   - **Runtime** : Node
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Plan** : Free
5. Ajouter les **variables d'environnement** :
   - `DATABASE_URL` = URL Railway (etape 1)
   - `JWT_SECRET` = (meme valeur que le .env local)
   - `PORT` = 3001
6. Deployer → noter l'URL (ex: `https://kibboutz-api.onrender.com`)

---

## Etape 3 : Mettre a jour l'URL API dans l'app mobile

Dans `mobile/src/constants/index.ts`, ajouter l'URL de production :

```typescript
// Pour les tests en ligne
export const API_URL = 'https://kibboutz-api.onrender.com';

// Ancien (local)
// export const API_URL = Platform.select({
//   web: 'http://localhost:3001',
//   android: 'http://10.0.2.2:3001',
//   default: 'http://localhost:3001',
// });
```

---

## Etape 4 : Generer l'APK avec EAS Build

### Premiere fois : configuration

```bash
cd "C:\Users\JOACHIM\Documents\kibboutz v2\mobile"

# Installer EAS CLI
npm install -g eas-cli

# Se connecter a Expo
eas login

# Configurer le projet
eas build:configure
```

### Ajouter un profil "preview" dans eas.json

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {}
    }
  }
}
```

### Lancer le build APK

```bash
eas build --platform android --profile preview
```

Le build prend ~10-15 minutes. Une fois termine, un lien de telechargement est fourni.

---

## Etape 5 : Distribuer aux amis

1. Telecharger l'APK depuis le lien EAS
2. Envoyer le fichier .apk par :
   - WhatsApp
   - Google Drive
   - Lien direct EAS
3. Les amis installent l'APK (activer "Sources inconnues" sur Android)

---

## Comptes de test

| Role | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@kibboutz.com | admin123 |
| Client | client@kibboutz.com | client123 |
| Producteur | producteur@kibboutz.com | producteur123 |
| Livreur | livreur@kibboutz.com | livreur123 |

---

## Limites des plans gratuits

| Service | Limite |
|---------|--------|
| Railway | 5$/mois de credits gratuits, suffisant pour les tests |
| Render | Spin-down apres 15 min d'inactivite (premier chargement lent ~30s) |
| EAS Build | 30 builds/mois sur le plan gratuit |

---

## Depannage

### L'API met du temps a repondre (premiere requete)
- Normal sur Render gratuit : le serveur se met en veille apres 15 min d'inactivite
- La premiere requete prend ~30 secondes, ensuite c'est rapide

### Les amis ne peuvent pas installer l'APK
- Android : Parametres → Securite → Activer "Sources inconnues"
- Certains telephones : chercher "Installer des apps inconnues" dans les parametres

### Erreur de connexion a l'API
- Verifier que l'URL dans l'app pointe bien vers Render
- Verifier que l'API est bien deployee sur Render (dashboard)
- Verifier les variables d'environnement sur Render
