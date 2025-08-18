-- =====================================================
-- REQUÊTES SQL PRINCIPALES - MONITORING B2B
-- =====================================================

-- =====================================================
-- 1. GESTION DES UTILISATEURS
-- =====================================================

-- Créer un nouvel utilisateur
INSERT INTO users (user_id, username, password, name, email, role, department, sub_department, manager_email, phone) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer tous les utilisateurs
SELECT * FROM users WHERE is_active = TRUE ORDER BY name;

-- Récupérer les utilisateurs par rôle
SELECT * FROM users WHERE role = ? AND is_active = TRUE;

-- Récupérer les utilisateurs par sous-département
SELECT * FROM users WHERE sub_department = ? AND is_active = TRUE;

-- Mettre à jour un utilisateur
UPDATE users SET 
    name = ?, 
    email = ?, 
    role = ?, 
    department = ?, 
    sub_department = ?, 
    manager_email = ?, 
    phone = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Désactiver un utilisateur
UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- Authentifier un utilisateur
SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ? AND is_active = TRUE;

-- =====================================================
-- 2. GESTION DES CLIENTS
-- =====================================================

-- Créer un nouveau client
INSERT INTO clients (client_id, name, email, phone, address, region, city, contact_person, contract_number, contract_start_date, contract_end_date) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer tous les clients actifs
SELECT * FROM clients WHERE status = 'active' ORDER BY name;

-- Récupérer les clients par région
SELECT * FROM clients WHERE region = ? AND status = 'active';

-- Récupérer les clients par ville
SELECT * FROM clients WHERE city = ? AND status = 'active';

-- Mettre à jour un client
UPDATE clients SET 
    name = ?, 
    email = ?, 
    phone = ?, 
    address = ?, 
    region = ?, 
    city = ?, 
    contact_person = ?, 
    contract_number = ?, 
    contract_start_date = ?, 
    contract_end_date = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Suspendre un client
UPDATE clients SET status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- =====================================================
-- 3. GESTION DES CONNEXIONS
-- =====================================================

-- Créer une nouvelle connexion
INSERT INTO connections (connection_id, client_id, client_name, type, status, location, capacity, vlan, ip_address, site, gateway, sla, assigned_to) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer toutes les connexions actives
SELECT c.*, cl.name as client_name 
FROM connections c 
JOIN clients cl ON c.client_id = cl.id 
WHERE c.status = 'active' 
ORDER BY c.created_at DESC;

-- Récupérer les connexions par client
SELECT * FROM connections WHERE client_id = ? ORDER BY created_at DESC;

-- Récupérer les connexions par type
SELECT * FROM connections WHERE type = ? AND status = 'active';

-- Récupérer les connexions par statut
SELECT * FROM connections WHERE status = ?;

-- Mettre à jour une connexion
UPDATE connections SET 
    status = ?, 
    location = ?, 
    capacity = ?, 
    vlan = ?, 
    ip_address = ?, 
    site = ?, 
    gateway = ?, 
    utilization = ?, 
    availability = ?, 
    assigned_to = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Désactiver une connexion
UPDATE connections SET 
    status = 'deactivated', 
    deactivation_date = CURDATE(), 
    deactivation_reason = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- =====================================================
-- 4. GESTION DES DEMANDES
-- =====================================================

-- Créer une nouvelle demande
INSERT INTO requests (request_id, client_name, type, status, priority, submitted_by, submitted_date, description, technical_details, expected_sla, location, client_email, client_contact, capacity, province, city, purchase_order) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer toutes les demandes
SELECT * FROM requests ORDER BY submitted_date DESC;

-- Récupérer les demandes par statut
SELECT * FROM requests WHERE status = ? ORDER BY submitted_date DESC;

-- Récupérer les demandes par type
SELECT * FROM requests WHERE type = ? ORDER BY submitted_date DESC;

-- Récupérer les demandes par priorité
SELECT * FROM requests WHERE priority = ? ORDER BY submitted_date DESC;

-- Récupérer les demandes d'un utilisateur
SELECT * FROM requests WHERE submitted_by = ? ORDER BY submitted_date DESC;

