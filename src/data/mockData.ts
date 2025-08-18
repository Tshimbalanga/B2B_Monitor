import { User, Connection, Request, Incident, MonitoringData, Alert } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@orange.com',
    role: 'commercial',
    department: 'Ventes B2B',
    managerEmail: 'directeur.ventes@orange.com',
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'marie.martin@orange.com',
    role: 'project',
    department: 'Déploiement',
  },
  {
    id: '3',
    name: 'Pierre Durand',
    email: 'pierre.durand@orange.com',
    role: 'maintenance',
    department: 'Exploitation',
    subDepartment: 'SAV',
  },
  {
    id: '4',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@client.com',
    role: 'client',
    department: 'IT Manager',
  },
  {
    id: '5',
    name: 'Admin System',
    email: 'admin@orange.com',
    role: 'admin',
    department: 'Système',
  },
  {
    id: '6',
    name: 'Super Admin',
    email: 'superadmin@orange.com',
    role: 'super_admin',
    department: 'Système',
  },
  {
    id: '7',
    name: 'Thomas Recouvrement',
    email: 'thomas.recouvrement@orange.com',
    role: 'recouvrement',
    department: 'Finance',
  },
  {
    id: '8',
    name: 'Lisa Facturation',
    email: 'lisa.facturation@orange.com',
    role: 'facturation',
    department: 'Finance',
  },
  {
    id: '9',
    name: 'Marc SAV',
    email: 'marc.sav@orange.com',
    role: 'maintenance',
    department: 'Exploitation',
    subDepartment: 'SAV',
  },
  {
    id: '10',
    name: 'Nathalie BO',
    email: 'nathalie.bo@orange.com',
    role: 'maintenance',
    department: 'Exploitation',
    subDepartment: 'BO',
  },
  {
    id: '11',
    name: 'David FME',
    email: 'david.fme@orange.com',
    role: 'maintenance',
    department: 'Exploitation',
    subDepartment: 'FME',
  },
  {
    id: '12',
    name: 'Caroline NOC',
    email: 'caroline.noc@orange.com',
    role: 'maintenance',
    department: 'Exploitation',
    subDepartment: 'NOC',
  },
  {
    id: '13',
    name: 'Paul FME Test',
    email: 'paul.fme@orange.com',
    role: 'maintenance',
    department: 'Exploitation',
    subDepartment: 'FME',
  },
];

// Mots de passe de test (en production, cela serait géré par le backend)
export const mockPasswords: Record<string, string> = {
  'jean.dupont@orange.com': 'password123',
  'marie.martin@orange.com': 'password123',
  'pierre.durand@orange.com': 'password123',
  'sophie.bernard@client.com': 'password123',
  'admin@orange.com': 'admin123',
  'superadmin@orange.com': 'super123',
  'thomas.recouvrement@orange.com': 'password123',
  'lisa.facturation@orange.com': 'password123',
  'marc.sav@orange.com': 'password123',
  'nathalie.bo@orange.com': 'password123',
  'david.fme@orange.com': 'password123',
  'caroline.noc@orange.com': 'password123',
  'paul.fme@orange.com': 'password123',
};

