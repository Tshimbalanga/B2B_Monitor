# 📊 Documentation Base de Données - Monitoring B2B

## 🎯 Vue d'ensemble

Cette base de données est conçue pour gérer un système complet de monitoring B2B incluant :
- Gestion des utilisateurs et permissions
- Gestion des clients et connexions
- Gestion des incidents/tickets
- Gestion des spares parts
- Facturation
- Suivi FME
- Monitoring de disponibilité

## 🗂️ Structure des Tables

### 👥 **1. Gestion des Utilisateurs**

#### `users`
**Description :** Table principale des utilisateurs du système
```sql
- id : Identifiant unique
- username : Nom d'utilisateur (unique)
- password : Mot de passe hashé
- name : Nom complet
- email : Email (unique)
- role : Rôle utilisateur (admin, super_admin, commercial, project, maintenance, noc, sav, fme, bo, client)
- sub_department : Sous-département
- manager_email : Email du manager
- phone : Téléphone
- is_active : Statut actif/inactif
```

#### `clients`
**Description :** Table des clients B2B
```sql
- id : Identifiant unique
- name : Nom du client
- email, phone : Coordonnées
- address : Adresse complète
- region, city : Localisation
- contact_person : Personne de contact
- contract_number : Numéro de contrat
- contract_start_date, contract_end_date : Dates du contrat
- status : Statut (active, inactive, suspended)
```

### 🔗 **2. Gestion des Connexions**

#### `connections`
**Description :** Table des connexions/liaisons clients
```sql
- id : Identifiant unique
- connection_id : ID de connexion (CONN-001, etc.)
- client_id : Référence vers le client
- connection_type : Type (fiber, radio, satellite, ethernet)
- bandwidth : Bande passante
- ip_address : Adresse IP
- location : Localisation
- region, city : Région et ville
- status : Statut (active, inactive, maintenance, deactivated)
- assigned_to : Assigné à quel équipe
- installation_date : Date d'installation
- last_maintenance_date : Dernière maintenance
```

#### `connection_requests`
**Description :** Demandes de nouvelles connexions
```sql
- request_id : ID de demande (REQ-001, etc.)
- client_id : Client demandeur
- requester_id : Utilisateur demandeur
- connection_type, bandwidth : Type et bande passante
- location, region, city : Localisation
- priority : Priorité (low, medium, high, critical)
- status : Statut (pending, approved, rejected, in_progress, completed)
- reason : Raison de la demande
- expected_delivery_date : Date de livraison attendue
```

#### `deactivation_requests`
**Description :** Demandes de désactivation de connexions
```sql
- request_id : ID de demande de désactivation
- connection_id : Connexion à désactiver
- requester_id : Demandeur
- reason : Raison de la désactivation
- deactivation_date : Date de désactivation
- priority : Priorité
- technical_details : Détails techniques
- status : Statut (pending, validated, rejected, completed)
```

#### `deactivation_validation_steps`
**Description :** Étapes de validation des désactivations
```sql
- deactivation_request_id : Référence vers la demande
- step_name : Nom de l'étape
- validator_role : Rôle du validateur
- status : Statut (pending, approved, rejected)
- validator_id : ID du validateur
- validation_date : Date de validation
- comments : Commentaires
```

### 🎫 **3. Gestion des Incidents/Tickets**

#### `incidents`
**Description :** Table principale des incidents/tickets
```sql
- id : Identifiant unique
- ticket_id : ID du ticket (TKT-001, etc.)
- connection_id : Connexion concernée
- reported_by : Signalé par
- assigned_to : Assigné à
- title : Titre du ticket
- description : Description
- ticket_type : Type (degradation, unavailability, information_request)
- priority, severity : Priorité et sévérité
- status : Statut (open, acknowledged, in_progress, resolved, closed, reopened)
- screenshot_path : Chemin vers la capture d'écran
```

#### `ticket_lifecycle`
**Description :** Cycle de vie des tickets
```sql
- incident_id : Référence vers l'incident
- status : Statut à ce moment
- changed_by : Qui a changé le statut
- changed_at : Quand le changement a eu lieu
- comments : Commentaires
- gps_latitude, gps_longitude : Coordonnées GPS
- gps_address : Adresse GPS
```

#### `ticket_processing`
**Description :** Traitement des tickets
```sql
- incident_id : Référence vers l'incident
- processor_id : Qui traite
- root_cause : Cause racine
- action_taken : Action prise
- intervention_images : Images d'intervention (JSON)
- gps_latitude, gps_longitude : Coordonnées GPS
- gps_address : Adresse GPS
- processed_at : Date de traitement
```

#### `ticket_resolution`
**Description :** Résolution des tickets
```sql
- incident_id : Référence vers l'incident
- resolver_id : Qui résout
- cause : Cause
- solution : Solution
- resolution_images : Images de résolution (JSON)
- resolved_at : Date de résolution
```

#### `ticket_comments`
**Description :** Commentaires sur les tickets
```sql
- incident_id : Référence vers l'incident
- commenter_id : Qui commente
- comment : Commentaire
- created_at : Date de création
```

### 🔧 **4. Gestion des Spares Parts**

#### `spare_parts`
**Description :** Table des équipements/spares parts
```sql
- id : Identifiant unique
- part_id : ID de la pièce (SP-001, etc.)
- name : Nom de l'équipement
- description : Description
- category : Catégorie
- unit : Unité de mesure
- min_stock, max_stock, current_stock : Gestion des stocks
- unit_price : Prix unitaire
- region, city, warehouse : Localisation
- supplier : Fournisseur
- status : Statut (available, low_stock, out_of_stock)
- last_updated : Dernière mise à jour
```

