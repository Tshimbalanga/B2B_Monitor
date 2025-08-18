-- =====================================================
-- BASE DE DONNÉES MONITORING B2B - VERSION AMÉLIORÉE
-- =====================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS monitoring_b2b_v2;
USE monitoring_b2b_v2;

-- =====================================================
-- TABLE DES UTILISATEURS (AMÉLIORÉE)
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) UNIQUE NOT NULL, -- Format: USER-001, USER-002
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('commercial', 'project', 'maintenance', 'client', 'admin', 'super_admin', 'recouvrement', 'facturation') NOT NULL,
    department VARCHAR(100),
    sub_department VARCHAR(50), -- SAV, BO, FME, NOC pour maintenance
    manager_email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    password_change_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DES CLIENTS (AMÉLIORÉE)
-- =====================================================
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id VARCHAR(20) UNIQUE NOT NULL, -- Format: CLIENT-001, CLIENT-002
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    region VARCHAR(50),
    city VARCHAR(50),
    contact_person VARCHAR(100),
    contract_number VARCHAR(50),
    contract_start_date DATE,
    contract_end_date DATE,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DES CONNEXIONS/LIAISONS (AMÉLIORÉE)
-- =====================================================
CREATE TABLE connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    connection_id VARCHAR(20) UNIQUE NOT NULL, -- Format: CONN-001, CONN-002
    client_id INT NOT NULL,
    client_name VARCHAR(100) NOT NULL, -- Redondant mais utile pour les requêtes
    type ENUM('fiber', 'radwin', 'mw_rtn', 'ptn') NOT NULL,
    status ENUM('planned', 'in_progress', 'active', 'suspended', 'terminated', 'deactivated') DEFAULT 'active',
    location VARCHAR(100) NOT NULL,
    capacity VARCHAR(20) NOT NULL, -- "10 Gbps", "1 Gbps"
    vlan VARCHAR(20),
    ip_address VARCHAR(45),
    site VARCHAR(100),
    gateway VARCHAR(45),
    utilization DECIMAL(5,2) DEFAULT 0, -- Pourcentage
    availability DECIMAL(5,2) DEFAULT 0, -- Pourcentage
    created_date DATE NOT NULL,
    commissioning_date DATE,
    deactivation_date DATE,
    sla VARCHAR(20), -- "99.95%"
    assigned_to VARCHAR(100),
    deactivation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DES DEMANDES (AMÉLIORÉE)
-- =====================================================
CREATE TABLE requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(20) UNIQUE NOT NULL, -- Format: REQ-001, REQ-002
    client_name VARCHAR(100) NOT NULL,
    type ENUM('new_connection', 'deactivation', 'modification') NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'in_progress', 'completed', 'in_validation', 'ready_to_start', 'launched', 'in_handover', 'handover_rejected', 'deactivation_requested', 'deactivation_approved', 'deactivation_rejected', 'deactivation_in_progress', 'deactivation_completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    submitted_by VARCHAR(100) NOT NULL,
    submitted_date DATE NOT NULL,
    description TEXT NOT NULL,
    technical_details TEXT,
    expected_sla VARCHAR(20),
    location VARCHAR(100) NOT NULL,
    completion_date DATE,
    delivery_date DATE,
    client_email VARCHAR(100),
    client_contact VARCHAR(100),
    capacity VARCHAR(20),
    province VARCHAR(50),
    city VARCHAR(50),
    purchase_order VARCHAR(50),
    -- Données techniques après lancement
    vlan_client VARCHAR(20),
    ip_client VARCHAR(45),
    type_service VARCHAR(50),
    type_liaison VARCHAR(50),
    router_name VARCHAR(100),
    farend_site VARCHAR(100),
    gateway VARCHAR(45),
    lld_design JSON, -- Stockage JSON pour les designs
    launch_date DATE,
    -- Données pour désactivation
    connection_id VARCHAR(20),
    deactivation_reason TEXT,
    deactivation_date DATE,
    router_deactivation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DES ÉTAPES DE VALIDATION DES DEMANDES