export const mockConnections: Connection[] = [
  {
    id: 'CONN-001',
    clientId: 'CLIENT-001',
    clientName: 'TechCorp Solutions',
    type: 'fiber',
    status: 'active',
    location: 'Paris La Défense',
    capacity: '10 Gbps',
    vlan: 'VLAN-100',
    ipAddress: '192.168.1.10/24',
    site: 'Site-PAR-001',
    gateway: '192.168.1.1',
    utilization: 65,
    availability: 99.9,
    createdDate: '2024-01-15',
    commissioningDate: '2024-02-01',
    sla: '99.95%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-002',
    clientId: 'CLIENT-002',
    clientName: 'Global Industries',
    type: 'mw_rtn',
    status: 'active',
    location: 'Lyon Part-Dieu',
    capacity: '1 Gbps',
    vlan: 'VLAN-200',
    ipAddress: '192.168.2.10/24',
    site: 'Site-LYO-001',
    gateway: '192.168.2.1',
    utilization: 78,
    availability: 99.8,
    createdDate: '2024-01-20',
    commissioningDate: '2024-02-15',
    sla: '99.9%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-003',
    clientId: 'CLIENT-001',
    clientName: 'TechCorp Solutions',
    type: 'ptn',
    status: 'in_progress',
    location: 'Marseille Centre',
    capacity: '100 Mbps',
    vlan: 'VLAN-300',
    ipAddress: '192.168.3.10/24',
    site: 'Site-MAR-001',
    gateway: '192.168.3.1',
    utilization: 0,
    availability: 0,
    createdDate: '2024-12-01',
    sla: '99.9%',
    assignedTo: 'Marie Martin',
  },
  {
    id: 'CONN-004',
    clientId: 'CLIENT-003',
    clientName: 'Hôpital Général de Kinshasa',
    type: 'fiber',
    status: 'active',
    location: 'Kinshasa, Gombe',
    capacity: '2 Gbps',
    vlan: 'VLAN-400',
    ipAddress: '192.168.4.10/24',
    site: 'Site-KIN-001',
    gateway: '192.168.4.1',
    utilization: 45,
    availability: 99.95,
    createdDate: '2024-01-25',
    commissioningDate: '2024-02-20',
    sla: '99.99%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-005',
    clientId: 'CLIENT-004',
    clientName: 'Banque Centrale du Congo',
    type: 'fiber',
    status: 'active',
    location: 'Kinshasa, Limete',
    capacity: '5 Gbps',
    vlan: 'VLAN-500',
    ipAddress: '192.168.5.10/24',
    site: 'Site-KIN-002',
    gateway: '192.168.5.1',
    utilization: 82,
    availability: 99.98,
    createdDate: '2024-01-30',
    commissioningDate: '2024-02-25',
    sla: '99.99%',
    assignedTo: 'Marie Martin',
  },
  {
    id: 'CONN-006',
    clientId: 'CLIENT-005',
    clientName: 'Université de Kinshasa',
    type: 'mw_rtn',
    status: 'active',
    location: 'Kinshasa, Lemba',
    capacity: '1 Gbps',
    vlan: 'VLAN-600',
    ipAddress: '192.168.6.10/24',
    site: 'Site-KIN-003',
    gateway: '192.168.6.1',
    utilization: 35,
    availability: 99.7,
    createdDate: '2024-02-05',
    commissioningDate: '2024-02-28',
    sla: '99.9%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-007',
    clientId: 'CLIENT-006',
    clientName: 'Société Minière du Katanga',
    type: 'ptn',
    status: 'active',
    location: 'Lubumbashi, Centre',
    capacity: '500 Mbps',
    vlan: 'VLAN-700',
    ipAddress: '192.168.7.10/24',
    site: 'Site-LUB-001',
    gateway: '192.168.7.1',
    utilization: 68,
    availability: 99.5,
    createdDate: '2024-02-10',
    commissioningDate: '2024-03-01',
    sla: '99.9%',
    assignedTo: 'Marie Martin',
  },
  {
    id: 'CONN-008',
    clientId: 'CLIENT-007',
    clientName: 'Port de Matadi',
    type: 'fiber',
    status: 'active',
    location: 'Matadi, Port',
    capacity: '1 Gbps',
    vlan: 'VLAN-800',
    ipAddress: '192.168.8.10/24',
    site: 'Site-MAT-001',
    gateway: '192.168.8.1',
    utilization: 55,
    availability: 99.8,
    createdDate: '2024-02-15',
    commissioningDate: '2024-03-05',
    sla: '99.9%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-009',
    clientId: 'CLIENT-009',
    clientName: 'Ministère des Finances RDC',
    type: 'fiber',
    status: 'active',
    location: 'Kinshasa, Gombe',
    capacity: '5 Gbps',
    vlan: 'VLAN-900',
    ipAddress: '192.168.9.10/24',
    site: 'Site-KIN-009',
    gateway: '192.168.9.1',
    utilization: 68,
    availability: 99.92,
    createdDate: '2024-01-10',
    commissioningDate: '2024-02-05',
    sla: '99.95%',
    assignedTo: 'Marie Martin',
  },
  {
    id: 'CONN-010',
    clientId: 'CLIENT-010',
    clientName: 'Société Minière du Katanga',
    type: 'mw_rtn',
    status: 'active',
    location: 'Lubumbashi, Centre',
    capacity: '2 Gbps',
    vlan: 'VLAN-1000',
    ipAddress: '192.168.10.10/24',
    site: 'Site-LUB-001',
    gateway: '192.168.10.1',
    utilization: 75,
    availability: 99.85,
    createdDate: '2024-01-05',
    commissioningDate: '2024-01-30',
    sla: '99.9%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-011',
    clientId: 'CLIENT-011',
    clientName: 'Banque Commerciale du Congo',
    type: 'fiber',
    status: 'active',
    location: 'Kinshasa, Ngaliema',
    capacity: '10 Gbps',
    vlan: 'VLAN-1100',
    ipAddress: '192.168.11.10/24',
    site: 'Site-KIN-011',
    gateway: '192.168.11.1',
    utilization: 82,
    availability: 99.98,
    createdDate: '2024-01-08',
    commissioningDate: '2024-02-03',
    sla: '99.99%',
    assignedTo: 'Marie Martin',
  },
  {
    id: 'CONN-012',
    clientId: 'CLIENT-012',
    clientName: 'Université de Lubumbashi',
    type: 'ptn',
    status: 'active',
    location: 'Lubumbashi, Campus',
    capacity: '1 Gbps',
    vlan: 'VLAN-1200',
    ipAddress: '192.168.12.10/24',
    site: 'Site-LUB-002',
    gateway: '192.168.12.1',
    utilization: 45,
    availability: 99.7,
    createdDate: '2024-01-12',
    commissioningDate: '2024-02-07',
    sla: '99.9%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-013',
    clientId: 'CLIENT-013',
    clientName: 'Hôpital Provincial du Katanga',
    type: 'fiber',
    status: 'active',
    location: 'Lubumbashi, Centre Médical',
    capacity: '2 Gbps',
    vlan: 'VLAN-1300',
    ipAddress: '192.168.13.10/24',
    site: 'Site-LUB-003',
    gateway: '192.168.13.1',
    utilization: 60,
    availability: 99.95,
    createdDate: '2024-01-15',
    commissioningDate: '2024-02-10',
    sla: '99.99%',
    assignedTo: 'Marie Martin',
  },
  {
    id: 'CONN-014',
    clientId: 'CLIENT-014',
    clientName: 'Société de Télécommunications RDC',
    type: 'mw_rtn',
    status: 'active',
    location: 'Kinshasa, Limete',
    capacity: '5 Gbps',
    vlan: 'VLAN-1400',
    ipAddress: '192.168.14.10/24',
    site: 'Site-KIN-014',
    gateway: '192.168.14.1',
    utilization: 70,
    availability: 99.88,
    createdDate: '2024-01-18',
    commissioningDate: '2024-02-13',
    sla: '99.95%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-015',
    clientId: 'CLIENT-015',
    clientName: 'Institut National de Recherche',
    type: 'fiber',
    status: 'active',
    location: 'Kinshasa, Campus Scientifique',
    capacity: '1 Gbps',
    vlan: 'VLAN-1500',
    ipAddress: '192.168.15.10/24',
    site: 'Site-KIN-015',
    gateway: '192.168.15.1',
    utilization: 35,
    availability: 99.8,
    createdDate: '2024-01-20',
    commissioningDate: '2024-02-15',
    sla: '99.9%',
    assignedTo: 'Marie Martin',
  },
  {
    id: 'CONN-016',
    clientId: 'CLIENT-016',
    clientName: 'Port de Matadi',
    type: 'ptn',
    status: 'active',
    location: 'Matadi, Zone Portuaire',
    capacity: '500 Mbps',
    vlan: 'VLAN-1600',
    ipAddress: '192.168.16.10/24',
    site: 'Site-MAT-001',
    gateway: '192.168.16.1',
    utilization: 55,
    availability: 99.75,
    createdDate: '2024-01-22',
    commissioningDate: '2024-02-17',
    sla: '99.9%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-017',
    clientId: 'CLIENT-017',
    clientName: 'Aéroport International de Kinshasa',
    type: 'fiber',
    status: 'active',
    location: 'Kinshasa, Aéroport',
    capacity: '3 Gbps',
    vlan: 'VLAN-1700',
    ipAddress: '192.168.17.10/24',
    site: 'Site-KIN-017',
    gateway: '192.168.17.1',
    utilization: 65,
    availability: 99.9,
    createdDate: '2024-01-25',
    commissioningDate: '2024-02-20',
    sla: '99.95%',
    assignedTo: 'Marie Martin',
  },
  {
    id: 'CONN-018',
    clientId: 'CLIENT-018',
    clientName: 'Centre Commercial Kinshasa',
    type: 'mw_rtn',
    status: 'active',
    location: 'Kinshasa, Centre Commercial',
    capacity: '1 Gbps',
    vlan: 'VLAN-1800',
    ipAddress: '192.168.18.10/24',
    site: 'Site-KIN-018',
    gateway: '192.168.18.1',
    utilization: 40,
    availability: 99.7,
    createdDate: '2024-01-28',
    commissioningDate: '2024-02-23',
    sla: '99.9%',
    assignedTo: 'Pierre Durand',
  },
  {
    id: 'CONN-019',
    clientId: 'CLIENT-019',
    clientName: 'Société Pétrolière du Congo',
    type: 'fiber',
    status: 'active',
    location: 'Pointe-Noire, Zone Industrielle',
    capacity: '10 Gbps',
    vlan: 'VLAN-1900',
    ipAddress: '192.168.19.10/24',
    site: 'Site-PNT-001',
    gateway: '192.168.19.1',
    utilization: 85,
    availability: 99.98,
    createdDate: '2024-01-30',
    commissioningDate: '2024-02-25',
    sla: '99.99%',
    assignedTo: 'Marie Martin',
  },
  {
    id: 'CONN-020',
    clientId: 'CLIENT-020',
    clientName: 'Université de Goma',
    type: 'ptn',
    status: 'active',
    location: 'Goma, Campus Universitaire',
    capacity: '500 Mbps',
    vlan: 'VLAN-2000',
    ipAddress: '192.168.20.10/24',
    site: 'Site-GOM-001',
    gateway: '192.168.20.1',
    utilization: 30,
    availability: 99.6,
    createdDate: '2024-02-01',
    commissioningDate: '2024-02-28',
    sla: '99.9%',
    assignedTo: 'Pierre Durand',
  },
];