-- Mettre à jour le statut d'une demande
UPDATE requests SET 
    status = ?, 
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Ajouter des données techniques à une demande
UPDATE requests SET 
    vlan_client = ?, 
    ip_client = ?, 
    type_service = ?, 
    type_liaison = ?, 
    router_name = ?, 
    farend_site = ?, 
    gateway = ?, 
    lld_design = ?,
    launch_date = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- =====================================================
-- 5. GESTION DES ÉTAPES DE VALIDATION
-- =====================================================

-- Créer une étape de validation
INSERT INTO request_validation_steps (request_id, step_name, validator_role, status) 
VALUES (?, ?, ?, 'pending');

-- Récupérer les étapes de validation d'une demande
SELECT rvs.*, u.name as validator_name 
FROM request_validation_steps rvs 
LEFT JOIN users u ON rvs.validator_id = u.id 
WHERE rvs.request_id = ? 
ORDER BY rvs.created_at;

-- Valider une étape
UPDATE request_validation_steps SET 
    status = ?, 
    validator_id = ?, 
    validation_date = CURRENT_TIMESTAMP, 
    comments = ?
WHERE id = ?;

-- =====================================================
-- 6. GESTION DES INCIDENTS
-- =====================================================

-- Créer un nouvel incident
INSERT INTO incidents (incident_id, connection_id, client_name, title, description, severity, status, priority, ticket_type, reported_by, reported_date, assigned_to, sla_deadline) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer tous les incidents
SELECT * FROM incidents ORDER BY created_at DESC;

-- Récupérer les incidents par statut
SELECT * FROM incidents WHERE status = ? ORDER BY created_at DESC;

-- Récupérer les incidents par priorité
SELECT * FROM incidents WHERE priority = ? ORDER BY created_at DESC;

-- Récupérer les incidents d'un utilisateur assigné
SELECT * FROM incidents WHERE assigned_to = ? ORDER BY created_at DESC;

-- Récupérer les incidents d'un client
SELECT * FROM incidents WHERE client_name = ? ORDER BY created_at DESC;

-- Acquitter un incident
UPDATE incidents SET 
    status = 'acknowledged', 
    acknowledged_by = ?, 
    acknowledged_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Activer une équipe pour un incident
UPDATE incidents SET 
    status = 'team_activated', 
    activated_team = ?, 
    activated_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Mettre en cours un incident
UPDATE incidents SET 
    status = 'in_progress', 
    processed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Résoudre un incident
UPDATE incidents SET 
    status = 'resolved', 
    resolved_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Fermer un incident
UPDATE incidents SET 
    status = 'closed', 
    closed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- =====================================================
-- 7. GESTION DE LA RÉSOLUTION DES INCIDENTS
-- =====================================================

-- Ajouter une résolution
INSERT INTO incident_resolution (incident_id, cause, solution, resolution_images, resolved_by) 
VALUES (?, ?, ?, ?, ?);

-- Récupérer la résolution d'un incident
SELECT * FROM incident_resolution WHERE incident_id = ?;

-- =====================================================
-- 8. GESTION DU TRAITEMENT DES INCIDENTS
-- =====================================================

-- Ajouter un traitement
INSERT INTO incident_processing (incident_id, root_cause, action_taken, intervention_images, gps_latitude, gps_longitude, gps_address, processed_by) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer le traitement d'un incident
SELECT * FROM incident_processing WHERE incident_id = ?;

-- =====================================================
-- 9. GESTION GPS D'ACQUITTEMENT
-- =====================================================

-- Enregistrer la position GPS d'acquittement
INSERT INTO incident_acknowledgment_gps (incident_id, latitude, longitude, address) 
VALUES (?, ?, ?, ?);

-- Récupérer la position GPS d'acquittement
SELECT * FROM incident_acknowledgment_gps WHERE incident_id = ?;

-- =====================================================
-- 10. GESTION DU CYCLE DE VIE DES INCIDENTS
-- =====================================================

-- Ajouter une étape au cycle de vie
INSERT INTO incident_lifecycle (incident_id, status, user, comment) 
VALUES (?, ?, ?, ?);

-- Récupérer le cycle de vie d'un incident
SELECT * FROM incident_lifecycle WHERE incident_id = ? ORDER BY timestamp;

-- =====================================================
-- 11. GESTION DES FACTURES
-- =====================================================

-- Créer une nouvelle facture
INSERT INTO invoices (invoice_id, connection_id, client_name, amount, currency, billing_period, issue_date, due_date, created_by) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer toutes les factures
SELECT * FROM invoices ORDER BY issue_date DESC;

