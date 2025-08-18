-- =====================================================
-- DONNÉES DE TEST - MONITORING B2B
-- =====================================================

USE monitoring_b2b;

-- =====================================================
-- INSERTION DES UTILISATEURS
-- =====================================================

INSERT INTO users (username, password, name, email, role, sub_department, manager_email, phone) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur Principal', 'admin@monitoring.com', 'admin', 'IT', 'admin@monitoring.com', '+243 123 456 789'),
('super_admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrateur', 'superadmin@monitoring.com', 'super_admin', 'IT', NULL, '+243 123 456 790'),
('commercial1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean Commercial', 'jean.commercial@monitoring.com', 'commercial', 'Commercial', 'commercial.manager@monitoring.com', '+243 123 456 791'),
('project1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie Projet', 'marie.projet@monitoring.com', 'project', 'Projet', 'project.manager@monitoring.com', '+243 123 456 792'),
('maintenance1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pierre Maintenance', 'pierre.maintenance@monitoring.com', 'maintenance', 'Maintenance', 'maintenance.manager@monitoring.com', '+243 123 456 793'),
('noc1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophie NOC', 'sophie.noc@monitoring.com', 'noc', 'NOC', 'noc.manager@monitoring.com', '+243 123 456 794'),
('sav1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Luc SAV', 'luc.sav@monitoring.com', 'sav', 'SAV', 'sav.manager@monitoring.com', '+243 123 456 795'),
('fme1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Paul FME Test', 'paul.fme@monitoring.com', 'fme', 'FME', 'fme.manager@monitoring.com', '+243 123 456 796'),
('bo1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice BO', 'alice.bo@monitoring.com', 'bo', 'BO', 'bo.manager@monitoring.com', '+243 123 456 797'),
('client1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Client Test', 'client@test.com', 'client', 'Client', NULL, '+243 123 456 798');

-- =====================================================
-- INSERTION DES CLIENTS
-- =====================================================

INSERT INTO clients (name, email, phone, address, region, city, contact_person, contract_number, contract_start_date, contract_end_date, status) VALUES
('Entreprise ABC', 'contact@abc.com', '+243 123 456 800', '123 Avenue du Commerce, Kinshasa', 'Kinshasa', 'Kinshasa', 'Jean Dupont', 'CONTR-001', '2024-01-01', '2024-12-31', 'active'),
('Société XYZ', 'info@xyz.com', '+243 123 456 801', '456 Boulevard de l\'Industrie, Lubumbashi', 'Lubumbashi', 'Lubumbashi', 'Marie Martin', 'CONTR-002', '2024-02-01', '2025-01-31', 'active'),
('Compagnie DEF', 'contact@def.com', '+243 123 456 802', '789 Rue du Port, Matadi', 'Matadi', 'Matadi', 'Pierre Durand', 'CONTR-003', '2024-03-01', '2025-02-28', 'active'),
('Entreprise GHI', 'info@ghi.com', '+243 123 456 803', '321 Avenue de la Paix, Goma', 'Goma', 'Goma', 'Sophie Bernard', 'CONTR-004', '2024-01-15', '2024-12-15', 'active'),
('Société JKL', 'contact@jkl.com', '+243 123 456 804', '654 Boulevard Central, Kinshasa', 'Kinshasa', 'Kinshasa', 'Luc Moreau', 'CONTR-005', '2024-02-15', '2025-02-14', 'active');

-- =====================================================
-- INSERTION DES CONNEXIONS
-- =====================================================