export const mockRequests: Request[] = [
  {
    id: 'REQ-001',
    clientName: 'TechCorp Solutions',
    type: 'new_connection',
    status: 'in_validation',
    priority: 'high',
    submittedBy: 'Jean Dupont',
    submittedDate: '2024-01-15T10:30:00Z',
    description: 'Nouvelle liaison fibre optique pour expansion réseau',
    expectedSLA: '14 jours',
    clientEmail: 'contact@techcorp.com',
    location: 'Paris La Défense',
    capacity: '10 Gbps',
    clientContact: 'Marc Dubois',
    expectedDeliveryDate: '2024-02-15',
    purchaseOrder: 'PO-2024-001',
    validationSteps: [
      {
        id: 'manager_validation',
        title: 'Validation Manager',
        role: 'commercial',
        status: 'pending',
        requiredRoles: ['commercial', 'admin'],
        icon: '👔',
        color: '#3b82f6'
      },
      {
        id: 'project_validation',
        title: 'Validation Projet',
        role: 'project',
        status: 'pending',
        requiredRoles: ['project', 'admin'],
        icon: '📋',
        color: '#059669'
      },
      {
        id: 'maintenance_validation',
        title: 'Validation Maintenance',
        role: 'maintenance',
        status: 'pending',
        requiredRoles: ['maintenance', 'admin'],
        icon: '🔧',
        color: '#d97706'
      }
    ]
  },
  {
    id: 'REQ-002',
    clientName: 'Global Industries',
    type: 'new_connection',
    status: 'launched',
    priority: 'medium',
    submittedBy: 'Marie Martin',
    submittedDate: '2024-01-10T14:20:00Z',
    description: 'Connexion micro-ondes pour site distant',
    expectedSLA: '14 jours',
    clientEmail: 'info@globalind.com',
    location: 'Lyon Part-Dieu',
    capacity: '1 Gbps',
    clientContact: 'Sophie Laurent',
    expectedDeliveryDate: '2024-02-10',
    purchaseOrder: 'PO-2024-002',
    // Données techniques pour le lancement
    vlanClient: '200',
    ipClient: '192.168.2.10/24',
    typeService: 'mw_rtn',
    typeLiaison: 'Point-to-Point',
    routerName: 'RT-LYO-001',
    farendSite: 'Site-LYO-001',
    gateway: '192.168.2.1',
    validationSteps: [
      {
        id: 'manager_validation',
        title: 'Validation Manager',
        role: 'commercial',
        status: 'approved',
        validatedBy: 'Jean Dupont',
        validatedAt: '2024-01-12T09:15:00Z',
        requiredRoles: ['commercial', 'admin'],
        icon: '👔',
        color: '#3b82f6'
      },
      {
        id: 'project_validation',
        title: 'Validation Projet',
        role: 'project',
        status: 'approved',
        validatedBy: 'Marie Martin',
        validatedAt: '2024-01-14T11:30:00Z',
        requiredRoles: ['project', 'admin'],
        icon: '📋',
        color: '#059669'
      },
      {
        id: 'maintenance_validation',
        title: 'Validation Maintenance',
        role: 'maintenance',
        status: 'approved',
        validatedBy: 'Pierre Durand',
        validatedAt: '2024-01-16T15:30:00Z',
        requiredRoles: ['maintenance', 'admin'],
        icon: '🔧',
        color: '#d97706'
      }
    ]
  },
  // Demande lancée supplémentaire pour test handover
  {
    id: 'REQ-004',
    clientName: 'Digital Solutions SA',
    type: 'new_connection',
    status: 'launched',
    priority: 'high',
    submittedBy: 'Sophie Bernard',
    submittedDate: '2024-01-15T10:30:00Z',
    description: 'Connexion fibre optique pour centre de données',
    expectedSLA: '14 jours',
    clientEmail: 'info@digitalsolutions.com',
    location: 'Marseille Vieux-Port',
    capacity: '5 Gbps',
    clientContact: 'Thomas Moreau',
    expectedDeliveryDate: '2024-02-15',
    purchaseOrder: 'PO-2024-004',
    // Données techniques pour le lancement
    vlanClient: '300',
    ipClient: '192.168.3.10/24',
    typeService: 'fiber',
    typeLiaison: 'Point-to-Point',
    routerName: 'RT-MRS-001',
    farendSite: 'Site-MRS-001',
    gateway: '192.168.3.1',
    validationSteps: [
      {
        id: 'manager_validation',
        title: 'Validation Manager',
        role: 'commercial',
        status: 'approved',
        validatedBy: 'Jean Dupont',
        validatedAt: '2024-01-17T09:15:00Z',
        requiredRoles: ['commercial', 'admin'],
        icon: '👔',
        color: '#3b82f6'
      },
      {
        id: 'project_validation',
        title: 'Validation Projet',
        role: 'project',
        status: 'approved',
        validatedBy: 'Marie Martin',
        validatedAt: '2024-01-19T11:30:00Z',
        requiredRoles: ['project', 'admin'],
        icon: '📋',
        color: '#059669'
      },
      {
        id: 'maintenance_validation',
        title: 'Validation Maintenance',
        role: 'maintenance',
        status: 'approved',
        validatedBy: 'Pierre Durand',
        validatedAt: '2024-01-21T15:30:00Z',
        requiredRoles: ['maintenance', 'admin'],
        icon: '🔧',
        color: '#d97706'
      }
    ]
  },
  // Demandes de désactivation de test
  {
    id: 'REQ-003',
    clientName: 'TechCorp Solutions',
    type: 'deactivation',
    status: 'deactivation_requested',
    priority: 'high',
    submittedBy: 'Jean Dupont',
    submittedDate: '2024-01-20T09:00:00Z',
    description: 'Demande de désactivation de la liaison fibre optique',
    expectedSLA: '7 jours',
    clientEmail: 'contact@techcorp.com',
    location: 'Paris La Défense',
    capacity: '10 Gbps',
    clientContact: 'Marc Dubois',
    expectedDeliveryDate: '2024-01-27',
    deactivationReason: 'client_request',
    connectionId: 'CONN-001',
    deactivationSteps: [
      {
        id: 'maintenance_validation',
        title: 'Validation Maintenance',
        role: 'maintenance',
        status: 'pending',
        requiredRoles: ['maintenance', 'admin'],
        icon: '🔧',
        color: '#d97706'
      },
      {
        id: 'project_validation',
        title: 'Validation Projet',
        role: 'project',
        status: 'pending',
        requiredRoles: ['project', 'admin'],
        icon: '📋',
        color: '#059669'
      }
    ]
  },
  {
    id: 'REQ-004',
    clientName: 'Global Industries',
    type: 'deactivation',
    status: 'deactivation_approved',
    priority: 'medium',
    submittedBy: 'Marie Martin',
    submittedDate: '2024-01-18T14:30:00Z',
    description: 'Désactivation de la connexion micro-ondes',
    expectedSLA: '7 jours',
    clientEmail: 'info@globalind.com',
    location: 'Lyon Part-Dieu',
    capacity: '1 Gbps',
    clientContact: 'Sophie Laurent',
    expectedDeliveryDate: '2024-01-25',
    deactivationReason: 'payment_issues',
    connectionId: 'CONN-002',
    deactivationSteps: [
      {
        id: 'maintenance_validation',
        title: 'Validation Maintenance',
        role: 'maintenance',
        status: 'approved',
        validatedBy: 'Pierre Durand',
        validatedAt: '2024-01-19T10:15:00Z',
        requiredRoles: ['maintenance', 'admin'],
        icon: '🔧',
        color: '#d97706'
      },
      {
        id: 'project_validation',
        title: 'Validation Projet',
        role: 'project',
        status: 'pending',
        requiredRoles: ['project', 'admin'],
        icon: '📋',
        color: '#059669'
      }
    ]
  }
];

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    connectionId: 'CONN-001',
    clientName: 'TechCorp Solutions',
    title: 'Dégradation de performance',
    description: 'Latence élevée constatée depuis 2h',
    severity: 'medium',
    status: 'in_progress',
    priority: 'medium',
    ticketType: 'degradation',
    reportedBy: 'Marc SAV',
    reportedDate: '2024-12-16T08:30:00',
    assignedTo: 'maintenance',
    slaDeadline: '2024-12-16T16:30:00',
    ticketLifecycle: [
      {
        step: 'created',
        status: 'completed',
        timestamp: '2024-12-16T08:30:00',
        user: 'Marc SAV',
        comment: 'Ticket créé automatiquement'
      },
      {
        step: 'acknowledged',
        status: 'completed',
        timestamp: '2024-12-16T08:35:00',
        user: 'Pierre Durand',
        comment: 'Ticket acquitté'
      },
      {
        step: 'team_activated',
        status: 'completed',
        timestamp: '2024-12-16T08:40:00',
        user: 'Pierre Durand',
        comment: 'Équipe SAV activée'
      }
    ],
    acknowledgedBy: 'Pierre Durand',
    acknowledgedAt: '2024-12-16T08:35:00',
    activatedTeam: 'SAV',
    activatedAt: '2024-12-16T08:40:00',
    acknowledgmentGPS: {
      latitude: '-4.4419',
      longitude: '15.2663',
      address: 'Kinshasa, Gombe, Boulevard du 30 Juin'
    }
  },
  {
    id: 'INC-002',
    connectionId: 'CONN-002',
    title: 'Interruption de service',
    description: 'Liaison indisponible',
    severity: 'critical',
    status: 'resolved',
    priority: 'critical',
    ticketType: 'indisponibilite',
    reportedBy: 'Nathalie BO',
    reportedDate: '2024-12-15T14:00:00',
    assignedTo: 'maintenance',
    slaDeadline: '2024-12-15T16:00:00',
    resolution: 'Remplacement équipement défaillant',
    clientName: 'Global Industries',
    ticketLifecycle: [
      {
        step: 'created',
        status: 'completed',
        timestamp: '2024-12-15T14:00:00',
        user: 'Nathalie BO',
        comment: 'Ticket créé automatiquement'
      },
      {
        step: 'acknowledged',
        status: 'completed',
        timestamp: '2024-12-15T14:05:00',
        user: 'Pierre Durand',
        comment: 'Ticket acquitté'
      },
      {
        step: 'team_activated',
        status: 'completed',
        timestamp: '2024-12-15T14:10:00',
        user: 'Pierre Durand',
        comment: 'Équipe BO activée'
      },
      {
        step: 'resolved',
        status: 'completed',
        timestamp: '2024-12-15T15:30:00',
        user: 'David FME',
        comment: 'Équipement remplacé'
      }
    ],
    acknowledgedBy: 'Pierre Durand',
    acknowledgedAt: '2024-12-15T14:05:00',
    activatedTeam: 'BO',
    activatedAt: '2024-12-15T14:10:00',
    acknowledgmentGPS: {
      latitude: '-4.4419',
      longitude: '15.2663',
      address: 'Kinshasa, Limete, Avenue de la Justice'
    }
  },
  {
    id: 'INC-003',
    connectionId: 'CONN-003',
    title: 'Demande d\'information',
    description: 'Besoin d\'informations sur la configuration',
    severity: 'low',
    status: 'open',
    priority: 'low',
    ticketType: 'information',
    reportedBy: 'Caroline NOC',
    reportedDate: '2024-12-16T10:00:00',
    assignedTo: 'maintenance',
    slaDeadline: '2024-12-16T18:00:00',
    clientName: 'TechCorp Solutions',
    ticketLifecycle: [
      {
        step: 'created',
        status: 'completed',
        timestamp: '2024-12-16T10:00:00',
        user: 'Caroline NOC',
        comment: 'Ticket créé automatiquement'
      }
    ]
  },
  {
    id: 'INC-004',
    connectionId: 'CONN-001',
    title: 'Dégradation de performance',
    description: 'Liaison lente et instable depuis 2 heures',
    severity: 'medium',
    status: 'acknowledged',
    priority: 'medium',
    ticketType: 'degradation',
    reportedBy: 'Client TechCorp',
    reportedDate: '2024-12-16T11:30:00',
    assignedTo: 'maintenance',
    slaDeadline: '2024-12-16T15:30:00',
    clientName: 'TechCorp Solutions',
    ticketLifecycle: [
      {
        step: 'created',
        status: 'completed',
        timestamp: '2024-12-16T11:30:00',
        user: 'Client TechCorp',
        comment: 'Ticket créé automatiquement'
      },
      {
        step: 'acknowledged',
        status: 'completed',
        timestamp: '2024-12-16T11:35:00',
        user: 'Pierre Durand',
        comment: 'Ticket acquitté et en attente de traitement'
      }
    ],
    acknowledgedBy: 'Pierre Durand',
    acknowledgedAt: '2024-12-16T11:35:00'
  },
  {
    id: 'INC-005',
    connectionId: 'CONN-002',
    title: 'Problème de connectivité',
    description: 'Connexion intermittente sur la liaison principale',
    severity: 'high',
    status: 'acknowledged',
    priority: 'high',
    ticketType: 'degradation',
    reportedBy: 'Nathalie BO',
    reportedDate: '2024-12-16T12:00:00',
    assignedTo: 'maintenance',
    slaDeadline: '2024-12-16T14:00:00',
    clientName: 'Global Industries',
    ticketLifecycle: [
      {
        step: 'created',
        status: 'completed',
        timestamp: '2024-12-16T12:00:00',
        user: 'Nathalie BO',
        comment: 'Ticket créé automatiquement'
      },
      {
        step: 'acknowledged',
        status: 'completed',
        timestamp: '2024-12-16T12:05:00',
        user: 'David FME',
        comment: 'Ticket acquitté - Investigation en cours'
      }
    ],
    acknowledgedBy: 'David FME',
    acknowledgedAt: '2024-12-16T12:05:00'
  },
  {
    id: 'INC-006',
    connectionId: 'CONN-001',
    title: 'Problème de connectivité fibre',
    description: 'Perte de signal sur la liaison fibre optique principale',
    severity: 'high',
    status: 'in_progress',
    priority: 'high',
    ticketType: 'indisponibilite',
    reportedBy: 'Client TechCorp',
    reportedDate: '2024-12-16T13:00:00',
    assignedTo: 'maintenance',
    slaDeadline: '2024-12-16T15:00:00',
    clientName: 'TechCorp Solutions',
    ticketLifecycle: [
      {
        step: 'created',
        status: 'completed',
        timestamp: '2024-12-16T13:00:00',
        user: 'Client TechCorp',
        comment: 'Ticket créé automatiquement'
      },
      {
        step: 'acknowledged',
        status: 'completed',
        timestamp: '2024-12-16T13:05:00',
        user: 'Pierre Durand',
        comment: 'Ticket acquitté - Intervention en cours'
      },
      {
        step: 'accepted',
        status: 'completed',
        timestamp: '2024-12-16T13:10:00',
        user: 'Pierre Durand',
        comment: 'Ticket accepté pour traitement'
      }
    ],
    acknowledgedBy: 'Pierre Durand',
    acknowledgedAt: '2024-12-16T13:05:00'
  },
  // Ticket résolu depuis plus de 48h (pour tester la clôture automatique)
  {
    id: 'INC-007',
    connectionId: 'CONN-004',
    clientName: 'Société Minière de Katanga',
    title: 'Dégradation de bande passante',
    description: 'Bande passante réduite de 50% sur le lien de secours',
    severity: 'medium',
    status: 'resolved',
    priority: 'medium',
    ticketType: 'degradation',
    reportedBy: 'Marie Kabongo',
    reportedDate: '2024-01-10T14:00:00Z',
    assignedTo: 'FME',
    slaDeadline: '2024-01-12T14:00:00Z',
    createdAt: '2024-01-10T14:00:00Z',
    acknowledgedAt: '2024-01-10T15:00:00Z',
    acknowledgedBy: 'David FME',
    activatedTeam: 'FME',
    activatedAt: '2024-01-10T15:00:00Z',
    acknowledgmentGPS: {
      latitude: '-4.4419',
      longitude: '15.2663',
      address: 'Kinshasa, Gombe, Boulevard du 30 Juin'
    },
    resolvedAt: '2024-01-10T18:00:00Z',
    resolution: {
      cause: 'Fibre optique endommagée',
      solution: 'Remplacement du câble fibre optique',
      images: [],
      resolvedBy: 'FME Team',
      resolvedAt: '2024-01-10T18:00:00Z'
    },
    ticketLifecycle: [
      {
        step: 'created',
        timestamp: '2024-01-10T14:00:00Z',
        user: 'Marie Kabongo',
        comment: 'Ticket créé'
      },
      {
        step: 'acknowledged',
        timestamp: '2024-01-10T15:00:00Z',
        user: 'FME Team',
        comment: 'Ticket accepté pour traitement'
      },
      {
        step: 'resolved',
        timestamp: '2024-01-10T18:00:00Z',
        user: 'FME Team',
        comment: 'Problème résolu - Fibre optique remplacée'
      }
    ]
  },
  // Ticket accepté par FME depuis plus de 5h (pour tester l'alerte)
  {
    id: 'INC-008',
    connectionId: 'CONN-005',
    clientName: 'Hôpital Général de Kinshasa',
    title: 'Indisponibilité totale du service',
    description: 'Aucune connectivité depuis 2 heures',
    severity: 'critical',
    status: 'in_progress',
    priority: 'critical',
    ticketType: 'indisponibilite',
    reportedBy: 'Dr. Pierre Mwamba',
    reportedDate: '2024-01-15T08:00:00Z',
    assignedTo: 'FME',
    slaDeadline: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    acknowledgedAt: '2024-01-15T08:30:00Z',
    acknowledgedBy: 'Paul FME Test',
    activatedTeam: 'FME',
    activatedAt: '2024-01-15T08:30:00Z',
    acknowledgmentGPS: {
      latitude: '-4.4419',
      longitude: '15.2663',
      address: 'Kinshasa, Limete, Avenue de la Justice'
    },
    ticketLifecycle: [
      {
        step: 'created',
        timestamp: '2024-01-15T08:00:00Z',
        user: 'Dr. Pierre Mwamba',
        comment: 'Ticket créé - Service critique indisponible'
      },
      {
        step: 'acknowledged',
        timestamp: '2024-01-15T08:30:00Z',
        user: 'FME Team',
        comment: 'Ticket accepté - Intervention urgente requise'
      }
    ]
  },
  // Nouvel incident pour tester le suivi FME
  {
    id: 'INC-009',
    connectionId: 'CONN-006',
    clientName: 'Banque Commerciale du Congo',
    title: 'Problème de connectivité intermittente',
    description: 'Connexion qui se coupe toutes les 5 minutes',
    severity: 'medium',
    status: 'in_progress',
    priority: 'medium',
    ticketType: 'degradation',
    reportedBy: 'Client BCC',
    reportedDate: '2024-01-20T09:00:00Z',
    assignedTo: 'FME',
    slaDeadline: '2024-01-20T17:00:00Z',
    createdAt: '2024-01-20T09:00:00Z',
    acknowledgedAt: '2024-01-20T09:15:00Z',
    acknowledgedBy: 'David FME',
    activatedTeam: 'FME',
    activatedAt: '2024-01-20T09:15:00Z',
    acknowledgmentGPS: {
      latitude: '-4.4419',
      longitude: '15.2663',
      address: 'Kinshasa, Ngaliema, Avenue du Commerce'
    },
    ticketLifecycle: [
      {
        step: 'created',
        timestamp: '2024-01-20T09:00:00Z',
        user: 'Client BCC',
        comment: 'Ticket créé - Problème de connectivité'
      },
      {
        step: 'acknowledged',
        timestamp: '2024-01-20T09:15:00Z',
        user: 'David FME',
        comment: 'Ticket accepté - Intervention en cours'
      }
    ]
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'ALERT-001',
    connectionId: 'CONN-001',
    clientName: 'TechCorp Solutions',
    type: 'threshold_exceeded',
    message: 'Utilisation supérieure à 80%',
    severity: 'warning',
    timestamp: '2024-12-16T09:15:00',
    acknowledged: false,
  },
  {
    id: 'ALERT-002',
    connectionId: 'CONN-002',
    clientName: 'Global Industries',
    type: 'performance_degraded',
    message: 'Latence élevée détectée (>50ms)',
    severity: 'critical',
    timestamp: '2024-12-16T08:30:00',
    acknowledged: true,
  },
];

