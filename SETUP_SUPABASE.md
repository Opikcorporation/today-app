# Configuration Supabase - Guide Complet

## 1. Tables déjà créées ✅
Tu dois avoir exécuté `supabase_schema.sql` dans ton projet Supabase. Si ce n'est pas fait:
- Ouvre ton Dashboard Supabase
- Aller à SQL Editor → New query
- Copie tout le contenu de `supabase_schema.sql` (dans le repo)
- Exécute la requête
- Tu dois voir les tables `users`, `entries`, `todos`, `prayers`, `shortcuts`, `notes`, `settings` dans Table Editor

## 2. Activer RLS (Row Level Security) et Policies

TRÈS IMPORTANT: Tu dois exécuter le SQL pour activer RLS et créer les policies. Sans cela, les données seront accessibles à tous.

**Instructions:**
1. Ouvre Supabase Dashboard → SQL Editor → New query
2. Copie **tout** le contenu du fichier `supabase_policies.sql` (dans le repo)
3. Colle dans l'éditeur SQL
4. Clique "Run"
5. Attends que tout exécute sans erreur

**Le cast `auth.uid()::text` est IMPORTANT** — c'est ce qui évite l'erreur "operator does not exist: text = uuid"

Après exécution, tu devrais voir:
- Dans Table Editor > clique sur `users`: "Row level security: Enabled"
- Dans l'onglet "Policies": tu dois voir les policies listées (users_select_own, users_insert_self, etc.)

## 3. Vérifications finales

✅ Tables créées (users, entries, todos, prayers, shortcuts, notes, settings)
✅ RLS activé sur chaque table
✅ Policies créées avec `auth.uid()::text`

Si tout est vert, tu es bon pour tester l'app!

## 4. Si tu utilises TON projet Supabase

Si tu as ton propre projet (pas `ziapxta...`):
1. Récupère l'URL et ANON KEY dans Supabase Dashboard → Settings → API
2. Ouvre `index.html` ligne 13 et 14:
```javascript
const SUPABASE_URL = 'https://ton-projet.supabase.co';
const SUPABASE_ANON_KEY = 'ta_clé_anon_ici';
```
3. Remplace par tes valeurs
4. Recharge la page dans le navigateur

## 5. Test local

```bash
cd ~/Desktop/today
python3 -m http.server 8080 &
open http://localhost:8080
```

**À faire dans l'app:**
1. Clique "S'inscrire"
2. Entre un email + mot de passe (ex: test@example.com / password123)
3. Après inscription, tu dois être automatiquement connecté
4. Ouvre la console DevTools (F12) et cherche les logs:
   - "🔥 initial session user: <email>" → connexion OK
   - "📥 downloadDataFromSupabase started for userId: <id>" → sync lancée
   - "✅ downloadDataFromSupabase completed" → sync terminée
5. Crée une note/entrée:
   - Écris quelque chose dans le champ "Ajoute une note"
   - Appuie sur Entrée
   - La note doit s'afficher et se sauvegarder
6. Vérifie dans Supabase Dashboard → Table Editor → `notes`:
   - Tu dois voir ta note avec `user_id = <ton_id>`

## 6. Dépannage

**Problème: Rien ne s'affiche dans l'app**
- Ouvre Console DevTools (F12)
- Cherche les erreurs rouges
- Vérifie que RLS est activé et les policies sont créées
- Vérifie que les tables existent

**Problème: "permission denied" / "policy violation"**
- Vérifie que RLS est **activé** (ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
- Vérifie que les policies contiennent `auth.uid()::text` (avec le cast!)
- Reconnecte-toi (logout/login) pour régénérer le JWT

**Problème: L'app crée un compte mais affiche vide après**
- Attends 2-3 secondes (sync en arrière-plan)
- Recharge la page (F5)
- Vérifie les logs Console DevTools

## 7. Sécurité

⚠️ **NE METS JAMAIS** la `service_role` key dans `index.html`. Seule la `anon` key va dans le client.

✅ Les RLS policies garantissent que chaque utilisateur ne voit que ses propres données.

Fin du setup! Dis-moi si tu rencontres des erreurs.
