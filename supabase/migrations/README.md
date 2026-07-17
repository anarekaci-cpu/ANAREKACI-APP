# Migrations Supabase

Ce dossier contient les scripts SQL pour créer les tables nécessaires aux nouvelles fonctionnalités de l'application ANAREKA-CI.

## Instructions d'installation

1. Connectez-vous à votre dashboard Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans l'éditeur SQL (SQL Editor) dans le menu de gauche
4. Exécutez les scripts dans l'ordre suivant :

### 1. Mise à jour des rôles
Exécutez d'abord `update_role_column.sql` pour ajouter les nouveaux rôles (trésorier, secrtaire, bureau).

```sql
-- Ce script crée un type enum avec les nouveaux rôles
-- et met à jour la colonne role de la table membres
```

### 2. Tables de messagerie
Exécutez `create_messaging_tables.sql` pour créer les tables du système de messagerie interne.

```sql
-- Crée les tables : conversations, conversation_participants, messages
```

### 3. Table de notifications
Exécutez `create_notifications_table.sql` pour créer la table des notifications.

```sql
-- Crée la table : notifications
```

### 4. Table des événements
Exécutez `create_events_table.sql` pour créer la table de gestion des événements.

```sql
-- Crée la table : evenements
```

## Vérification

Après avoir exécuté toutes les migrations, vous pouvez vérifier que les tables ont été créées correctement en allant dans le "Table Editor" de Supabase.

## Notes importantes

- Les scripts incluent des index pour optimiser les performances
- Les contraintes de clés étrangères assurent l'intégrité des données
- Les tables sont configurées avec des valeurs par défaut appropriées
