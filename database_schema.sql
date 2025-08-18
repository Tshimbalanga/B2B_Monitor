-- =====================================================
-- BASE DE DONNÉES MONITORING B2B
-- =====================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS monitoring_b2b;
USE monitoring_b2b;

-- =====================================================
-- TABLE DES UTILISATEURS
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'super_admin', 'commercial', 'project', 'maintenance', 'noc', 'sav', 'fme', 'bo', 'client') NOT NULL,
    sub_department VARCHAR(50),
    manager_email VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE DES CLIENTS
-- =====================================================
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
-- TABLE DES CONNEXIONS/LIAISONS
-- =====================================================
CREATE TABLE connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    connection_id VARCHAR(20) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    connection_type ENUM('fiber', 'radio', 'satellite', 'ethernet') NOT NULL,
    bandwidth VARCHAR(20),
    ip_address VARCHAR(45),
    location VARCHAR(100),
    region VARCHAR(50),
    city VARCHAR(50),
    status ENUM('active', 'inactive', 'maintenance', 'deactivated') DEFAULT 'active',
    assigned_to VARCHAR(50),
    installation_date DATE,
    last_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DES DEMANDES DE NOUVELLES CONNEXIONS
-- =====================================================
CREATE TABLE connection_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(20) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    requester_id INT NOT NULL,
    connection_type ENUM('fiber', 'radio', 'satellite', 'ethernet') NOT NULL,
    bandwidth VARCHAR(20),
    location VARCHAR(100),
    region VARCHAR(50),
    city VARCHAR(50),
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'approved', 'rejected', 'in_progress', 'completed') DEFAULT 'pending',
    reason TEXT,
    expected_delivery_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DES DEMANDES DE DÉSACTIVATION
-- =====================================================
CREATE TABLE deactivation_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(20) UNIQUE NOT NULL,
    connection_id INT NOT NULL,
    requester_id INT NOT NULL,
    reason TEXT NOT NULL,
    deactivation_date DATE NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    technical_details TEXT,
    status ENUM('pending', 'validated', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DES ÉTAPES DE VALIDATION DES DÉSACTIVATIONS
-- =====================================================
CREATE TABLE deactivation_validation_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    deactivation_request_id INT NOT NULL,
    step_name VARCHAR(50) NOT NULL,
    validator_role VARCHAR(50) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    validator_id INT,
    validation_date TIMESTAMP NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deactivation_request_id) REFERENCES deactivation_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (validator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE DES INCIDENTS/TICKETS
-- =====================================================
CREATE TABLE incidents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    connection_id INT NOT NULL,
    reported_by INT NOT NULL,
    assigned_to VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    ticket_type ENUM('degradation', 'unavailability', 'information_request') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    status ENUM('open', 'acknowledged', 'in_progress', 'resolved', 'closed', 'reopened') DEFAULT 'open',
    screenshot_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DU CYCLE DE VIE DES TICKETS
-- =====================================================
CREATE TABLE ticket_lifecycle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    status ENUM('open', 'acknowledged', 'in_progress', 'resolved', 'closed', 'reopened') NOT NULL,
    changed_by INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    gps_address TEXT,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DU TRAITEMENT DES TICKETS
-- =====================================================
CREATE TABLE ticket_processing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    processor_id INT NOT NULL,
    root_cause TEXT,
    action_taken TEXT,
    intervention_images TEXT, -- JSON array of image paths
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    gps_address TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (processor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DE RÉSOLUTION DES TICKETS
-- =====================================================
CREATE TABLE ticket_resolution (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    resolver_id INT NOT NULL,
    cause TEXT,
    solution TEXT,
    resolution_images TEXT, -- JSON array of image paths
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (resolver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DES COMMENTAIRES SUR LES TICKETS
-- =====================================================
CREATE TABLE ticket_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    commenter_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (commenter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DES FACTURES
-- =====================================================
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    connection_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period VARCHAR(20),
    due_date DATE,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_date DATE,
    attachment_path VARCHAR(255),
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DES SPARES PARTS (ÉQUIPEMENTS)
-- =====================================================
CREATE TABLE spare_parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    part_id VARCHAR(20) UNIQUE NOT NULL,
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
    transaction_id VARCHAR(20) UNIQUE NOT NULL,
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
-- TABLE DES LOCALISATIONS DE SPARES PARTS
-- =====================================================
CREATE TABLE spare_part_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    spare_part_id INT NOT NULL,
    region VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    warehouse VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE DE SUIVI FME
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
-- TABLE DE MONITORING GLOBAL (DISPONIBILITÉ)
-- =====================================================
CREATE TABLE client_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    connection_id INT NOT NULL,
    date DATE NOT NULL,
    hour INT NOT NULL,
    uplink_percentage DECIMAL(5, 2),
    downlink_percentage DECIMAL(5, 2),
    uplink_traffic_gbps DECIMAL(10, 2),
    downlink_traffic_gbps DECIMAL(10, 2),
    status ENUM('available', 'degraded', 'unavailable') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
    UNIQUE KEY unique_connection_hour (connection_id, date, hour)
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
-- INDEX POUR OPTIMISATION DES PERFORMANCES
-- =====================================================

-- Index pour les utilisateurs
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Index pour les connexions
CREATE INDEX idx_connections_client ON connections(client_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_region ON connections(region);

-- Index pour les incidents
CREATE INDEX idx_incidents_connection ON incidents(connection_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);

-- Index pour les spares parts
CREATE INDEX idx_spare_parts_category ON spare_parts(category);
CREATE INDEX idx_spare_parts_status ON spare_parts(status);
CREATE INDEX idx_spare_parts_region ON spare_parts(region);

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
        SET NEW.status = 'low_stock';
    ELSEIF NEW.current_stock = 0 THEN
        SET NEW.status = 'out_of_stock';
    ELSE
        SET NEW.status = 'available';
    END IF;
END//
DELIMITER ;

-- Trigger pour mettre à jour la date de dernière modification
DELIMITER //
CREATE TRIGGER update_spare_part_last_updated
AFTER UPDATE ON spare_parts
FOR EACH ROW
BEGIN
    SET NEW.last_updated = CURDATE();
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
    cl.name as client_name,
    u.name as reporter_name,
    u.role as reporter_role
FROM incidents i
JOIN connections c ON i.connection_id = c.id
JOIN clients cl ON c.client_id = cl.id
JOIN users u ON i.reported_by = u.id;

-- Vue pour les transactions avec détails
CREATE VIEW transactions_with_details AS
SELECT 
    spt.*,
    sp.name as spare_part_name,
    sp.category,
    sp.unit,
    u.name as requester_name,
    u.role as requester_role
FROM spare_part_transactions spt
JOIN spare_parts sp ON spt.spare_part_id = sp.id
JOIN users u ON spt.requester_id = u.id;

-- =====================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (username, password, name, email, role) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur', 'admin@monitoring.com', 'admin');

-- Insertion de configurations système par défaut
INSERT INTO system_config (config_key, config_value, description) VALUES
('auto_close_resolved_tickets_hours', '24', 'Nombre d\'heures avant fermeture automatique des tickets résolus'),
('alert_unprocessed_tickets_hours', '4', 'Nombre d\'heures avant alerte pour tickets non traités'),
('default_ticket_priority', 'medium', 'Priorité par défaut pour les nouveaux tickets'),
('system_timezone', 'Africa/Kinshasa', 'Fuseau horaire du système');

-- =====================================================
-- FIN DU SCHÉMA
-- =====================================================