#### `spare_part_transactions`
**Description :** Transactions de spares parts
```sql
- id : Identifiant unique
- transaction_id : ID de transaction (TR-001, etc.)
- spare_part_id : Référence vers la pièce
- type : Type (in, out)
- quantity : Quantité
- requester_id : Demandeur
- requester_role : Rôle du demandeur
- requester_manager : Manager du demandeur
- reason : Raison
- region, city : Localisation
- status : Statut (pending, approved, rejected, completed)
- request_date : Date de demande
- approval_date : Date d'approbation
- approved_by : Approuvé par
- approved_by_role : Rôle de l'approbateur
- comments : Commentaires
```

#### `spare_part_locations`
**Description :** Localisations des spares parts
```sql
- spare_part_id : Référence vers la pièce
- region, city, warehouse : Localisation
- quantity : Quantité à cette localisation
```

### 💰 **5. Facturation**

#### `invoices`
**Description :** Table des factures
```sql
- id : Identifiant unique
- invoice_number : Numéro de facture
- client_id : Client
- connection_id : Connexion facturée
- amount : Montant
- currency : Devise (USD par défaut)
- billing_period : Période de facturation
- due_date : Date d'échéance
- status : Statut (pending, paid, overdue, cancelled)
- payment_method : Méthode de paiement
- payment_date : Date de paiement
- attachment_path : Chemin vers la pièce jointe
- notes : Notes
- created_by : Créé par
```

### 📍 **6. Suivi FME**

#### `fme_tracking`
**Description :** Suivi des FME (techniciens)
```sql
- id : Identifiant unique
- fme_id : Référence vers l'utilisateur FME
- incident_id : Incident en cours
- latitude, longitude : Coordonnées GPS
- address : Adresse
- status : Statut (available, busy, offline)
- current_ticket_id : Ticket en cours
- tracked_at : Date de suivi
```

### 📊 **7. Monitoring Global**

#### `client_availability`
**Description :** Données de disponibilité des clients
```sql
- id : Identifiant unique
- client_id : Client
- connection_id : Connexion
- date : Date
- hour : Heure (0-23)
- uplink_percentage : Pourcentage uplink
- downlink_percentage : Pourcentage downlink
- uplink_traffic_gbps : Trafic uplink en Gbps
- downlink_traffic_gbps : Trafic downlink en Gbps
- status : Statut (available, degraded, unavailable)
```

### ⚙️ **8. Configuration et Logs**

#### `system_config`
**Description :** Configuration du système
```sql
- config_key : Clé de configuration
- config_value : Valeur
- description : Description
```

#### `activity_logs`
**Description :** Logs d'activité
```sql
- user_id : Utilisateur
- action : Action effectuée
- table_name : Table concernée
- record_id : ID de l'enregistrement
- old_values, new_values : Anciennes et nouvelles valeurs (JSON)
- ip_address : Adresse IP
- user_agent : User agent
```

## 🔗 Relations entre les Tables

### Relations Principales :
1. **users** ↔ **clients** : Via les rôles et permissions
2. **clients** → **connections** : Un client peut avoir plusieurs connexions
3. **connections** → **incidents** : Une connexion peut avoir plusieurs incidents
4. **incidents** → **ticket_lifecycle** : Un incident a un cycle de vie
5. **spare_parts** → **spare_part_transactions** : Une pièce peut avoir plusieurs transactions
6. **users** → **fme_tracking** : Un utilisateur FME peut être suivi

### Contraintes de Clés Étrangères :
- Toutes les relations sont définies avec `ON DELETE CASCADE` ou `ON DELETE SET NULL`
- Les IDs uniques sont générés automatiquement
- Les statuts sont contrôlés par des ENUMs

## 📈 Optimisations

### Index Créés :
- Index sur les rôles utilisateurs
- Index sur les statuts des connexions
- Index sur les dates d'incidents
- Index sur les catégories de spares parts
- Index sur les dates de monitoring

### Triggers :
- **update_spare_part_status** : Met à jour automatiquement le statut des spares parts
- **update_spare_part_last_updated** : Met à jour la date de dernière modification

### Vues Utiles :
- **spare_parts_dashboard** : Vue pour le dashboard des spares parts
- **incidents_with_details** : Incidents avec détails clients
- **transactions_with_details** : Transactions avec détails

## 🔐 Sécurité

### Chiffrement :
- Les mots de passe sont hashés (bcrypt)
- Les données sensibles peuvent être chiffrées

### Permissions :
- Contrôle d'accès basé sur les rôles
- Logs d'activité pour audit
- Validation des données

## 📊 Utilisation Recommandée

### Requêtes Fréquentes :
```sql
-- Dashboard des incidents
SELECT status, COUNT(*) FROM incidents GROUP BY status;

-- Spares parts en stock faible
SELECT * FROM spare_parts WHERE status = 'low_stock';

-- Transactions en attente
SELECT * FROM spare_part_transactions WHERE status = 'pending';

-- Disponibilité client
SELECT * FROM client_availability WHERE date = CURDATE();
```

### Maintenance :
- Sauvegarde quotidienne
- Nettoyage des logs anciens
- Optimisation des index
- Monitoring des performances

## 🚀 Déploiement

### Prérequis :
- MySQL 8.0+ ou MariaDB 10.5+
- InnoDB engine
- UTF8MB4 charset

### Installation :
1. Créer la base de données
2. Exécuter le script SQL
3. Configurer les utilisateurs
4. Tester les connexions

### Configuration :
- Ajuster les paramètres selon l'environnement
- Configurer les sauvegardes
- Mettre en place le monitoring