-- Récupérer les factures par statut
SELECT * FROM invoices WHERE status = ? ORDER BY issue_date DESC;

-- Récupérer les factures d'un client
SELECT * FROM invoices WHERE client_name = ? ORDER BY issue_date DESC;

-- Marquer une facture comme payée
UPDATE invoices SET 
    status = 'paid', 
    payment_date = CURDATE(), 
    payment_method = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- =====================================================
-- 12. GESTION DES SPARES PARTS
-- =====================================================

-- Créer un nouveau spare part
INSERT INTO spare_parts (part_id, name, description, category, unit, min_stock, max_stock, current_stock, unit_price, region, city, warehouse, supplier) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer tous les spares parts
SELECT * FROM spare_parts ORDER BY name;

-- Récupérer les spares parts par catégorie
SELECT * FROM spare_parts WHERE category = ? ORDER BY name;

-- Récupérer les spares parts par région
SELECT * FROM spare_parts WHERE region = ? ORDER BY name;

-- Récupérer les spares parts par ville
SELECT * FROM spare_parts WHERE city = ? ORDER BY name;

-- Récupérer les spares parts en rupture
SELECT * FROM spare_parts WHERE status = 'out_of_stock' ORDER BY name;

-- Récupérer les spares parts en stock faible
SELECT * FROM spare_parts WHERE status = 'low_stock' ORDER BY name;

-- Mettre à jour le stock d'un spare part
UPDATE spare_parts SET 
    current_stock = ?, 
    last_updated = CURDATE(),
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- =====================================================
-- 13. GESTION DES TRANSACTIONS DE SPARES PARTS
-- =====================================================

-- Créer une nouvelle transaction
INSERT INTO spare_part_transactions (transaction_id, spare_part_id, type, quantity, requester_id, requester_role, requester_manager, reason, region, city) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer toutes les transactions
SELECT spt.*, sp.name as spare_part_name, u.name as requester_name 
FROM spare_part_transactions spt 
JOIN spare_parts sp ON spt.spare_part_id = sp.id 
JOIN users u ON spt.requester_id = u.id 
ORDER BY spt.request_date DESC;

-- Récupérer les transactions en attente
SELECT spt.*, sp.name as spare_part_name, u.name as requester_name 
FROM spare_part_transactions spt 
JOIN spare_parts sp ON spt.spare_part_id = sp.id 
JOIN users u ON spt.requester_id = u.id 
WHERE spt.status = 'pending' 
ORDER BY spt.request_date DESC;

-- Approuver une transaction
UPDATE spare_part_transactions SET 
    status = 'approved', 
    approved_by = ?, 
    approved_by_role = ?, 
    approval_date = CURRENT_TIMESTAMP,
    comments = ?
WHERE id = ?;

-- Rejeter une transaction
UPDATE spare_part_transactions SET 
    status = 'rejected', 
    approved_by = ?, 
    approved_by_role = ?, 
    approval_date = CURRENT_TIMESTAMP,
    comments = ?
WHERE id = ?;

-- Finaliser une transaction (mise à jour du stock)
UPDATE spare_part_transactions SET status = 'completed' WHERE id = ?;

-- =====================================================
-- 14. GESTION DU SUIVI FME
-- =====================================================

-- Enregistrer la position d'un FME
INSERT INTO fme_tracking (fme_id, incident_id, latitude, longitude, address, status, current_ticket_id) 
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Récupérer la dernière position d'un FME
SELECT ft.*, u.name as fme_name 
FROM fme_tracking ft 
JOIN users u ON ft.fme_id = u.id 
WHERE ft.fme_id = ? 
ORDER BY ft.tracked_at DESC 
LIMIT 1;

-- Récupérer toutes les positions FME
SELECT ft.*, u.name as fme_name 
FROM fme_tracking ft 
JOIN users u ON ft.fme_id = u.id 
ORDER BY ft.tracked_at DESC;

-- Récupérer les FME disponibles
SELECT ft.*, u.name as fme_name 
FROM fme_tracking ft 
JOIN users u ON ft.fme_id = u.id 
WHERE ft.status = 'available' 
AND ft.tracked_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY ft.tracked_at DESC;