INSERT INTO connections (connection_id, client_id, connection_type, bandwidth, ip_address, location, region, city, status, assigned_to, installation_date, last_maintenance_date) VALUES
('CONN-001', 1, 'fiber', '100 Mbps', '192.168.1.100', 'Siège ABC', 'Kinshasa', 'Kinshasa', 'active', 'maintenance', '2024-01-15', '2024-11-15'),
('CONN-002', 1, 'radio', '50 Mbps', '192.168.1.101', 'Succursale ABC', 'Kinshasa', 'Kinshasa', 'active', 'maintenance', '2024-01-20', '2024-11-20'),
('CONN-003', 2, 'fiber', '200 Mbps', '192.168.2.100', 'Siège XYZ', 'Lubumbashi', 'Lubumbashi', 'active', 'maintenance', '2024-02-15', '2024-12-15'),
('CONN-004', 3, 'satellite', '25 Mbps', '192.168.3.100', 'Port DEF', 'Matadi', 'Matadi', 'active', 'maintenance', '2024-03-15', '2024-12-15'),
('CONN-005', 4, 'fiber', '150 Mbps', '192.168.4.100', 'Centre GHI', 'Goma', 'Goma', 'active', 'maintenance', '2024-01-30', '2024-11-30'),
('CONN-006', 5, 'radio', '75 Mbps', '192.168.5.100', 'Bureau JKL', 'Kinshasa', 'Kinshasa', 'active', 'maintenance', '2024-02-28', '2024-12-28'),
('CONN-007', 1, 'ethernet', '1 Gbps', '192.168.1.102', 'Data Center ABC', 'Kinshasa', 'Kinshasa', 'active', 'maintenance', '2024-03-01', '2024-12-01'),
('CONN-008', 2, 'fiber', '500 Mbps', '192.168.2.101', 'Backup XYZ', 'Lubumbashi', 'Lubumbashi', 'active', 'maintenance', '2024-03-10', '2024-12-10');

-- =====================================================
-- INSERTION DES DEMANDES DE CONNEXION
-- =====================================================

INSERT INTO connection_requests (request_id, client_id, requester_id, connection_type, bandwidth, location, region, city, priority, status, reason, expected_delivery_date) VALUES
('REQ-001', 1, 3, 'fiber', '100 Mbps', 'Nouvelle succursale ABC', 'Kinshasa', 'Kinshasa', 'high', 'approved', 'Extension réseau pour nouvelle succursale', '2024-12-15'),
('REQ-002', 2, 3, 'radio', '50 Mbps', 'Site distant XYZ', 'Lubumbashi', 'Lubumbashi', 'medium', 'pending', 'Connexion pour site distant', '2024-12-30'),
('REQ-003', 3, 3, 'satellite', '25 Mbps', 'Poste de contrôle DEF', 'Matadi', 'Matadi', 'low', 'in_progress', 'Connexion pour poste de contrôle', '2025-01-15');

-- =====================================================
-- INSERTION DES DEMANDES DE DÉSACTIVATION
-- =====================================================

INSERT INTO deactivation_requests (request_id, connection_id, requester_id, reason, deactivation_date, priority, technical_details, status) VALUES
('DEACT-001', 2, 3, 'Fermeture de la succursale', '2024-12-31', 'medium', 'Succursale fermée définitivement', 'pending'),
('DEACT-002', 4, 3, 'Fin de contrat', '2024-12-31', 'high', 'Contrat non renouvelé', 'validated');

-- =====================================================
-- INSERTION DES ÉTAPES DE VALIDATION
-- =====================================================

INSERT INTO deactivation_validation_steps (deactivation_request_id, step_name, validator_role, status) VALUES
(1, 'Validation Commerciale', 'commercial', 'pending'),
(1, 'Validation Projet', 'project', 'pending'),
(2, 'Validation Commerciale', 'commercial', 'approved'),
(2, 'Validation Projet', 'project', 'approved');

-- =====================================================
-- INSERTION DES INCIDENTS
-- =====================================================

INSERT INTO incidents (ticket_id, connection_id, reported_by, assigned_to, title, description, ticket_type, priority, severity, status, screenshot_path) VALUES
('TKT-001', 1, 1, 'maintenance', 'Dégradation de service - Connexion lente', 'La connexion est très lente depuis ce matin', 'degradation', 'medium', 'medium', 'open', NULL),
('TKT-002', 3, 6, 'maintenance', 'Indisponibilité totale - Pas de connexion', 'Aucune connexion internet depuis 2 heures', 'unavailability', 'critical', 'critical', 'acknowledged', NULL),
('TKT-003', 5, 7, 'maintenance', 'Demande d\'information - Bande passante', 'Besoin d\'informations sur la bande passante disponible', 'information_request', 'low', 'low', 'open', NULL),
('TKT-004', 2, 8, 'maintenance', 'Problème de connectivité intermittente', 'Connexion qui se coupe régulièrement', 'degradation', 'high', 'high', 'in_progress', NULL),
('TKT-005', 6, 9, 'maintenance', 'Dégradation de service - Latence élevée', 'Latence très élevée sur la connexion', 'degradation', 'medium', 'medium', 'resolved', NULL);