export const generateMonitoringData = (connectionId: string): MonitoringData[] => {
  const data: MonitoringData[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    data.push({
      connectionId,
      timestamp: timestamp.toISOString(),
      latency: Math.random() * 30 + 10,
      packetLoss: Math.random() * 0.1,
      availability: 99 + Math.random() * 1,
      rxPower: connectionId.includes('fiber') ? -(Math.random() * 5 + 10) : undefined,
      txPower: connectionId.includes('fiber') ? -(Math.random() * 3 + 5) : undefined,
      attenuation: connectionId.includes('fiber') ? Math.random() * 2 + 0.5 : undefined,
    });
  }
  
  return data;
};

// Types pour les spares parts
export interface SparePart {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  maxStock: number;
  currentStock: number;
  location: {
    region: string;
    city: string;
    warehouse: string;
  };
  supplier: string;
  unitPrice: number;
  lastUpdated: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
}

export interface SparePartTransaction {
  id: string;
  sparePartId: string;
  sparePartName: string;
  type: 'in' | 'out';
  quantity: number;
  requester: string;
  requesterRole: string;
  requesterManager: string;
  project?: string;
  reason: string;
  location: {
    region: string;
    city: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  approvalDate?: string;
  completionDate?: string;
  exitDocument?: string; // URL du bon de sortie
  comments?: string;
  approvedBy?: string;
  approvedByRole?: string;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  expectedDeliveryDate?: string;
}

export interface SparePartLocation {
  region: string;
  city: string;
  totalParts: number;
  totalValue: number;
  parts: {
    [partName: string]: {
      quantity: number;
      value: number;
    };
  };
}

// Données mock pour les spares parts
export const mockSpareParts: SparePart[] = [
  {
    id: 'SP-001',
    name: 'Module SFP 1Gbps',
    description: 'Module optique SFP 1Gbps pour switches',
    category: 'Optique',
    unit: 'pièce',
    minStock: 10,
    maxStock: 50,
    currentStock: 25,
    location: {
      region: 'Kinshasa',
      city: 'Kinshasa',
      warehouse: 'Entrepôt Central'
    },
    supplier: 'Cisco Systems',
    unitPrice: 150,
    lastUpdated: '2024-01-15',
    status: 'available'
  },
  {
    id: 'SP-002',
    name: 'Câble Fibre Optique 10m',
    description: 'Câble fibre optique monomode 10 mètres',
    category: 'Câblage',
    unit: 'mètre',
    minStock: 100,
    maxStock: 500,
    currentStock: 75,
    location: {
      region: 'Kinshasa',
      city: 'Kinshasa',
      warehouse: 'Entrepôt Central'
    },
    supplier: 'Corning',
    unitPrice: 25,
    lastUpdated: '2024-01-14',
    status: 'low_stock'
  },
  {
    id: 'SP-003',
    name: 'Switch 24 Ports',
    description: 'Switch Ethernet 24 ports 1Gbps',
    category: 'Équipement',
    unit: 'pièce',
    minStock: 5,
    maxStock: 20,
    currentStock: 8,
    location: {
      region: 'Lubumbashi',
      city: 'Lubumbashi',
      warehouse: 'Entrepôt Sud'
    },
    supplier: 'Huawei',
    unitPrice: 800,
    lastUpdated: '2024-01-13',
    status: 'available'
  },
  {
    id: 'SP-004',
    name: 'Batterie UPS 12V',
    description: 'Batterie plomb-acide 12V 100Ah',
    category: 'Énergie',
    unit: 'pièce',
    minStock: 20,
    maxStock: 100,
    currentStock: 15,
    location: {
      region: 'Matadi',
      city: 'Matadi',
      warehouse: 'Entrepôt Ouest'
    },
    supplier: 'Schneider Electric',
    unitPrice: 120,
    lastUpdated: '2024-01-12',
    status: 'low_stock'
  },
  {
    id: 'SP-005',
    name: 'Carte Réseau 10Gbps',
    description: 'Carte réseau PCIe 10Gbps',
    category: 'Composants',
    unit: 'pièce',
    minStock: 8,
    maxStock: 30,
    currentStock: 12,
    location: {
      region: 'Kinshasa',
      city: 'Kinshasa',
      warehouse: 'Entrepôt Central'
    },
    supplier: 'Intel',
    unitPrice: 300,
    lastUpdated: '2024-01-11',
    status: 'available'
  },
  {
    id: 'SP-006',
    name: 'Routeur WiFi',
    description: 'Routeur WiFi 6 dual-band',
    category: 'Équipement',
    unit: 'pièce',
    minStock: 15,
    maxStock: 60,
    currentStock: 5,
    location: {
      region: 'Lubumbashi',
      city: 'Lubumbashi',
      warehouse: 'Entrepôt Sud'
    },
    supplier: 'TP-Link',
    unitPrice: 80,
    lastUpdated: '2024-01-10',
    status: 'low_stock'
  }
];

// Transactions de spares parts
export const mockSparePartTransactions: SparePartTransaction[] = [
  {
    id: 'TR-001',
    sparePartId: 'SP-001',
    sparePartName: 'Module SFP 1Gbps',
    type: 'out',
    quantity: 5,
    requester: 'Jean Mukendi',
    requesterRole: 'Technicien Projet',
    requesterManager: 'Pierre Mwamba',
    project: 'Extension Réseau Kinshasa',
    reason: 'Installation nouveaux switches',
    location: {
      region: 'Kinshasa',
      city: 'Kinshasa'
    },
    status: 'completed',
    requestDate: '2024-01-10T08:00:00',
    approvalDate: '2024-01-10T10:30:00',
    completionDate: '2024-01-10T14:00:00',
    exitDocument: '/documents/exit-doc-001.pdf',
    comments: 'Livraison effectuée sur site',
    approvedBy: 'Pierre Mwamba',
    approvedByRole: 'Chef de Projet'
  },
  {
    id: 'TR-002',
    sparePartId: 'SP-002',
    sparePartName: 'Câble Fibre Optique 10m',
    type: 'in',
    quantity: 200,
    requester: 'Marie Kabongo',
    requesterRole: 'Responsable Stock',
    requesterManager: 'David Tshibanda',
    reason: 'Réapprovisionnement stock',
    location: {
      region: 'Kinshasa',
      city: 'Kinshasa'
    },
    status: 'completed',
    requestDate: '2024-01-12T09:00:00',
    approvalDate: '2024-01-12T11:00:00',
    completionDate: '2024-01-12T16:00:00',
    comments: 'Réception effectuée',
    approvedBy: 'David Tshibanda',
    approvedByRole: 'Directeur Logistique'
  },
  {
    id: 'TR-003',
    sparePartId: 'SP-003',
    sparePartName: 'Switch 24 Ports',
    type: 'out',
    quantity: 2,
    requester: 'Lucie Mwepu',
    requesterRole: 'Ingénieur Exploitation',
    requesterManager: 'André Kalala',
    reason: 'Remplacement équipements défaillants',
    location: {
      region: 'Lubumbashi',
      city: 'Lubumbashi'
    },
    status: 'pending',
    requestDate: '2024-01-15T14:00:00',
    comments: 'Urgent - équipements en panne'
  },
  {
    id: 'TR-004',
    sparePartId: 'SP-004',
    sparePartName: 'Batterie UPS 12V',
    type: 'out',
    quantity: 8,
    requester: 'Paul Banza',
    requesterRole: 'Technicien Maintenance',
    requesterManager: 'Sophie Mwamba',
    reason: 'Maintenance préventive UPS',
    location: {
      region: 'Matadi',
      city: 'Matadi'
    },
    status: 'approved',
    requestDate: '2024-01-14T10:00:00',
    approvalDate: '2024-01-14T15:00:00',
    approvedBy: 'Sophie Mwamba',
    approvedByRole: 'Chef Maintenance'
  }
];

// Données de localisation des spares parts
export const mockSparePartLocations: SparePartLocation[] = [
  {
    region: 'Kinshasa',
    city: 'Kinshasa',
    totalParts: 3,
    totalValue: 11250,
    parts: {
      'Module SFP 1Gbps': { quantity: 25, value: 3750 },
      'Câble Fibre Optique 10m': { quantity: 75, value: 1875 },
      'Carte Réseau 10Gbps': { quantity: 12, value: 3600 }
    }
  },
  {
    region: 'Lubumbashi',
    city: 'Lubumbashi',
    totalParts: 2,
    totalValue: 6400,
    parts: {
      'Switch 24 Ports': { quantity: 8, value: 6400 },
      'Routeur WiFi': { quantity: 5, value: 400 }
    }
  },
  {
    region: 'Matadi',
    city: 'Matadi',
    totalParts: 1,
    totalValue: 1800,
    parts: {
      'Batterie UPS 12V': { quantity: 15, value: 1800 }
    }
  }
];