-- =====================================================
-- 15. GESTION DU MONITORING GLOBAL
-- =====================================================

-- Enregistrer des données de disponibilité
INSERT INTO client_availability (client_id, connection_id, date, hour, uplink_percentage, downlink_percentage, uplink_traffic_gbps, downlink_traffic_gbps, status) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE 
    uplink_percentage = VALUES(uplink_percentage),
    downlink_percentage = VALUES(downlink_percentage),
    uplink_traffic_gbps = VALUES(uplink_traffic_gbps),
    downlink_traffic_gbps = VALUES(downlink_traffic_gbps),
    status = VALUES(status);

-- Récupérer les données de disponibilité d'un client
SELECT ca.*, c.client_name, c.type as connection_type 
FROM client_availability ca 
JOIN connections c ON ca.connection_id = c.connection_id 
WHERE ca.client_id = ? 
AND ca.date = ? 
ORDER BY ca.hour;

-- Récupérer les données de disponibilité d'une connexion
SELECT * FROM client_availability 
WHERE connection_id = ? 
AND date = ? 
ORDER BY hour;

-- Récupérer les connexions dégradées aujourd'hui
SELECT ca.*, c.client_name, c.type as connection_type 
FROM client_availability ca 
JOIN connections c ON ca.connection_id = c.connection_id 
WHERE ca.date = CURDATE() 
AND ca.status = 'degraded' 
ORDER BY ca.hour DESC;

-- =====================================================
-- 16. GESTION DES NOTIFICATIONS
-- =====================================================

-- Créer une notification
INSERT INTO notifications (notification_id, user_id, type, title, message, related_id) 
VALUES (?, ?, ?, ?, ?, ?);

-- Récupérer les notifications d'un utilisateur
SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC;

-- Récupérer les notifications non lues d'un utilisateur
SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC;

-- Marquer une notification comme lue
UPDATE notifications SET is_read = TRUE WHERE id = ?;

-- Marquer toutes les notifications d'un utilisateur comme lues
UPDATE notifications SET is_read = TRUE WHERE user_id = ?;

-- =====================================================
-- 17. GESTION DES LOGS DE NOTIFICATIONS
-- =====================================================

-- Enregistrer un log de notification
INSERT INTO notification_logs (log_id, ticket_id, step, recipients, template, status, channel, content) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer les logs de notifications d'un ticket
SELECT * FROM notification_logs WHERE ticket_id = ? ORDER BY sent_at DESC;

-- =====================================================
-- 18. GESTION DES CONFIGURATIONS SYSTÈME
-- =====================================================

-- Récupérer une configuration
SELECT config_value FROM system_config WHERE config_key = ?;

-- Mettre à jour une configuration
UPDATE system_config SET config_value = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?;

-- Récupérer toutes les configurations
SELECT * FROM system_config ORDER BY config_key;

-- =====================================================
-- 19. GESTION DES LOGS D'ACTIVITÉ
-- =====================================================

-- Enregistrer un log d'activité
INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer les logs d'activité d'un utilisateur
SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC;

-- Récupérer les logs d'activité récents
SELECT al.*, u.name as user_name 
FROM activity_logs al 
LEFT JOIN users u ON al.user_id = u.id 
ORDER BY al.created_at DESC 
LIMIT 100;

-- =====================================================
-- 20. GESTION DES INTÉGRATIONS BASE DE DONNÉES
-- =====================================================

-- Créer une intégration base de données
INSERT INTO database_integrations (name, type, host, port, database_name, username, password) 
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Récupérer toutes les intégrations actives
SELECT * FROM database_integrations WHERE is_active = TRUE;

-- Tester une connexion (mise à jour de last_connection)
UPDATE database_integrations SET last_connection = CURRENT_TIMESTAMP WHERE id = ?;

-- =====================================================
-- 21. GESTION DES INTÉGRATIONS RÉSEAU
-- =====================================================

-- Créer une intégration réseau
INSERT INTO network_integrations (name, type, host, port, protocol, username, password, community_string) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Récupérer toutes les intégrations réseau actives
SELECT * FROM network_integrations WHERE is_active = TRUE;

-- Récupérer les équipements par type
SELECT * FROM network_integrations WHERE type = ? AND is_active = TRUE;

