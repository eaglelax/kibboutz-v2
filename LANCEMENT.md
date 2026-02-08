# Commandes de Lancement - Kibboutz v2

## Prérequis

- Node.js 18+
- XAMPP avec MariaDB en cours d'exécution (C:/xampp/mysql/bin/mysql.exe)

---

## 1. Lancer MariaDB (XAMPP)

Ouvrir le panneau XAMPP et démarrer **MySQL**, ou :

```bash
C:\xampp\mysql\bin\mysqld.exe
```

---

## 2. Lancer l'API (Backend Express)

```bash
cd "C:\Users\JOACHIM\Documents\kibboutz v2\api"
npm run dev
```

L'API sera disponible sur : `http://localhost:3001`

---

## 3. Lancer l'application Mobile (Expo / React Native)

### Mode Web (navigateur)
```bash
cd "C:\Users\JOACHIM\Documents\kibboutz v2\mobile"
npx expo start --web
```
L'app sera disponible sur : `http://localhost:8081`

### Mode Android (émulateur)
```bash
cd "C:\Users\JOACHIM\Documents\kibboutz v2\mobile"
npx expo start --android
```

### Mode interactif (choix du device)
```bash
cd "C:\Users\JOACHIM\Documents\kibboutz v2\mobile"
npx expo start
```

Puis appuyer sur :
| Touche | Action |
|--------|--------|
| `w` | Ouvrir dans le navigateur web |
| `a` | Ouvrir sur émulateur Android |
| `r` | Recharger l'app |
| `j` | Ouvrir le debugger |

---

## 4. Lancer l'application Web (Next.js)

```bash
cd "C:\Users\JOACHIM\Documents\kibboutz v2\webapp"
npm run dev
```

---

## Synchroniser la base de données

### Pousser le schéma
```bash
cd "C:\Users\JOACHIM\Documents\kibboutz v2\api"
npx tsx src/db/push-schema.ts
```

### Insérer les données de test (seed)
```bash
cd "C:\Users\JOACHIM\Documents\kibboutz v2\api"
npm run db:seed
```

---

## Dépannage

### L'API ne démarre pas
- Vérifier que MariaDB est lancé via XAMPP
- Vérifier le fichier `.env` dans `/api`

### Erreur de connexion à l'API depuis le mobile
- Vérifier que l'API tourne sur le port 3001
- Sur émulateur Android, l'IP `10.0.2.2` pointe vers `localhost` du PC
- Sur le web, `localhost` est utilisé directement

### Erreur LATERAL JOIN / query crashes
- MariaDB 10.4 ne supporte pas LATERAL JOIN
- Ne pas utiliser `db.query.*.findMany({ with: {...} })` de Drizzle
- Utiliser `db.select().from().where()` avec des requêtes séparées
