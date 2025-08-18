// Types d'exportation
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'commercial' | 'project' | 'maintenance' | 'client' | 'admin' | 'super_admin' | 'recouvrement' | 'facturation';
  department?: string;
  subDepartment?: string; // Pour SAV, BO, FME, NOC dans maintenance
  managerEmail?: string; // Email du chef directeur pour commercial
  avatar?: string;
  passwordChangeRequired?: boolean;
}

export interface Connection {
  id: string;
  clientId: string;
  clientName: string;
  type: 'fiber' | 'radwin' | 'mw_rtn' | 'ptn';
  status: 'planned' | 'in_progress' | 'active' | 'suspended' | 'terminated' | 'deactivated';
  location: string;
  capacity: string;
  vlan: string;
  ipAddress: string;
  site: string;
  gateway: string;
  utilization: number;
  availability: number;
  createdDate: string;
  commissioningDate?: string;
  deactivationDate?: string;
  sla: string;
  assignedTo?: string;
  deactivationReason?: string;
}

export interface Request {
  id: string;
  clientName: string;
  type: 'new_connection' | 'deactivation' | 'modification';
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'in_validation' | 'ready_to_start' | 'launched' | 'in_handover' | 'handover_rejected' | 'deactivation_requested' | 'deactivation_approved' | 'deactivation_rejected' | 'deactivation_in_progress' | 'deactivation_completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedBy: string;
  submittedDate: string;
  description: string;
  technicalDetails: string;
  expectedSLA: string;
  location: string;
  completionDate?: string;
  deliveryDate?: string;
  clientEmail?: string;
  clientContact?: string;
  capacity?: string;
  province?: string;
  city?: string;
  purchaseOrder?: string;
  validationSteps?: any[];
  handoverSteps?: any[];
  deactivationSteps?: any[];
  lastValidation?: any;
  lastHandoverValidation?: any;
  lastDeactivationValidation?: any;
  // Données techniques après lancement
  vlanClient?: string;
  ipClient?: string;
  typeService?: string;
  typeLiaison?: string;
  routerName?: string;
  farendSite?: string;
  gateway?: string;
  lldDesign?: any;
  launchDate?: string;
  // Données pour désactivation
  connectionId?: string;
  deactivationReason?: string;
  deactivationDate?: string;
  routerDeactivationDate?: string;
}

export interface Incident {
  id: string;
  connectionId: string;
  clientName: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'team_activated' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  ticketType: 'degradation' | 'indisponibilite' | 'information';
  reportedBy: string;
  reportedDate: string;
  assignedTo?: string;
  slaDeadline: string;
  resolution?: {
    cause: string;
    solution: string;
    images: File[];
    resolvedBy: string;
    resolvedAt: string;
  };
  processing?: {
    rootCause: string;
    actionTaken: string;
    interventionImages: File[];
    gpsLocation: {
      latitude: string;
      longitude: string;
      address: string;
    };
    processedBy: string;
    processedAt: string;
  };
  acknowledgmentGPS?: {
    latitude: string;
    longitude: string;
    address: string;
  };
  ticketLifecycle?: any[];
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  activatedTeam?: string;
  activatedAt?: string;
  screenshot?: File | null;
  // Nouvelles dates de changement de statut
  statusHistory?: {
    status: string;
    timestamp: string;
    user: string;
    comment?: string;
  }[];
  // Dates spécifiques pour chaque statut
  createdAt?: string;
  assignedAt?: string;
  processedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface MonitoringData {
  connectionId: string;
  timestamp: string;
  latency: number;
  packetLoss: number;
  availability: number;
  rxPower?: number;
  txPower?: number;
  attenuation?: number;
}

export interface Alert {
  id: string;
  connectionId: string;
  clientName: string;
  type: 'threshold_exceeded' | 'service_unavailable' | 'performance_degraded';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