-- =====================================================
CREATE TABLE request_validation_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    step_name VARCHAR(50) NOT NULL,
    validator_role VARCHAR(50) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    validator_id INT,
    validation_date TIMESTAMP NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (validator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE DES ÉTAPES DE HANDOVER
-- =====================================================
CREATE TABLE request_handover_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    step_name VARCHAR(50) NOT NULL,
    validator_role VARCHAR(50) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    validator_id INT,
    validation_date TIMESTAMP NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (validator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE DES ÉTAPES DE DÉSACTIVATION
-- =====================================================
CREATE TABLE request_deactivation_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    step_name VARCHAR(50) NOT NULL,
    validator_role VARCHAR(50) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    validator_id INT,
    validation_date TIMESTAMP NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (validator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE DES INCIDENTS/TICKETS (AMÉLIORÉE)
-- =====================================================
CREATE TABLE incidents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id VARCHAR(20) UNIQUE NOT NULL, -- Format: INC-001, INC-002
    connection_id VARCHAR(20) NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    status ENUM('open', 'acknowledged', 'team_activated', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    ticket_type ENUM('degradation', 'indisponibilite', 'information') NOT NULL,
    reported_by VARCHAR(100) NOT NULL,
    reported_date DATE NOT NULL,
    assigned_to VARCHAR(100),
    sla_deadline VARCHAR(50),
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP NULL,
    activated_team VARCHAR(50),
    activated_at TIMESTAMP NULL,
    screenshot_path VARCHAR(255),
    -- Dates spécifiques pour chaque statut
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP NULL,
    processed_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DE RÉSOLUTION DES TICKETS
-- =====================================================
CREATE TABLE incident_resolution (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    cause TEXT,
    solution TEXT,
    resolution_images JSON, -- Array de chemins d'images
    resolved_by VARCHAR(100) NOT NULL,
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DE TRAITEMENT DES TICKETS
-- =====================================================
CREATE TABLE incident_processing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    root_cause TEXT,
    action_taken TEXT,
    intervention_images JSON, -- Array de chemins d'images
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    gps_address TEXT,
    processed_by VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE D'ACQUITTEMENT GPS
-- =====================================================
CREATE TABLE incident_acknowledgment_gps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DU CYCLE DE VIE DES TICKETS
-- =====================================================
CREATE TABLE incident_lifecycle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user VARCHAR(100) NOT NULL,
    comment TEXT,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DES FACTURES (AMÉLIORÉE)
-- =====================================================
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id VARCHAR(20) UNIQUE NOT NULL, -- Format: INV-001, INV-002
    connection_id VARCHAR(20) NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period VARCHAR(20) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_date DATE,
    attachment_path VARCHAR(255),
    notes TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DES SPARES PARTS (AMÉLIORÉE)
-- =====================================================
CREATE TABLE spare_parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    part_id VARCHAR(20) UNIQUE NOT NULL, -- Format: PART-001, PART-002
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    min_stock INT NOT NULL DEFAULT 0,
    max_stock INT NOT NULL DEFAULT 0,
    current_stock INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2),
    region VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    warehouse VARCHAR(100) NOT NULL,
    supplier VARCHAR(100),
    status ENUM('available', 'low_stock', 'out_of_stock') DEFAULT 'available',
    last_updated DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DES TRANSACTIONS DE SPARES PARTS
-- =====================================================
CREATE TABLE spare_part_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(20) UNIQUE NOT NULL, -- Format: TRANS-001, TRANS-002
    spare_part_id INT NOT NULL,
    type ENUM('in', 'out') NOT NULL,
    quantity INT NOT NULL,
    requester_id INT NOT NULL,
    requester_role VARCHAR(50),
    requester_manager VARCHAR(100),
    reason TEXT NOT NULL,
    region VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP NULL,
    approved_by INT,
    approved_by_role VARCHAR(50),
    comments TEXT,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE DE SUIVI FME (AMÉLIORÉE)
-- =====================================================
CREATE TABLE fme_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fme_id INT NOT NULL,
    incident_id INT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    current_ticket_id VARCHAR(20),
    tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fme_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE DE MONITORING GLOBAL (AMÉLIORÉE)
-- =====================================================
CREATE TABLE client_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    connection_id VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    hour INT NOT NULL,
    uplink_percentage DECIMAL(5, 2),
    downlink_percentage DECIMAL(5, 2),
    uplink_traffic_gbps DECIMAL(10, 2),
    downlink_traffic_gbps DECIMAL(10, 2),
    status ENUM('available', 'degraded', 'unavailable') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_connection_hour (connection_id, date, hour)
);

-- =====================================================
-- TABLE DES NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id VARCHAR(20) UNIQUE NOT NULL, -- Format: NOTIF-001, NOTIF-002
    user_id INT NOT NULL,
    type ENUM('incident', 'request', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_id VARCHAR(20), -- ID de l'incident ou de la demande
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DES LOGS DE NOTIFICATIONS
-- =====================================================
CREATE TABLE notification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_id VARCHAR(20) UNIQUE NOT NULL,
    ticket_id VARCHAR(20) NOT NULL,
    step VARCHAR(50) NOT NULL,
    recipients JSON NOT NULL, -- Array des destinataires
    template VARCHAR(100) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'sent',
    channel ENUM('email', 'sms', 'both') NOT NULL,
    content TEXT NOT NULL
);

-- =====================================================
-- TABLE DES CONFIGURATIONS SYSTÈME
-- =====================================================
CREATE TABLE system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DES LOGS D'ACTIVITÉ
-- =====================================================
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE DES INTÉGRATIONS BASE DE DONNÉES
-- =====================================================
CREATE TABLE database_integrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('mysql', 'postgresql', 'sqlserver', 'oracle', 'mongodb') NOT NULL,
    host VARCHAR(100) NOT NULL,
    port INT NOT NULL,
    database_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_connection TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DES INTÉGRATIONS RÉSEAU
-- =====================================================
CREATE TABLE network_integrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('router', 'switch', 'firewall', 'dns', 'dwdm', 'osn', 'rtn', 'ptn') NOT NULL,
    host VARCHAR(100) NOT NULL,
    port INT NOT NULL,
    protocol ENUM('snmp', 'ssh', 'telnet', 'rest', 'netconf') NOT NULL,
    username VARCHAR(100),
    password VARCHAR(255),
    community_string VARCHAR(100), -- Pour SNMP
    is_active BOOLEAN DEFAULT TRUE,
    last_connection TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DES MÉTRIQUES RÉSEAU
-- =====================================================
CREATE TABLE network_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- cpu, memory, temperature, etc.
    metric_value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES network_integrations(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEX POUR OPTIMISATION DES PERFORMANCES
-- =====================================================

-- Index pour les utilisateurs
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_sub_department ON users(sub_department);

-- Index pour les connexions
CREATE INDEX idx_connections_client ON connections(client_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_type ON connections(type);
CREATE INDEX idx_connections_assigned_to ON connections(assigned_to);

-- Index pour les demandes
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_type ON requests(type);
CREATE INDEX idx_requests_submitted_by ON requests(submitted_by);
CREATE INDEX idx_requests_priority ON requests(priority);

-- Index pour les incidents
CREATE INDEX idx_incidents_connection ON incidents(connection_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);

-- Index pour les spares parts
CREATE INDEX idx_spare_parts_category ON spare_parts(category);
CREATE INDEX idx_spare_parts_status ON spare_parts(status);
CREATE INDEX idx_spare_parts_region ON spare_parts(region);
CREATE INDEX idx_spare_parts_city ON spare_parts(city);

-- Index pour les transactions
CREATE INDEX idx_transactions_spare_part ON spare_part_transactions(spare_part_id);
CREATE INDEX idx_transactions_status ON spare_part_transactions(status);
CREATE INDEX idx_transactions_requester ON spare_part_transactions(requester_id);

-- Index pour le monitoring
CREATE INDEX idx_availability_client ON client_availability(client_id);
CREATE INDEX idx_availability_connection ON client_availability(connection_id);
CREATE INDEX idx_availability_date ON client_availability(date);

-- Index pour le tracking FME
CREATE INDEX idx_fme_tracking_fme ON fme_tracking(fme_id);
CREATE INDEX idx_fme_tracking_date ON fme_tracking(tracked_at);
CREATE INDEX idx_fme_tracking_status ON fme_tracking(status);

-- Index pour les notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- =====================================================
-- TRIGGERS POUR MAINTENIR LA COHÉRENCE
-- =====================================================

-- Trigger pour mettre à jour le statut des spares parts
DELIMITER //
CREATE TRIGGER update_spare_part_status
AFTER UPDATE ON spare_parts
FOR EACH ROW
BEGIN
    IF NEW.current_stock <= NEW.min_stock THEN
        UPDATE spare_parts SET status = 'low_stock' WHERE id = NEW.id;
    ELSEIF NEW.current_stock = 0 THEN
        UPDATE spare_parts SET status = 'out_of_stock' WHERE id = NEW.id;
    ELSE
        UPDATE spare_parts SET status = 'available' WHERE id = NEW.id;
    END IF;
END//
DELIMITER ;

-- Trigger pour mettre à jour la date de dernière modification
DELIMITER //
CREATE TRIGGER update_spare_part_last_updated
AFTER UPDATE ON spare_parts
FOR EACH ROW
BEGIN
    UPDATE spare_parts SET last_updated = CURDATE() WHERE id = NEW.id;
END//
DELIMITER ;

-- Trigger pour créer automatiquement des notifications
DELIMITER //
CREATE TRIGGER create_incident_notification
AFTER INSERT ON incidents
FOR EACH ROW
BEGIN
    -- Créer une notification pour les équipes SAV/NOC
    INSERT INTO notifications (notification_id, user_id, type, title, message, related_id)
    SELECT 
        CONCAT('NOTIF-', LPAD(LAST_INSERT_ID(), 6, '0')),
        u.id,
        'incident',
        CONCAT('Nouveau ticket: ', NEW.title),
        CONCAT('Ticket ', NEW.incident_id, ' créé pour ', NEW.client_name),
        NEW.incident_id
    FROM users u 
    WHERE u.role = 'maintenance' 
    AND (u.sub_department = 'SAV' OR u.sub_department = 'NOC')
    AND u.is_active = TRUE;
END//
DELIMITER ;

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue pour le dashboard des spares parts
CREATE VIEW spare_parts_dashboard AS
SELECT 
    sp.*,
    COUNT(spt.id) as total_transactions,
    SUM(CASE WHEN spt.status = 'pending' THEN 1 ELSE 0 END) as pending_transactions
FROM spare_parts sp
LEFT JOIN spare_part_transactions spt ON sp.id = spt.spare_part_id
GROUP BY sp.id;

-- Vue pour les incidents avec détails
CREATE VIEW incidents_with_details AS
SELECT 
    i.*,
    c.connection_id,
    c.client_id,
    c.client_name,
    c.type as connection_type,
    c.location as connection_location
FROM incidents i
LEFT JOIN connections c ON i.connection_id = c.connection_id;

-- Vue pour les demandes avec détails
CREATE VIEW requests_with_details AS
SELECT 
    r.*,
    COUNT(rvs.id) as validation_steps_count,
    COUNT(CASE WHEN rvs.status = 'pending' THEN 1 END) as pending_validations
FROM requests r
LEFT JOIN request_validation_steps rvs ON r.id = rvs.request_id
GROUP BY r.id;

-- Vue pour les notifications non lues
CREATE VIEW unread_notifications AS
SELECT 
    n.*,
    u.name as user_name,
    u.role as user_role
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.is_read = FALSE
ORDER BY n.created_at DESC;

-- Vue pour le monitoring global
CREATE VIEW global_monitoring AS
SELECT 
    ca.*,
    c.client_name,
    c.type as connection_type,
    c.capacity
FROM client_availability ca
JOIN connections c ON ca.connection_id = c.connection_id
WHERE ca.date = CURDATE()
ORDER BY ca.hour DESC;

-- =====================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (user_id, username, password, name, email, role) VALUES 
('USER-001', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur', 'admin@monitoring.com', 'admin');

-- Insertion de configurations système par défaut
INSERT INTO system_config (config_key, config_value, description) VALUES
('auto_close_resolved_tickets_hours', '48', 'Nombre d\'heures avant fermeture automatique des tickets résolus'),
('alert_unprocessed_tickets_hours', '5', 'Nombre d\'heures avant alerte pour tickets non traités'),
('default_ticket_priority', 'medium', 'Priorité par défaut pour les nouveaux tickets'),
('system_timezone', 'Africa/Kinshasa', 'Fuseau horaire du système'),
('notification_email_enabled', 'true', 'Activer les notifications par email'),
('notification_sms_enabled', 'true', 'Activer les notifications par SMS'),
('backup_interval_hours', '2', 'Intervalle de sauvegarde automatique en heures'),
('cache_ttl_minutes', '10', 'Durée de vie du cache en minutes');

-- =====================================================
-- FIN DU SCHÉMA AMÉLIORÉ
-- =====================================================