-- Tester une connexion réseau
UPDATE network_integrations SET last_connection = CURRENT_TIMESTAMP WHERE id = ?;

-- =====================================================
-- 22. GESTION DES MÉTRIQUES RÉSEAU
-- =====================================================

-- Enregistrer une métrique
INSERT INTO network_metrics (device_id, metric_type, metric_value, unit) 
VALUES (?, ?, ?, ?);

-- Récupérer les métriques d'un équipement
SELECT * FROM network_metrics WHERE device_id = ? ORDER BY collected_at DESC;

-- Récupérer les dernières métriques de tous les équipements
SELECT nm.*, ni.name as device_name, ni.type as device_type 
FROM network_metrics nm 
JOIN network_integrations ni ON nm.device_id = ni.id 
WHERE nm.collected_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) 
ORDER BY nm.collected_at DESC;

-- =====================================================
-- 23. REQUÊTES DE STATISTIQUES ET RAPPORTS
-- =====================================================

-- Statistiques des incidents par statut
SELECT status, COUNT(*) as count 
FROM incidents 
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
GROUP BY status;

-- Statistiques des incidents par priorité
SELECT priority, COUNT(*) as count 
FROM incidents 
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
GROUP BY priority;

-- Statistiques des demandes par statut
SELECT status, COUNT(*) as count 
FROM requests 
WHERE submitted_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
GROUP BY status;

-- Statistiques des spares parts par statut
SELECT status, COUNT(*) as count 
FROM spare_parts 
GROUP BY status;

-- Statistiques des connexions par type
SELECT type, COUNT(*) as count 
FROM connections 
WHERE status = 'active' 
GROUP BY type;

-- Statistiques des connexions par région
SELECT c.region, COUNT(*) as count 
FROM connections c 
WHERE c.status = 'active' 
GROUP BY c.region;

-- =====================================================
-- 24. REQUÊTES DE RECHERCHE ET FILTRAGE
-- =====================================================

-- Rechercher des incidents par mot-clé
SELECT * FROM incidents 
WHERE title LIKE ? OR description LIKE ? OR client_name LIKE ? 
ORDER BY created_at DESC;

-- Rechercher des demandes par mot-clé
SELECT * FROM requests 
WHERE description LIKE ? OR client_name LIKE ? OR submitted_by LIKE ? 
ORDER BY submitted_date DESC;

-- Rechercher des spares parts par mot-clé
SELECT * FROM spare_parts 
WHERE name LIKE ? OR description LIKE ? OR category LIKE ? 
ORDER BY name;

-- Filtrer les incidents par période
SELECT * FROM incidents 
WHERE created_at BETWEEN ? AND ? 
ORDER BY created_at DESC;

-- Filtrer les demandes par période
SELECT * FROM requests 
WHERE submitted_date BETWEEN ? AND ? 
ORDER BY submitted_date DESC;

-- =====================================================
-- 25. REQUÊTES D'EXPORT ET RAPPORTS
-- =====================================================

-- Export des incidents pour une période
SELECT 
    i.incident_id,
    i.client_name,
    i.title,
    i.description,
    i.severity,
    i.priority,
    i.status,
    i.reported_by,
    i.reported_date,
    i.assigned_to,
    i.created_at
FROM incidents i 
WHERE i.created_at BETWEEN ? AND ? 
ORDER BY i.created_at DESC;

-- Export des demandes pour une période
SELECT 
    r.request_id,
    r.client_name,
    r.type,
    r.status,
    r.priority,
    r.submitted_by,
    r.submitted_date,
    r.description,
    r.location,
    r.created_at
FROM requests r 
WHERE r.submitted_date BETWEEN ? AND ? 
ORDER BY r.submitted_date DESC;

-- Export des transactions de spares parts pour une période
SELECT 
    spt.transaction_id,
    sp.name as spare_part_name,
    spt.type,
    spt.quantity,
    u.name as requester_name,
    spt.reason,
    spt.status,
    spt.request_date,
    spt.approval_date
FROM spare_part_transactions spt 
JOIN spare_parts sp ON spt.spare_part_id = sp.id 
JOIN users u ON spt.requester_id = u.id 
WHERE spt.request_date BETWEEN ? AND ? 
ORDER BY spt.request_date DESC;

-- =====================================================
-- FIN DES REQUÊTES
-- =====================================================