-- =====================================================
-- INSERTION DU CYCLE DE VIE DES TICKETS
-- =====================================================

INSERT INTO ticket_lifecycle (incident_id, status, changed_by, comments, gps_latitude, gps_longitude, gps_address) VALUES
(1, 'open', 1, 'Ticket créé', NULL, NULL, NULL),
(2, 'open', 6, 'Ticket créé', NULL, NULL, NULL),
(2, 'acknowledged', 8, 'Ticket pris en charge', -4.4419, 15.2663, 'Kinshasa, RDC'),
(3, 'open', 7, 'Ticket créé', NULL, NULL, NULL),
(4, 'open', 8, 'Ticket créé', NULL, NULL, NULL),
(4, 'acknowledged', 8, 'Ticket pris en charge', -4.4419, 15.2663, 'Kinshasa, RDC'),
(4, 'in_progress', 8, 'Intervention en cours', -4.4419, 15.2663, 'Kinshasa, RDC'),
(5, 'open', 9, 'Ticket créé', NULL, NULL, NULL),
(5, 'acknowledged', 8, 'Ticket pris en charge', -4.4419, 15.2663, 'Kinshasa, RDC'),
(5, 'in_progress', 8, 'Intervention en cours', -4.4419, 15.2663, 'Kinshasa, RDC'),
(5, 'resolved', 8, 'Problème résolu', -4.4419, 15.2663, 'Kinshasa, RDC');

-- =====================================================
-- INSERTION DU TRAITEMENT DES TICKETS
-- =====================================================

INSERT INTO ticket_processing (incident_id, processor_id, root_cause, action_taken, intervention_images, gps_latitude, gps_longitude, gps_address) VALUES
(4, 8, 'Câble réseau endommagé', 'Remplacement du câble réseau', '["/uploads/intervention_4_1.jpg", "/uploads/intervention_4_2.jpg"]', -4.4419, 15.2663, 'Kinshasa, RDC'),
(5, 8, 'Configuration routeur incorrecte', 'Reconfiguration du routeur', '["/uploads/intervention_5_1.jpg"]', -4.4419, 15.2663, 'Kinshasa, RDC');

-- =====================================================
-- INSERTION DE LA RÉSOLUTION DES TICKETS
-- =====================================================

INSERT INTO ticket_resolution (incident_id, resolver_id, cause, solution, resolution_images, resolved_at) VALUES
(5, 8, 'Configuration routeur incorrecte', 'Reconfiguration complète du routeur avec les bons paramètres', '["/uploads/resolution_5_1.jpg", "/uploads/resolution_5_2.jpg"]', '2024-12-01 14:30:00');

-- =====================================================
-- INSERTION DES COMMENTAIRES SUR LES TICKETS
-- =====================================================

INSERT INTO ticket_comments (incident_id, commenter_id, comment) VALUES
(1, 6, 'Je confirme le problème de lenteur'),
(2, 8, 'Intervention programmée pour demain matin'),
(4, 8, 'Câble remplacé, test en cours'),
(5, 8, 'Résolution confirmée, tests OK');

-- =====================================================
-- INSERTION DES FACTURES
-- =====================================================

INSERT INTO invoices (invoice_number, client_id, connection_id, amount, currency, billing_period, due_date, status, payment_method, payment_date, attachment_path, notes, created_by) VALUES
('INV-001', 1, 1, 1500.00, 'USD', 'Novembre 2024', '2024-12-15', 'pending', NULL, NULL, '/uploads/invoice_001.pdf', 'Facture mensuelle', 3),
('INV-002', 2, 3, 2500.00, 'USD', 'Novembre 2024', '2024-12-15', 'paid', 'Virement bancaire', '2024-12-10', '/uploads/invoice_002.pdf', 'Facture mensuelle', 3),
('INV-003', 3, 4, 800.00, 'USD', 'Novembre 2024', '2024-12-15', 'overdue', NULL, NULL, '/uploads/invoice_003.pdf', 'Facture mensuelle', 3),
('INV-004', 4, 5, 1800.00, 'USD', 'Novembre 2024', '2024-12-15', 'pending', NULL, NULL, '/uploads/invoice_004.pdf', 'Facture mensuelle', 3),
('INV-005', 5, 6, 1200.00, 'USD', 'Novembre 2024', '2024-12-15', 'paid', 'Chèque', '2024-12-12', '/uploads/invoice_005.pdf', 'Facture mensuelle', 3);

-- =====================================================
-- INSERTION DES SPARES PARTS
-- =====================================================

INSERT INTO spare_parts (part_id, name, description, category, unit, min_stock, max_stock, current_stock, unit_price, region, city, warehouse, supplier, status, last_updated) VALUES
('SP-001', 'Câble réseau Cat6', 'Câble réseau Cat6 100m', 'Câbles', 'mètres', 50, 500, 200, 2.50, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 'Fournisseur Câbles RDC', 'available', '2024-12-01'),
('SP-002', 'Switch 24 ports', 'Switch réseau 24 ports Gigabit', 'Équipements réseau', 'unités', 2, 20, 8, 150.00, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 'Cisco Systems', 'available', '2024-12-01'),
('SP-003', 'Routeur WiFi', 'Routeur WiFi 5GHz', 'Équipements réseau', 'unités', 5, 50, 15, 80.00, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 'TP-Link', 'available', '2024-12-01'),
('SP-004', 'Antenne radio', 'Antenne radio directionnelle 5GHz', 'Antennes', 'unités', 1, 10, 2, 200.00, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 'Ubiquiti', 'low_stock', '2024-12-01'),
('SP-005', 'Connecteur RJ45', 'Connecteur RJ45 mâle', 'Connecteurs', 'unités', 100, 1000, 150, 0.50, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 'Fournisseur Connecteurs', 'available', '2024-12-01'),
('SP-006', 'Fibre optique', 'Fibre optique monomode 1km', 'Fibres', 'mètres', 100, 2000, 500, 5.00, 'Lubumbashi', 'Lubumbashi', 'Entrepôt Lubumbashi', 'Fournisseur Fibres', 'available', '2024-12-01'),
('SP-007', 'Modem satellite', 'Modem satellite VSAT', 'Modems', 'unités', 1, 5, 1, 500.00, 'Matadi', 'Matadi', 'Entrepôt Matadi', 'Hughes Network', 'low_stock', '2024-12-01'),
('SP-008', 'Batterie UPS', 'Batterie UPS 12V 100Ah', 'Batteries', 'unités', 2, 20, 3, 120.00, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 'Fournisseur Batteries', 'low_stock', '2024-12-01');

-- =====================================================
-- INSERTION DES TRANSACTIONS DE SPARES PARTS
-- =====================================================

INSERT INTO spare_part_transactions (transaction_id, spare_part_id, type, quantity, requester_id, requester_role, requester_manager, reason, region, city, status, request_date, approval_date, approved_by, approved_by_role, comments) VALUES
('TR-001', 1, 'out', 50, 8, 'maintenance', 'maintenance.manager@monitoring.com', 'Intervention sur site ABC', 'Kinshasa', 'Kinshasa', 'approved', '2024-11-15 09:00:00', '2024-11-15 10:00:00', 1, 'admin', 'Approuvé pour intervention'),
('TR-002', 2, 'out', 1, 8, 'maintenance', 'maintenance.manager@monitoring.com', 'Remplacement switch défaillant', 'Kinshasa', 'Kinshasa', 'approved', '2024-11-20 14:00:00', '2024-11-20 15:00:00', 1, 'admin', 'Switch remplacé'),
('TR-003', 4, 'out', 1, 8, 'maintenance', 'maintenance.manager@monitoring.com', 'Installation nouvelle liaison', 'Kinshasa', 'Kinshasa', 'pending', '2024-12-01 11:00:00', NULL, NULL, NULL, 'En attente d\'approbation'),
('TR-004', 1, 'in', 100, 1, 'admin', NULL, 'Réapprovisionnement stock', 'Kinshasa', 'Kinshasa', 'approved', '2024-11-25 16:00:00', '2024-11-25 17:00:00', 1, 'admin', 'Stock réapprovisionné'),
('TR-005', 7, 'out', 1, 8, 'maintenance', 'maintenance.manager@monitoring.com', 'Remplacement modem satellite', 'Matadi', 'Matadi', 'approved', '2024-11-28 13:00:00', '2024-11-28 14:00:00', 1, 'admin', 'Modem remplacé');

-- =====================================================
-- INSERTION DES LOCALISATIONS DE SPARES PARTS
-- =====================================================

INSERT INTO spare_part_locations (spare_part_id, region, city, warehouse, quantity) VALUES
(1, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 200),
(2, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 8),
(3, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 15),
(4, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 2),
(5, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 150),
(6, 'Lubumbashi', 'Lubumbashi', 'Entrepôt Lubumbashi', 500),
(7, 'Matadi', 'Matadi', 'Entrepôt Matadi', 1),
(8, 'Kinshasa', 'Kinshasa', 'Entrepôt Central', 3);

-- =====================================================
-- INSERTION DU SUIVI FME
-- =====================================================

INSERT INTO fme_tracking (fme_id, incident_id, latitude, longitude, address, status, current_ticket_id, tracked_at) VALUES
(8, 4, -4.4419, 15.2663, 'Kinshasa, RDC', 'busy', 'TKT-004', '2024-12-01 10:00:00'),
(8, 5, -4.4419, 15.2663, 'Kinshasa, RDC', 'busy', 'TKT-005', '2024-12-01 14:00:00'),
(8, NULL, -4.4419, 15.2663, 'Kinshasa, RDC', 'available', NULL, '2024-12-01 16:00:00');

-- =====================================================
-- INSERTION DES DONNÉES DE DISPONIBILITÉ
-- =====================================================

-- Données pour le 1er décembre 2024 (exemple pour 24 heures)
INSERT INTO client_availability (client_id, connection_id, date, hour, uplink_percentage, downlink_percentage, uplink_traffic_gbps, downlink_traffic_gbps, status) VALUES
-- Client 1, Connexion 1
(1, 1, '2024-12-01', 0, 95.5, 98.2, 0.085, 0.092, 'available'),
(1, 1, '2024-12-01', 1, 94.8, 97.9, 0.082, 0.089, 'available'),
(1, 1, '2024-12-01', 2, 93.2, 96.5, 0.078, 0.085, 'available'),
(1, 1, '2024-12-01', 3, 92.1, 95.8, 0.075, 0.082, 'available'),
(1, 1, '2024-12-01', 4, 91.5, 94.2, 0.072, 0.079, 'available'),
(1, 1, '2024-12-01', 5, 90.8, 93.1, 0.068, 0.075, 'available'),
(1, 1, '2024-12-01', 6, 89.2, 91.5, 0.065, 0.072, 'available'),
(1, 1, '2024-12-01', 7, 88.5, 90.2, 0.062, 0.068, 'available'),
(1, 1, '2024-12-01', 8, 87.1, 89.8, 0.058, 0.065, 'available'),
(1, 1, '2024-12-01', 9, 86.4, 88.5, 0.055, 0.062, 'available'),
(1, 1, '2024-12-01', 10, 85.2, 87.1, 0.052, 0.058, 'available'),
(1, 1, '2024-12-01', 11, 84.8, 86.5, 0.048, 0.055, 'available'),
(1, 1, '2024-12-01', 12, 83.5, 85.2, 0.045, 0.052, 'available'),
(1, 1, '2024-12-01', 13, 82.1, 84.8, 0.042, 0.048, 'available'),
(1, 1, '2024-12-01', 14, 81.5, 83.1, 0.038, 0.045, 'available'),
(1, 1, '2024-12-01', 15, 80.2, 82.5, 0.035, 0.042, 'available'),
(1, 1, '2024-12-01', 16, 79.8, 81.2, 0.032, 0.038, 'available'),
(1, 1, '2024-12-01', 17, 78.5, 80.8, 0.028, 0.035, 'available'),
(1, 1, '2024-12-01', 18, 77.1, 79.5, 0.025, 0.032, 'available'),
(1, 1, '2024-12-01', 19, 76.8, 78.2, 0.022, 0.028, 'available'),
(1, 1, '2024-12-01', 20, 75.5, 77.8, 0.018, 0.025, 'available'),
(1, 1, '2024-12-01', 21, 74.2, 76.5, 0.015, 0.022, 'available'),
(1, 1, '2024-12-01', 22, 73.8, 75.2, 0.012, 0.018, 'available'),
(1, 1, '2024-12-01', 23, 72.5, 74.8, 0.008, 0.015, 'available'),

-- Client 2, Connexion 3
(2, 3, '2024-12-01', 0, 98.5, 99.2, 0.185, 0.192, 'available'),
(2, 3, '2024-12-01', 1, 98.2, 98.9, 0.182, 0.189, 'available'),
(2, 3, '2024-12-01', 2, 97.8, 98.5, 0.178, 0.185, 'available'),
(2, 3, '2024-12-01', 3, 97.2, 98.1, 0.175, 0.182, 'available'),
(2, 3, '2024-12-01', 4, 96.8, 97.8, 0.172, 0.178, 'available'),
(2, 3, '2024-12-01', 5, 96.2, 97.2, 0.168, 0.175, 'available'),
(2, 3, '2024-12-01', 6, 95.8, 96.8, 0.165, 0.172, 'available'),
(2, 3, '2024-12-01', 7, 95.2, 96.2, 0.162, 0.168, 'available'),
(2, 3, '2024-12-01', 8, 94.8, 95.8, 0.158, 0.165, 'available'),
(2, 3, '2024-12-01', 9, 94.2, 95.2, 0.155, 0.162, 'available'),
(2, 3, '2024-12-01', 10, 93.8, 94.8, 0.152, 0.158, 'available'),
(2, 3, '2024-12-01', 11, 93.2, 94.2, 0.148, 0.155, 'available'),
(2, 3, '2024-12-01', 12, 92.8, 93.8, 0.145, 0.152, 'available'),
(2, 3, '2024-12-01', 13, 92.2, 93.2, 0.142, 0.148, 'available'),
(2, 3, '2024-12-01', 14, 91.8, 92.8, 0.138, 0.145, 'available'),
(2, 3, '2024-12-01', 15, 91.2, 92.2, 0.135, 0.142, 'available'),
(2, 3, '2024-12-01', 16, 90.8, 91.8, 0.132, 0.138, 'available'),
(2, 3, '2024-12-01', 17, 90.2, 91.2, 0.128, 0.135, 'available'),
(2, 3, '2024-12-01', 18, 89.8, 90.8, 0.125, 0.132, 'available'),
(2, 3, '2024-12-01', 19, 89.2, 90.2, 0.122, 0.128, 'available'),
(2, 3, '2024-12-01', 20, 88.8, 89.8, 0.118, 0.125, 'available'),
(2, 3, '2024-12-01', 21, 88.2, 89.2, 0.115, 0.122, 'available'),
(2, 3, '2024-12-01', 22, 87.8, 88.8, 0.112, 0.118, 'available'),
(2, 3, '2024-12-01', 23, 87.2, 88.2, 0.108, 0.115, 'available');

-- =====================================================
-- INSERTION DES CONFIGURATIONS SYSTÈME
-- =====================================================

INSERT INTO system_config (config_key, config_value, description) VALUES
('auto_close_resolved_tickets_hours', '24', 'Nombre d\'heures avant fermeture automatique des tickets résolus'),
('alert_unprocessed_tickets_hours', '4', 'Nombre d\'heures avant alerte pour tickets non traités'),
('default_ticket_priority', 'medium', 'Priorité par défaut pour les nouveaux tickets'),
('system_timezone', 'Africa/Kinshasa', 'Fuseau horaire du système'),
('max_file_upload_size', '10485760', 'Taille maximale des fichiers uploadés (10MB)'),
('backup_retention_days', '30', 'Nombre de jours de rétention des sauvegardes'),
('session_timeout_minutes', '480', 'Timeout de session en minutes (8 heures)'),
('max_login_attempts', '5', 'Nombre maximum de tentatives de connexion');

-- =====================================================
-- INSERTION DES LOGS D'ACTIVITÉ (EXEMPLES)
-- =====================================================

INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) VALUES
(1, 'CREATE', 'incidents', 1, NULL, '{"ticket_id":"TKT-001","title":"Dégradation de service"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(8, 'UPDATE', 'incidents', 2, '{"status":"open"}', '{"status":"acknowledged"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, 'CREATE', 'spare_part_transactions', 1, NULL, '{"transaction_id":"TR-001","type":"out","quantity":50}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(3, 'CREATE', 'invoices', 1, NULL, '{"invoice_number":"INV-001","amount":1500.00}', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

-- =====================================================
-- FIN DES DONNÉES DE TEST
-- =====================================================
