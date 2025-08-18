import React, { useState } from 'react';
import {
  Settings,
  Key,
  Mail,
  Bell,
  Users,
  Shield,
  Database,
  Globe,
  Save,
  TestTube,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  Copy,
  Download,
  Upload,
  FileText,
  Send,
  X,
  AlertTriangle,
  Activity,
  Package,
  MapPin,
  Wifi
} from 'lucide-react';
import { EmailCampaignModal } from './EmailCampaignModal';
import DatabaseIntegrationModal from './DatabaseIntegrationModal';
import NetworkIntegrationModal from './NetworkIntegrationModal';
import { notificationService } from '../../services/NotificationService';
import { dialogService } from '../../services/dialogService';

interface ApiConfig {
  id: string;
  name: string;
  type: 'rest' | 'soap' | 'graphql' | 'webhook';
  baseUrl: string;
  apiKey?: string;
  secretKey?: string;
  status: 'active' | 'inactive' | 'testing';
  lastTest?: string;
  description: string;
}

interface EmailConfig {
  id: string;
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'aws-ses';
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  encryption: 'tls' | 'ssl' | 'none';
  status: 'active' | 'inactive';
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  subject: string;
  content: string;
  variables: string[];
  status: 'active' | 'inactive';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  isDefault: boolean;
}

interface ConfigurationDashboardProps {
  currentUser: any;
}

export const ConfigurationDashboard: React.FC<ConfigurationDashboardProps> = ({
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'apis' | 'emails' | 'notifications' | 'roles' | 'system' | 'integrations'>('apis');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEmailCampaignModal, setShowEmailCampaignModal] = useState(false);
  const [showNotificationTestModal, setShowNotificationTestModal] = useState(false);
  const [showDatabaseIntegrationModal, setShowDatabaseIntegrationModal] = useState(false);
  const [showNetworkIntegrationModal, setShowNetworkIntegrationModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // États pour la sauvegarde automatique
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [lastBackupTime, setLastBackupTime] = useState(new Date(Date.now() - 2 * 60 * 60 * 1000)); // Il y a 2 heures
  const [nextBackupTime, setNextBackupTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // Dans 2 heures
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // États pour la gestion du cache
  const [cacheStats, setCacheStats] = useState({
    size: 256, // MB
    hitRate: 87, // %
    missRate: 13, // %
    totalRequests: 15420,
    cachedRequests: 13415,
    lastCleanup: new Date(Date.now() - 60 * 60 * 1000), // Il y a 1 heure
    cacheTypes: {
      api: { size: 120, items: 450, hitRate: 92 },
      images: { size: 85, items: 1200, hitRate: 78 },
      data: { size: 35, items: 890, hitRate: 95 },
      static: { size: 16, items: 320, hitRate: 88 }
    }
  });
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheOperation, setCacheOperation] = useState<string>('');
  const [showCacheDetails, setShowCacheDetails] = useState(false);

  // États pour les configurations
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([
    {
      id: 'api-1',
      name: 'Orange SMS API',
      type: 'rest',
      baseUrl: 'https://api.orange.com/sms/v1',
      apiKey: '••••••••••••••••',
      status: 'active',
      lastTest: '2024-01-15T10:30:00Z',
      description: 'API pour l\'envoi de SMS via Orange'
    },
    {
      id: 'api-2',
      name: 'Monitoring API',
      type: 'rest',
      baseUrl: 'https://monitoring.orange.cd/api/v2',
      status: 'testing',
      description: 'API pour la surveillance des équipements'
    }
  ]);

  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([
    {
      id: 'email-1',
      provider: 'smtp',
      host: 'smtp.orange.cd',
      port: 587,
      username: 'noreply@orange.cd',
      password: '••••••••••••••••',
      fromEmail: 'noreply@orange.cd',
      fromName: 'Orange Business Services',
      encryption: 'tls',
      status: 'active'
    }
  ]);

  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([
    {
      id: 'notif-1',
      name: 'Incident Créé',
      type: 'email',
      subject: 'Nouvel incident #{incident_id} créé',
      content: 'Un nouvel incident a été créé pour {client_name}. Priorité: {priority}. Description: {description}',
      variables: ['incident_id', 'client_name', 'priority', 'description'],
      status: 'active'
    },
    {
      id: 'notif-2',
      name: 'Ticket Résolu',
      type: 'email',
      subject: 'Ticket #{ticket_id} résolu',
      content: 'Le ticket {ticket_id} a été résolu par {resolved_by}. Temps de résolution: {resolution_time}',
      variables: ['ticket_id', 'resolved_by', 'resolution_time'],
      status: 'active'
    }
  ]);

  // Données mock pour les clients
  const mockClients = [
    {
      id: 'client-1',
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.cd',
      region: 'Kinshasa',
      city: 'Kinshasa',
      company: 'TechCorp Solutions'
    },
    {
      id: 'client-2',
      name: 'Global Industries',
      email: 'info@globalindustries.cd',
      region: 'Lubumbashi',
      city: 'Lubumbashi',
      company: 'Global Industries'
    },
    {
      id: 'client-3',
      name: 'DataFlow Corp',
      email: 'support@dataflow.cd',
      region: 'Kinshasa',
      city: 'Kinshasa',
      company: 'DataFlow Corp'
    },
    {
      id: 'client-4',
      name: 'NetConnect Ltd',
      email: 'hello@netconnect.cd',
      region: 'Matadi',
      city: 'Matadi',
      company: 'NetConnect Ltd'
    },
    {
      id: 'client-5',
      name: 'Digital Solutions',
      email: 'contact@digitalsolutions.cd',
      region: 'Goma',
      city: 'Goma',
      company: 'Digital Solutions'
    },
    {
      id: 'client-6',
      name: 'CloudTech Services',
      email: 'info@cloudtech.cd',
      region: 'Kinshasa',
      city: 'Kinshasa',
      company: 'CloudTech Services'
    },
    {
      id: 'client-7',
      name: 'Innovation Labs',
      email: 'hello@innovationlabs.cd',
      region: 'Lubumbashi',
      city: 'Lubumbashi',
      company: 'Innovation Labs'
    },
    {
      id: 'client-8',
      name: 'Smart Systems',
      email: 'contact@smartsystems.cd',
      region: 'Matadi',
      city: 'Matadi',
      company: 'Smart Systems'
    }
  ];

  const [userRoles, setUserRoles] = useState<UserRole[]>([
    {
      id: 'role-1',
      name: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: ['all'],
      usersCount: 3,
      isDefault: false
    },
    {
      id: 'role-2',
      name: 'SAV',
      description: 'Gestion des incidents et support client',
      permissions: ['incidents.view', 'incidents.edit', 'incidents.create', 'clients.view'],
      usersCount: 8,
      isDefault: false
    },
    {
      id: 'role-3',
      name: 'NOC',
      description: 'Surveillance réseau et gestion technique',
      permissions: ['monitoring.view', 'monitoring.edit', 'incidents.view', 'incidents.edit'],
      usersCount: 5,
      isDefault: false
    },
    {
      id: 'role-4',
      name: 'FME',
      description: 'Intervention sur site et maintenance',
      permissions: ['incidents.view', 'incidents.edit', 'spare_parts.view', 'tracking.view'],
      usersCount: 12,
      isDefault: false
    },
    {
      id: 'role-5',
      name: 'Client',
      description: 'Accès limité aux informations client',
      permissions: ['incidents.view_own', 'billing.view_own'],
      usersCount: 45,
      isDefault: true
    }
  ]);

  // Données mock pour les utilisateurs
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user-1',
      name: 'Jean Dupont',
      email: 'jean.dupont@orange.com',
      role: 'Administrateur',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2023-01-15T08:00:00Z'
    },
    {
      id: 'user-2',
      name: 'Marie Martin',
      email: 'marie.martin@orange.com',
      role: 'SAV',
      status: 'active',
      lastLogin: '2024-01-15T09:15:00Z',
      createdAt: '2023-02-20T10:00:00Z'
    },
    {
      id: 'user-3',
      name: 'Pierre Durand',
      email: 'pierre.durand@orange.com',
      role: 'SAV',
      status: 'active',
      lastLogin: '2024-01-15T08:45:00Z',
      createdAt: '2023-03-10T14:30:00Z'
    },
    {
      id: 'user-4',
      name: 'Sophie Bernard',
      email: 'sophie.bernard@orange.com',
      role: 'NOC',
      status: 'active',
      lastLogin: '2024-01-15T07:30:00Z',
      createdAt: '2023-04-05T11:20:00Z'
    },
    {
      id: 'user-5',
      name: 'David Leroy',
      email: 'david.leroy@orange.com',
      role: 'FME',
      status: 'active',
      lastLogin: '2024-01-15T06:15:00Z',
      createdAt: '2023-05-12T16:45:00Z'
    },
    {
      id: 'user-6',
      name: 'Nathalie Moreau',
      email: 'nathalie.moreau@orange.com',
      role: 'FME',
      status: 'inactive',
      lastLogin: '2024-01-10T15:20:00Z',
      createdAt: '2023-06-18T09:10:00Z'
    },
    {
      id: 'user-7',
      name: 'Marc Petit',
      email: 'marc.petit@orange.com',
      role: 'Client',
      status: 'active',
      lastLogin: '2024-01-15T11:00:00Z',
      createdAt: '2023-07-22T13:25:00Z'
    },
    {
      id: 'user-8',
      name: 'Caroline Roux',
      email: 'caroline.roux@orange.com',
      role: 'Client',
      status: 'active',
      lastLogin: '2024-01-15T10:45:00Z',
      createdAt: '2023-08-30T17:40:00Z'
    }
  ]);

  // Fonctions pour les APIs
  const handleTestApi = (api: ApiConfig) => {
    console.log(`🧪 Test de l'API ${api.name}...`);
    // Simulation d'un test d'API
    setTimeout(() => {
      dialogService.success('Test API', `Test de l'API ${api.name} : SUCCÈS`);
    }, 2000);
  };

  const handleToggleApiStatus = (apiId: string) => {
    setApiConfigs(prev => prev.map(api => 
      api.id === apiId 
        ? { ...api, status: api.status === 'active' ? 'inactive' : 'active' }
        : api
    ));
  };

  // Fonctions pour les emails
  const handleTestEmail = (emailConfig: EmailConfig) => {
    console.log(`📧 Test d'envoi d'email via ${emailConfig.provider}...`);
    dialogService.success('Test Email', `Email de test envoyé à ${emailConfig.fromEmail}`);
  };

  // Fonctions pour les notifications
  const handlePreviewNotification = (template: NotificationTemplate) => {
    const previewContent = template.content
      .replace('{incident_id}', 'INC-2024-001')
      .replace('{client_name}', 'TechCorp Solutions')
      .replace('{priority}', 'Haute')
      .replace('{description}', 'Problème de connectivité');
    
    dialogService.info('Aperçu Template', `Aperçu du template "${template.name}":\n\n${previewContent}`);
  };

  // Fonctions pour les rôles
  const handleEditRole = (role: UserRole) => {
    setEditingItem(role);
    setShowRoleModal(true);
  };

  const handleCreateNewRole = () => {
    setShowNewRoleModal(true);
  };

  const handleSubmitNewRole = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const roleName = formData.get('roleName') as string;
    const description = formData.get('description') as string;
    
    // Récupérer toutes les permissions cochées
    const checkboxes = (event.target as HTMLFormElement).querySelectorAll('input[type="checkbox"]:checked');
    const permissions = Array.from(checkboxes).map((checkbox) => (checkbox as HTMLInputElement).value);
    
    if (!roleName.trim()) {
      dialogService.error('Erreur', 'Le nom du rôle est obligatoire');
      return;
    }
    
    // Créer le nouveau rôle
    const newRole: UserRole = {
      id: `role-${Date.now()}`,
      name: roleName.trim(),
      description: description.trim() || 'Nouveau rôle créé',
      permissions: permissions,
      usersCount: 0,
      isDefault: false
    };
    
    // Ajouter le rôle à la liste
    setUserRoles(prev => [...prev, newRole]);
    
    // Fermer le modal
    setShowNewRoleModal(false);
    
    // Afficher un message de succès
    dialogService.success('Rôle Créé', `Rôle "${roleName}" créé avec succès !\n\nPermissions accordées: ${permissions.length}`);
  };

  // Fonctions pour les utilisateurs
  const handleViewUsers = (role: UserRole) => {
    setSelectedRole(role);
    setShowUsersModal(true);
  };

  const handleEditUser = (user: User) => {
    // Ouvrir un modal d'édition simple pour l'instant
    const newName = prompt(`Modifier le nom de l'utilisateur "${user.name}":`, user.name);
    if (newName && newName.trim() !== '') {
      const newEmail = prompt(`Modifier l'email de l'utilisateur "${user.email}":`, user.email);
      if (newEmail && newEmail.trim() !== '') {
        setUsers(prev => prev.map(u => 
          u.id === user.id 
            ? { ...u, name: newName.trim(), email: newEmail.trim() }
            : u
        ));
        dialogService.success('Utilisateur Modifié', `Utilisateur "${user.name}" modifié avec succès !`);
      }
    }
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?\n\nCette action est irréversible.`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      // Mettre à jour le compteur d'utilisateurs pour le rôle
      setUserRoles(prev => prev.map(role => 
        role.name === user.role 
          ? { ...role, usersCount: role.usersCount - 1 }
          : role
      ));
      dialogService.success('Utilisateur Supprimé', `Utilisateur "${user.name}" supprimé avec succès !`);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activer' : 'désactiver';
    
    if (confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur "${user.name}" ?`)) {
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, status: newStatus }
          : u
      ));
      dialogService.success('Statut Utilisateur', `Utilisateur "${user.name}" ${action === 'activer' ? 'activé' : 'désactivé'} avec succès !`);
    }
  };

  // Obtenir les utilisateurs pour un rôle spécifique
  const getUsersForRole = (roleName: string) => {
    return users.filter(user => user.role === roleName);
  };

  const getPermissionLabel = (permission: string) => {
    const labels: { [key: string]: string } = {
      'all': 'Tous les accès',
      'incidents.view': 'Voir les incidents',
      'incidents.edit': 'Modifier les incidents',
      'incidents.create': 'Créer des incidents',
      'incidents.view_own': 'Voir ses propres incidents',
      'clients.view': 'Voir les clients',
      'monitoring.view': 'Voir le monitoring',
      'monitoring.edit': 'Modifier le monitoring',
      'spare_parts.view': 'Voir les pièces détachées',
      'tracking.view': 'Voir le suivi FME',
      'billing.view_own': 'Voir sa facturation'
    };
    return labels[permission] || permission;
  };

  // Fonctions pour la sauvegarde automatique
  const performBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    try {
      // Simuler une sauvegarde progressive
      const backupSteps = [
        { name: 'Sauvegarde des configurations API', progress: 20 },
        { name: 'Sauvegarde des configurations email', progress: 40 },
        { name: 'Sauvegarde des templates de notifications', progress: 60 },
        { name: 'Sauvegarde des rôles et permissions', progress: 80 },
        { name: 'Sauvegarde des données utilisateurs', progress: 100 }
      ];

      for (const step of backupSteps) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simuler le temps de traitement
        setBackupProgress(step.progress);
        console.log(`🔄 ${step.name}...`);
      }

      // Mettre à jour les temps de sauvegarde
      const now = new Date();
      setLastBackupTime(now);
      setNextBackupTime(new Date(now.getTime() + 2 * 60 * 60 * 1000)); // Prochaine sauvegarde dans 2 heures
      
      console.log('✅ Sauvegarde automatique terminée avec succès');
      
      // Afficher une notification de succès
      dialogService.success('Sauvegarde Terminée', 'Sauvegarde automatique terminée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde automatique:', error);
      dialogService.error('Erreur Sauvegarde', 'Erreur lors de la sauvegarde automatique');
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const toggleAutoBackup = () => {
    const newState = !autoBackupEnabled;
    setAutoBackupEnabled(newState);
    
    if (newState) {
      dialogService.success('Sauvegarde Activée', 'Sauvegarde automatique activée - Sauvegarde toutes les 2 heures');
    } else {
      dialogService.info('Sauvegarde Désactivée', 'Sauvegarde automatique désactivée');
    }
  };

  const formatTimeUntilNextBackup = () => {
    const now = new Date();
    const timeDiff = nextBackupTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'Maintenant';
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Dans ${hours}h ${minutes}m`;
    } else {
      return `Dans ${minutes}m`;
    }
  };

  // Effect pour la sauvegarde automatique
  React.useEffect(() => {
    if (!autoBackupEnabled) return;

    const checkBackupTime = () => {
      const now = new Date();
      if (now >= nextBackupTime) {
        performBackup();
      }
    };

    // Vérifier toutes les minutes
    const interval = setInterval(checkBackupTime, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [autoBackupEnabled, nextBackupTime]);

  // Fonctions pour la gestion du cache
  const clearCache = async (type?: 'all' | 'api' | 'images' | 'data' | 'static') => {
    setIsClearingCache(true);
    setCacheOperation(`Nettoyage du cache ${type === 'all' ? 'complet' : type}...`);
    
    try {
      // Simuler le nettoyage du cache
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour les statistiques
      const now = new Date();
      setCacheStats(prev => ({
        ...prev,
        lastCleanup: now,
        size: type === 'all' ? 0 : prev.size * 0.3, // Réduire la taille selon le type
        hitRate: type === 'all' ? 0 : prev.hitRate * 0.8,
        missRate: type === 'all' ? 100 : prev.missRate * 1.2,
        totalRequests: 0,
        cachedRequests: 0,
        cacheTypes: type === 'all' ? {
          api: { size: 0, items: 0, hitRate: 0 },
          images: { size: 0, items: 0, hitRate: 0 },
          data: { size: 0, items: 0, hitRate: 0 },
          static: { size: 0, items: 0, hitRate: 0 }
        } : {
          ...prev.cacheTypes,
          [type || 'api']: { size: 0, items: 0, hitRate: 0 }
        }
      }));
      
      dialogService.success('Cache Vidé', `Cache ${type === 'all' ? 'complet' : type} vidé avec succès !`);
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage du cache:', error);
      dialogService.error('Erreur Cache', 'Erreur lors du nettoyage du cache');
    } finally {
      setIsClearingCache(false);
      setCacheOperation('');
    }
  };

  const optimizeCache = async () => {
    setIsClearingCache(true);
    setCacheOperation('Optimisation du cache...');
    
    try {
      // Simuler l'optimisation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Améliorer les statistiques
      setCacheStats(prev => ({
        ...prev,
        hitRate: Math.min(prev.hitRate + 5, 98),
        missRate: Math.max(prev.missRate - 5, 2),
        size: Math.max(prev.size - 50, 100), // Réduire la taille
        cacheTypes: {
          api: { ...prev.cacheTypes.api, hitRate: Math.min(prev.cacheTypes.api.hitRate + 3, 98) },
          images: { ...prev.cacheTypes.images, hitRate: Math.min(prev.cacheTypes.images.hitRate + 2, 95) },
          data: { ...prev.cacheTypes.data, hitRate: Math.min(prev.cacheTypes.data.hitRate + 4, 99) },
          static: { ...prev.cacheTypes.static, hitRate: Math.min(prev.cacheTypes.static.hitRate + 3, 96) }
        }
      }));
      
      dialogService.success('Cache Optimisé', 'Cache optimisé avec succès ! Performance améliorée.');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'optimisation:', error);
      dialogService.error('Erreur Optimisation', 'Erreur lors de l\'optimisation du cache');
    } finally {
      setIsClearingCache(false);
      setCacheOperation('');
    }
  };

  const preloadCache = async () => {
    setIsClearingCache(true);
    setCacheOperation('Préchargement du cache...');
    
    try {
      // Simuler le préchargement
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Augmenter les statistiques
      setCacheStats(prev => ({
        ...prev,
        hitRate: Math.min(prev.hitRate + 8, 95),
        missRate: Math.max(prev.missRate - 8, 5),
        size: Math.min(prev.size + 100, 500), // Augmenter la taille
        totalRequests: prev.totalRequests + 1000,
        cachedRequests: prev.cachedRequests + 950,
        cacheTypes: {
          api: { ...prev.cacheTypes.api, size: prev.cacheTypes.api.size + 30, items: prev.cacheTypes.api.items + 100 },
          images: { ...prev.cacheTypes.images, size: prev.cacheTypes.images.size + 40, items: prev.cacheTypes.images.items + 200 },
          data: { ...prev.cacheTypes.data, size: prev.cacheTypes.data.size + 20, items: prev.cacheTypes.data.items + 150 },
          static: { ...prev.cacheTypes.static, size: prev.cacheTypes.static.size + 10, items: prev.cacheTypes.static.items + 50 }
        }
      }));
      
      dialogService.success('Cache Préchargé', 'Cache préchargé avec succès ! Données fréquemment utilisées mises en cache.');
      
    } catch (error) {
      console.error('❌ Erreur lors du préchargement:', error);
      dialogService.error('Erreur Préchargement', 'Erreur lors du préchargement du cache');
    } finally {
      setIsClearingCache(false);
      setCacheOperation('');
    }
  };

  const exportCacheStats = () => {
    const stats = {
      timestamp: new Date().toISOString(),
      cacheStats: cacheStats,
      summary: {
        totalSize: `${cacheStats.size} MB`,
        hitRate: `${cacheStats.hitRate}%`,
        efficiency: cacheStats.hitRate > 80 ? 'Excellent' : cacheStats.hitRate > 60 ? 'Bon' : 'À améliorer'
      }
    };
    
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cache-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    dialogService.success('Export Cache', 'Statistiques du cache exportées avec succès !');
  };

  // États pour la gestion des logs
  const [isDownloadingLogs, setIsDownloadingLogs] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  // Fonction pour télécharger tous les logs
  const downloadAllLogs = async () => {
    setIsDownloadingLogs(true);
    setDownloadProgress(0);
    setDownloadStatus('Préparation du téléchargement...');

    try {
      // Simuler la collecte de tous les types de logs
      const logTypes = [
        { name: 'Logs d\'application', progress: 10 },
        { name: 'Logs de connexions utilisateurs', progress: 20 },
        { name: 'Logs de modifications', progress: 30 },
        { name: 'Logs de suppressions', progress: 40 },
        { name: 'Logs de base de données', progress: 50 },
        { name: 'Logs des équipements réseau', progress: 60 },
        { name: 'Logs des routeurs', progress: 70 },
        { name: 'Logs des RTN/PTN', progress: 80 },
        { name: 'Logs des switches', progress: 90 },
        { name: 'Compilation et compression', progress: 100 }
      ];

      for (const logType of logTypes) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setDownloadProgress(logType.progress);
        setDownloadStatus(`Collecte: ${logType.name}...`);
        console.log(`📋 ${logType.name}...`);
      }

      // Générer le contenu des logs complets
      const allLogs = generateCompleteLogs();
      
      // Créer le fichier ZIP avec tous les logs
      const zipContent = await createLogsZip(allLogs);
      
      // Télécharger le fichier
      const blob = new Blob([zipContent], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-complets-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      dialogService.success('Logs Téléchargés', 'Tous les logs ont été téléchargés avec succès !\n\nFichier: logs-complets-[date].zip');
      
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement des logs:', error);
      dialogService.error('Erreur Téléchargement', 'Erreur lors du téléchargement des logs');
    } finally {
      setIsDownloadingLogs(false);
      setDownloadProgress(0);
      setDownloadStatus('');
    }
  };

  // Fonction pour générer tous les logs
  const generateCompleteLogs = () => {
    const now = new Date();
    const logs = {
      timestamp: now.toISOString(),
      application: {
        name: 'Monitoring B2B Orange RDC',
        version: '2.1.0',
        environment: 'Production'
      },
      
      // Logs d'application
      appLogs: [
        { timestamp: '2024-01-15T10:30:00Z', level: 'INFO', module: 'Authentication', message: 'Utilisateur connecté: jean.dupont@orange.com', userId: 'user-1' },
        { timestamp: '2024-01-15T10:35:00Z', level: 'INFO', module: 'Incidents', message: 'Nouvel incident créé: INC-2024-001', incidentId: 'INC-2024-001' },
        { timestamp: '2024-01-15T10:40:00Z', level: 'WARN', module: 'Monitoring', message: 'Seuil de bande passante dépassé pour client TechCorp', clientId: 'client-1' },
        { timestamp: '2024-01-15T10:45:00Z', level: 'ERROR', module: 'Database', message: 'Timeout de connexion à la base de données', retryCount: 3 },
        { timestamp: '2024-01-15T11:00:00Z', level: 'INFO', module: 'Backup', message: 'Sauvegarde automatique terminée avec succès', size: '1.2 GB' },
        { timestamp: '2024-01-15T11:15:00Z', level: 'INFO', module: 'Cache', message: 'Cache optimisé - Hit rate amélioré de 5%', newHitRate: '92%' },
        { timestamp: '2024-01-15T11:30:00Z', level: 'INFO', module: 'Notifications', message: 'Email de notification envoyé à client@techcorp.cd', recipient: 'client@techcorp.cd' },
        { timestamp: '2024-01-15T12:00:00Z', level: 'INFO', module: 'SpareParts', message: 'Transaction de pièces détachées validée', transactionId: 'SP-2024-001' },
        { timestamp: '2024-01-15T12:15:00Z', level: 'INFO', module: 'FME Tracking', message: 'Position GPS mise à jour pour équipe FME-001', teamId: 'FME-001' },
        { timestamp: '2024-01-15T12:30:00Z', level: 'INFO', module: 'Billing', message: 'Facture générée pour client Global Industries', invoiceId: 'INV-2024-001' }
      ],

      // Logs de connexions utilisateurs
      userConnections: [
        { timestamp: '2024-01-15T08:00:00Z', userId: 'user-1', username: 'jean.dupont@orange.com', role: 'Administrateur', ip: '192.168.1.100', userAgent: 'Chrome/120.0.0.0', status: 'success' },
        { timestamp: '2024-01-15T08:15:00Z', userId: 'user-2', username: 'marie.martin@orange.com', role: 'SAV', ip: '192.168.1.101', userAgent: 'Firefox/121.0', status: 'success' },
        { timestamp: '2024-01-15T08:30:00Z', userId: 'user-3', username: 'pierre.durand@orange.com', role: 'SAV', ip: '192.168.1.102', userAgent: 'Safari/17.2', status: 'success' },
        { timestamp: '2024-01-15T09:00:00Z', userId: 'user-4', username: 'sophie.bernard@orange.com', role: 'NOC', ip: '192.168.1.103', userAgent: 'Chrome/120.0.0.0', status: 'success' },
        { timestamp: '2024-01-15T09:15:00Z', userId: 'user-5', username: 'david.leroy@orange.com', role: 'FME', ip: '192.168.1.104', userAgent: 'Mobile Safari/17.2', status: 'success' },
        { timestamp: '2024-01-15T10:00:00Z', userId: 'unknown', username: 'hacker@evil.com', role: 'Unknown', ip: '203.0.113.1', userAgent: 'Bot/1.0', status: 'failed', reason: 'Invalid credentials' },
        { timestamp: '2024-01-15T10:30:00Z', userId: 'user-7', username: 'marc.petit@orange.com', role: 'Client', ip: '192.168.1.105', userAgent: 'Chrome/120.0.0.0', status: 'success' },
        { timestamp: '2024-01-15T11:00:00Z', userId: 'user-8', username: 'caroline.roux@orange.com', role: 'Client', ip: '192.168.1.106', userAgent: 'Edge/120.0.0.0', status: 'success' }
      ],

      // Logs de modifications
      modifications: [
        { timestamp: '2024-01-15T10:35:00Z', userId: 'user-1', action: 'CREATE', module: 'Incidents', recordId: 'INC-2024-001', details: 'Création incident priorité haute pour TechCorp' },
        { timestamp: '2024-01-15T10:40:00Z', userId: 'user-2', action: 'UPDATE', module: 'Incidents', recordId: 'INC-2024-001', details: 'Modification statut: en cours de traitement' },
        { timestamp: '2024-01-15T10:45:00Z', userId: 'user-4', action: 'UPDATE', module: 'Monitoring', recordId: 'MON-001', details: 'Modification seuil d\'alerte bande passante' },
        { timestamp: '2024-01-15T11:00:00Z', userId: 'user-1', action: 'UPDATE', module: 'Users', recordId: 'user-6', details: 'Désactivation utilisateur Nathalie Moreau' },
        { timestamp: '2024-01-15T11:15:00Z', userId: 'user-2', action: 'CREATE', module: 'SpareParts', recordId: 'SP-2024-001', details: 'Nouvelle demande de pièces détachées' },
        { timestamp: '2024-01-15T11:30:00Z', userId: 'user-1', action: 'UPDATE', module: 'Configuration', recordId: 'CONF-001', details: 'Modification configuration email SMTP' },
        { timestamp: '2024-01-15T12:00:00Z', userId: 'user-3', action: 'UPDATE', module: 'Incidents', recordId: 'INC-2024-001', details: 'Résolution incident avec commentaire technique' },
        { timestamp: '2024-01-15T12:15:00Z', userId: 'user-5', action: 'UPDATE', module: 'FME Tracking', recordId: 'GPS-001', details: 'Mise à jour position GPS équipe terrain' }
      ],

      // Logs de suppressions
      deletions: [
        { timestamp: '2024-01-15T09:00:00Z', userId: 'user-1', action: 'DELETE', module: 'Logs', recordId: 'LOG-OLD-001', details: 'Suppression logs anciens (>30 jours)' },
        { timestamp: '2024-01-15T09:15:00Z', userId: 'user-1', action: 'DELETE', module: 'Cache', recordId: 'CACHE-OLD', details: 'Nettoyage cache expiré' },
        { timestamp: '2024-01-15T10:00:00Z', userId: 'user-2', action: 'DELETE', module: 'Incidents', recordId: 'INC-DUPLICATE', details: 'Suppression incident en double' },
        { timestamp: '2024-01-15T11:00:00Z', userId: 'user-1', action: 'DELETE', module: 'Users', recordId: 'user-inactive', details: 'Suppression utilisateur inactif depuis 6 mois' }
      ],

      // Logs de base de données
      databaseLogs: [
        { timestamp: '2024-01-15T08:00:00Z', level: 'INFO', operation: 'CONNECTION', database: 'monitoring_b2b', message: 'Connexion établie', connectionId: 'conn-001' },
        { timestamp: '2024-01-15T08:15:00Z', level: 'INFO', operation: 'QUERY', database: 'monitoring_b2b', message: 'SELECT * FROM incidents WHERE status = "open"', duration: '45ms', rows: 15 },
        { timestamp: '2024-01-15T08:30:00Z', level: 'INFO', operation: 'INSERT', database: 'monitoring_b2b', message: 'INSERT INTO incidents (id, title, priority, client_id) VALUES (...)', duration: '12ms', rows: 1 },
        { timestamp: '2024-01-15T09:00:00Z', level: 'WARN', operation: 'QUERY', database: 'monitoring_b2b', message: 'Slow query detected', duration: '2.5s', rows: 1000 },
        { timestamp: '2024-01-15T09:15:00Z', level: 'INFO', operation: 'UPDATE', database: 'monitoring_b2b', message: 'UPDATE incidents SET status = "resolved" WHERE id = "INC-2024-001"', duration: '8ms', rows: 1 },
        { timestamp: '2024-01-15T10:00:00Z', level: 'ERROR', operation: 'CONNECTION', database: 'monitoring_b2b', message: 'Connection timeout', retryCount: 3 },
        { timestamp: '2024-01-15T10:15:00Z', level: 'INFO', operation: 'BACKUP', database: 'monitoring_b2b', message: 'Sauvegarde automatique démarrée', size: '1.2 GB' },
        { timestamp: '2024-01-15T10:30:00Z', level: 'INFO', operation: 'BACKUP', database: 'monitoring_b2b', message: 'Sauvegarde terminée avec succès', duration: '15m 30s' },
        { timestamp: '2024-01-15T11:00:00Z', level: 'INFO', operation: 'QUERY', database: 'monitoring_b2b', message: 'SELECT COUNT(*) FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 1 DAY)', duration: '5ms', rows: 1 },
        { timestamp: '2024-01-15T12:00:00Z', level: 'INFO', operation: 'TRANSACTION', database: 'monitoring_b2b', message: 'Transaction commit: spare_parts_transaction', duration: '25ms' }
      ],

      // Logs des équipements réseau
      networkEquipment: {
        routers: [
          { timestamp: '2024-01-15T08:00:00Z', device: 'ROUTER-KIN-001', ip: '10.0.1.1', status: 'online', cpu: '15%', memory: '45%', uptime: '45 days', interfaces: ['eth0: UP', 'eth1: UP', 'eth2: DOWN'] },
          { timestamp: '2024-01-15T08:15:00Z', device: 'ROUTER-KIN-002', ip: '10.0.1.2', status: 'online', cpu: '22%', memory: '67%', uptime: '23 days', interfaces: ['eth0: UP', 'eth1: UP', 'eth2: UP'] },
          { timestamp: '2024-01-15T08:30:00Z', device: 'ROUTER-LUB-001', ip: '10.0.2.1', status: 'online', cpu: '18%', memory: '52%', uptime: '67 days', interfaces: ['eth0: UP', 'eth1: UP', 'eth2: UP'] },
          { timestamp: '2024-01-15T09:00:00Z', device: 'ROUTER-KIN-001', ip: '10.0.1.1', status: 'warning', cpu: '85%', memory: '78%', uptime: '45 days', alert: 'CPU usage high' },
          { timestamp: '2024-01-15T09:15:00Z', device: 'ROUTER-KIN-003', ip: '10.0.1.3', status: 'offline', lastSeen: '2024-01-15T09:10:00Z', alert: 'Device unreachable' },
          { timestamp: '2024-01-15T10:00:00Z', device: 'ROUTER-KIN-001', ip: '10.0.1.1', status: 'online', cpu: '25%', memory: '50%', uptime: '45 days', alert: 'CPU usage normalized' }
        ],
        
        rtnPtn: [
          { timestamp: '2024-01-15T08:00:00Z', device: 'RTN-KIN-001', ip: '10.1.1.1', status: 'online', type: 'RTN', bandwidth: '10 Gbps', utilization: '65%', connections: 1250 },
          { timestamp: '2024-01-15T08:15:00Z', device: 'PTN-KIN-001', ip: '10.1.1.2', status: 'online', type: 'PTN', bandwidth: '40 Gbps', utilization: '78%', connections: 2100 },
          { timestamp: '2024-01-15T08:30:00Z', device: 'RTN-LUB-001', ip: '10.1.2.1', status: 'online', type: 'RTN', bandwidth: '10 Gbps', utilization: '45%', connections: 890 },
          { timestamp: '2024-01-15T09:00:00Z', device: 'PTN-KIN-001', ip: '10.1.1.2', status: 'warning', type: 'PTN', bandwidth: '40 Gbps', utilization: '92%', alert: 'High bandwidth utilization' },
          { timestamp: '2024-01-15T09:15:00Z', device: 'RTN-MAT-001', ip: '10.1.3.1', status: 'offline', type: 'RTN', lastSeen: '2024-01-15T09:10:00Z', alert: 'Device offline' },
          { timestamp: '2024-01-15T10:00:00Z', device: 'PTN-KIN-001', ip: '10.1.1.2', status: 'online', type: 'PTN', bandwidth: '40 Gbps', utilization: '75%', alert: 'Bandwidth usage normalized' }
        ],
        
        switches: [
          { timestamp: '2024-01-15T08:00:00Z', device: 'SW-KIN-CORE-001', ip: '10.2.1.1', status: 'online', model: 'Cisco Catalyst 9300', ports: { total: 48, active: 42, down: 6 }, vlan: 15 },
          { timestamp: '2024-01-15T08:15:00Z', device: 'SW-KIN-ACCESS-001', ip: '10.2.1.2', status: 'online', model: 'Cisco Catalyst 2960', ports: { total: 24, active: 18, down: 6 }, vlan: 8 },
          { timestamp: '2024-01-15T08:30:00Z', device: 'SW-LUB-CORE-001', ip: '10.2.2.1', status: 'online', model: 'Cisco Catalyst 9300', ports: { total: 48, active: 35, down: 13 }, vlan: 12 },
          { timestamp: '2024-01-15T09:00:00Z', device: 'SW-KIN-CORE-001', ip: '10.2.1.1', status: 'warning', model: 'Cisco Catalyst 9300', alert: 'Port 23 link down', ports: { total: 48, active: 41, down: 7 } },
          { timestamp: '2024-01-15T09:15:00Z', device: 'SW-KIN-ACCESS-002', ip: '10.2.1.3', status: 'offline', model: 'Cisco Catalyst 2960', lastSeen: '2024-01-15T09:10:00Z', alert: 'Switch unreachable' },
          { timestamp: '2024-01-15T10:00:00Z', device: 'SW-KIN-CORE-001', ip: '10.2.1.1', status: 'online', model: 'Cisco Catalyst 9300', alert: 'Port 23 restored', ports: { total: 48, active: 42, down: 6 } }
        ]
      },

      // Logs de performance système
      systemPerformance: [
        { timestamp: '2024-01-15T08:00:00Z', cpu: '25%', memory: '45%', disk: '60%', network: '30%', activeConnections: 150 },
        { timestamp: '2024-01-15T08:15:00Z', cpu: '28%', memory: '47%', disk: '61%', network: '35%', activeConnections: 165 },
        { timestamp: '2024-01-15T08:30:00Z', cpu: '32%', memory: '50%', disk: '62%', network: '40%', activeConnections: 180 },
        { timestamp: '2024-01-15T09:00:00Z', cpu: '45%', memory: '65%', disk: '68%', network: '55%', activeConnections: 220 },
        { timestamp: '2024-01-15T09:15:00Z', cpu: '52%', memory: '70%', disk: '70%', network: '60%', activeConnections: 250 },
        { timestamp: '2024-01-15T10:00:00Z', cpu: '35%', memory: '55%', disk: '65%', network: '45%', activeConnections: 200 },
        { timestamp: '2024-01-15T11:00:00Z', cpu: '30%', memory: '50%', disk: '63%', network: '40%', activeConnections: 175 },
        { timestamp: '2024-01-15T12:00:00Z', cpu: '28%', memory: '48%', disk: '62%', network: '35%', activeConnections: 160 }
      ],

      // Logs de sécurité
      securityLogs: [
        { timestamp: '2024-01-15T08:00:00Z', level: 'INFO', event: 'LOGIN_SUCCESS', user: 'jean.dupont@orange.com', ip: '192.168.1.100', sessionId: 'sess-001' },
        { timestamp: '2024-01-15T08:15:00Z', level: 'INFO', event: 'LOGIN_SUCCESS', user: 'marie.martin@orange.com', ip: '192.168.1.101', sessionId: 'sess-002' },
        { timestamp: '2024-01-15T09:00:00Z', level: 'WARN', event: 'LOGIN_FAILED', user: 'hacker@evil.com', ip: '203.0.113.1', reason: 'Invalid credentials', attempts: 3 },
        { timestamp: '2024-01-15T09:15:00Z', level: 'ERROR', event: 'BRUTE_FORCE_ATTEMPT', ip: '203.0.113.1', attempts: 10, action: 'IP blocked for 30 minutes' },
        { timestamp: '2024-01-15T10:00:00Z', level: 'INFO', event: 'PASSWORD_CHANGE', user: 'pierre.durand@orange.com', ip: '192.168.1.102', sessionId: 'sess-003' },
        { timestamp: '2024-01-15T11:00:00Z', level: 'INFO', event: 'LOGOUT', user: 'sophie.bernard@orange.com', ip: '192.168.1.103', sessionId: 'sess-004' },
        { timestamp: '2024-01-15T12:00:00Z', level: 'WARN', event: 'SESSION_TIMEOUT', user: 'david.leroy@orange.com', ip: '192.168.1.104', sessionId: 'sess-005' }
      ]
    };

    return logs;
  };

  // Fonction pour créer le fichier ZIP des logs
  const createLogsZip = async (logs: any) => {
    // Simuler la création d'un fichier ZIP
    const zipContent = JSON.stringify(logs, null, 2);
    
    // En réalité, on utiliserait une bibliothèque comme JSZip
    // Pour cette démo, on retourne le contenu JSON comme "ZIP"
    return zipContent;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuration Système</h2>
          <p className="text-gray-600 mt-1">Gestion des intégrations, emails, notifications et rôles</p>
        </div>
                 <div className="flex items-center space-x-4 text-sm text-gray-500">
           <div className="flex items-center space-x-2">
             <Settings size={16} />
             <span>Dernière sauvegarde: {lastBackupTime.toLocaleString('fr-FR')}</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className={`w-2 h-2 rounded-full ${autoBackupEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
             <span>Sauvegarde auto: {autoBackupEnabled ? 'Activée' : 'Désactivée'}</span>
           </div>
           {autoBackupEnabled && (
             <div className="flex items-center space-x-2 text-blue-600">
               <Clock size={14} />
               <span>Prochaine: {formatTimeUntilNextBackup()}</span>
             </div>
           )}
         </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('apis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'apis'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe size={16} className="inline mr-2" />
              Intégrations APIs
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'emails'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail size={16} className="inline mr-2" />
              Configuration Email
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notifications'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell size={16} className="inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'roles'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield size={16} className="inline mr-2" />
              Rôles & Permissions
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'system'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database size={16} className="inline mr-2" />
              Système
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'integrations'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Wifi size={16} className="inline mr-2" />
              Intégrations
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Intégrations APIs */}
          {activeTab === 'apis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Intégrations APIs</h3>
                <button
                  onClick={() => setShowApiModal(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Nouvelle API</span>
                </button>
              </div>

              <div className="grid gap-4">
                {apiConfigs.map((api) => (
                  <div key={api.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          api.status === 'active' ? 'bg-green-500' :
                          api.status === 'testing' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <h4 className="font-semibold text-gray-900">{api.name}</h4>
                        <span className="px-2 py-1 bg-gray-200 rounded text-xs font-medium">
                          {api.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestApi(api)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Tester l'API"
                        >
                          <TestTube size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleApiStatus(api.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            api.status === 'active'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={api.status === 'active' ? 'Désactiver' : 'Activer'}
                        >
                          {api.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Modifier">
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">URL:</span>
                        <span className="ml-2 font-mono text-gray-900">{api.baseUrl}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Statut:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          api.status === 'active' ? 'bg-green-100 text-green-800' :
                          api.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {api.status === 'active' ? 'Actif' : api.status === 'testing' ? 'Test' : 'Inactif'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Dernier test:</span>
                        <span className="ml-2 text-gray-900">
                          {api.lastTest ? new Date(api.lastTest).toLocaleString('fr-FR') : 'Jamais'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Description:</span>
                        <span className="ml-2 text-gray-900">{api.description}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Configuration Email */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Configuration Email</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowEmailCampaignModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>Campagne Email</span>
                  </button>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Nouvelle Configuration</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {emailConfigs.map((email) => (
                  <div key={email.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          email.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <h4 className="font-semibold text-gray-900">{email.provider.toUpperCase()}</h4>
                        <span className="px-2 py-1 bg-gray-200 rounded text-xs font-medium">
                          {email.encryption.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestEmail(email)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Tester l'envoi"
                        >
                          <TestTube size={16} />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Modifier">
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Serveur:</span>
                        <span className="ml-2 font-mono text-gray-900">{email.host}:{email.port}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Expéditeur:</span>
                        <span className="ml-2 text-gray-900">{email.fromName} &lt;{email.fromEmail}&gt;</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Utilisateur:</span>
                        <span className="ml-2 text-gray-900">{email.username}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Statut:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          email.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {email.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Templates de Notifications</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowNotificationTestModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <TestTube size={16} />
                    <span>Tester Notifications</span>
                  </button>
                  <button
                    onClick={() => setShowNotificationModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Nouveau Template</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {notificationTemplates.map((template) => (
                  <div key={template.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          template.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <span className="px-2 py-1 bg-gray-200 rounded text-xs font-medium">
                          {template.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreviewNotification(template)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Aperçu"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Modifier">
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">Sujet:</span>
                        <span className="ml-2 text-gray-900">{template.subject}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Contenu:</span>
                        <p className="mt-1 text-gray-900 bg-white p-2 rounded border">{template.content}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Variables:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {template.variables.map((variable) => (
                            <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Rôles & Permissions */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Rôles & Permissions</h3>
                                 <button
                   onClick={handleCreateNewRole}
                   className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                 >
                   <Plus size={16} />
                   <span>Nouveau Rôle</span>
                 </button>
              </div>

              <div className="grid gap-4">
                {userRoles.map((role) => (
                  <div key={role.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <h4 className="font-semibold text-gray-900">{role.name}</h4>
                        {role.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Par défaut
                          </span>
                        )}
                      </div>
                                             <div className="flex items-center space-x-2">
                         <button
                           onClick={() => handleViewUsers(role)}
                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                           title="Voir les utilisateurs"
                         >
                           <Users size={16} />
                         </button>
                         <button
                           onClick={() => handleEditRole(role)}
                           className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                           title="Modifier"
                         >
                           <Edit size={16} />
                         </button>
                         {!role.isDefault && (
                           <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                             <Trash2 size={16} />
                           </button>
                         )}
                       </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">Description:</span>
                        <span className="ml-2 text-gray-900">{role.description}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Utilisateurs:</span>
                        <span className="ml-2 text-gray-900">{role.usersCount} utilisateur(s)</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Permissions:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {role.permissions.map((permission) => (
                            <span key={permission} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                              {getPermissionLabel(permission)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Système */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuration Système</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Sauvegarde */}
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-3">
                       <Download size={20} className="text-blue-600" />
                       <h4 className="font-semibold text-gray-900">Sauvegarde Automatique</h4>
                     </div>
                     <div className="flex items-center space-x-2">
                       <span className={`px-2 py-1 rounded text-xs font-medium ${
                         autoBackupEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                       }`}>
                         {autoBackupEnabled ? 'Activée' : 'Désactivée'}
                       </span>
                       <button
                         onClick={toggleAutoBackup}
                         className={`p-1 rounded transition-colors ${
                           autoBackupEnabled 
                             ? 'text-red-600 hover:bg-red-50' 
                             : 'text-green-600 hover:bg-green-50'
                         }`}
                         title={autoBackupEnabled ? 'Désactiver' : 'Activer'}
                       >
                         {autoBackupEnabled ? <Lock size={14} /> : <Unlock size={14} />}
                       </button>
                     </div>
                   </div>
                   
                   <div className="space-y-3 text-sm">
                     <div className="flex justify-between">
                       <span className="text-gray-600">Dernière sauvegarde:</span>
                       <span className="text-gray-900">
                         {lastBackupTime.toLocaleString('fr-FR')}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Prochaine sauvegarde:</span>
                       <span className="text-gray-900 font-medium">
                         {formatTimeUntilNextBackup()}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Fréquence:</span>
                       <span className="text-gray-900">Toutes les 2 heures</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Taille:</span>
                       <span className="text-gray-900">1.2 GB</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Statut:</span>
                       <span className="text-green-600 font-medium">✓ Réussi</span>
                     </div>
                     
                     {/* Barre de progression pendant la sauvegarde */}
                     {isBackingUp && (
                       <div className="mt-3">
                         <div className="flex justify-between text-xs text-gray-600 mb-1">
                           <span>Sauvegarde en cours...</span>
                           <span>{backupProgress}%</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2">
                           <div 
                             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                             style={{ width: `${backupProgress}%` }}
                           ></div>
                         </div>
                       </div>
                     )}
                     
                     <div className="flex space-x-2 mt-3">
                       <button
                         onClick={performBackup}
                         disabled={isBackingUp}
                         className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                           isBackingUp
                             ? 'bg-gray-400 text-white cursor-not-allowed'
                             : 'bg-blue-600 text-white hover:bg-blue-700'
                         }`}
                       >
                         {isBackingUp ? 'Sauvegarde...' : 'Sauvegarder maintenant'}
                       </button>
                     </div>
                     

                   </div>
                 </div>

                {/* Maintenance */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Settings size={20} className="text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Maintenance</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode maintenance:</span>
                      <span className="text-red-600 font-medium">✗ Désactivé</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dernière maintenance:</span>
                      <span className="text-gray-900">Il y a 3 jours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée:</span>
                      <span className="text-gray-900">45 minutes</span>
                    </div>
                    <button className="w-full mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      Activer le mode maintenance
                    </button>
                  </div>
                </div>

                                 {/* Cache */}
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-3">
                       <Zap size={20} className="text-yellow-600" />
                       <h4 className="font-semibold text-gray-900">Gestion du Cache</h4>
                     </div>
                     <button
                       onClick={() => setShowCacheDetails(!showCacheDetails)}
                       className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                       title="Voir les détails"
                     >
                       <Eye size={16} />
                     </button>
                   </div>
                   
                   <div className="space-y-3 text-sm">
                     <div className="flex justify-between">
                       <span className="text-gray-600">Taille totale:</span>
                       <span className="text-gray-900 font-medium">{cacheStats.size} MB</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Hit rate:</span>
                       <span className={`font-medium ${
                         cacheStats.hitRate >= 80 ? 'text-green-600' :
                         cacheStats.hitRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                       }`}>
                         {cacheStats.hitRate}%
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Requêtes totales:</span>
                       <span className="text-gray-900">{cacheStats.totalRequests.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Dernier nettoyage:</span>
                       <span className="text-gray-900">
                         {cacheStats.lastCleanup.toLocaleString('fr-FR')}
                       </span>
                     </div>
                     
                     {/* Barre de progression pendant les opérations */}
                     {isClearingCache && (
                       <div className="mt-3">
                         <div className="flex justify-between text-xs text-gray-600 mb-1">
                           <span>{cacheOperation}</span>
                           <span>En cours...</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2">
                           <div className="bg-yellow-600 h-2 rounded-full animate-pulse"></div>
                         </div>
                       </div>
                     )}
                     
                     {/* Actions rapides */}
                     <div className="grid grid-cols-2 gap-2 mt-3">
                       <button
                         onClick={() => clearCache('all')}
                         disabled={isClearingCache}
                         className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                           isClearingCache
                             ? 'bg-gray-400 text-white cursor-not-allowed'
                             : 'bg-red-600 text-white hover:bg-red-700'
                         }`}
                       >
                         Vider tout
                       </button>
                       <button
                         onClick={optimizeCache}
                         disabled={isClearingCache}
                         className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                           isClearingCache
                             ? 'bg-gray-400 text-white cursor-not-allowed'
                             : 'bg-green-600 text-white hover:bg-green-700'
                         }`}
                       >
                         Optimiser
                       </button>
                     </div>
                     
                     {/* Actions avancées */}
                     <div className="grid grid-cols-2 gap-2">
                       <button
                         onClick={preloadCache}
                         disabled={isClearingCache}
                         className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                           isClearingCache
                             ? 'bg-gray-400 text-white cursor-not-allowed'
                             : 'bg-blue-600 text-white hover:bg-blue-700'
                         }`}
                       >
                         Précharger
                       </button>
                       <button
                         onClick={exportCacheStats}
                         disabled={isClearingCache}
                         className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                           isClearingCache
                             ? 'bg-gray-400 text-white cursor-not-allowed'
                             : 'bg-purple-600 text-white hover:bg-purple-700'
                         }`}
                       >
                         Exporter
                       </button>
                     </div>
                     
                     {/* Détails du cache par type */}
                     {showCacheDetails && (
                       <div className="mt-4 p-3 bg-white rounded border">
                         <h5 className="font-medium text-gray-900 mb-2">Détails par type</h5>
                         <div className="space-y-2 text-xs">
                           {Object.entries(cacheStats.cacheTypes).map(([type, stats]) => (
                             <div key={type} className="flex justify-between items-center">
                               <span className="text-gray-600 capitalize">{type}:</span>
                               <div className="flex items-center space-x-3">
                                 <span className="text-gray-900">{stats.size} MB</span>
                                 <span className="text-gray-500">({stats.items} items)</span>
                                 <span className={`px-1 rounded text-xs ${
                                   stats.hitRate >= 80 ? 'bg-green-100 text-green-800' :
                                   stats.hitRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                 }`}>
                                   {stats.hitRate}%
                                 </span>
                                 <button
                                   onClick={() => clearCache(type as any)}
                                   disabled={isClearingCache}
                                   className="text-red-600 hover:text-red-800 text-xs"
                                 >
                                   Vider
                                 </button>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                     

                   </div>
                 </div>

                                 {/* Logs */}
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-3">
                       <FileText size={20} className="text-gray-600" />
                       <h4 className="font-semibold text-gray-900">Logs Complets</h4>
                     </div>
                     <div className="flex items-center space-x-2">
                       <span className={`px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800`}>
                         Actif
                       </span>
                     </div>
                   </div>
                   
                   <div className="space-y-3 text-sm">
                     <div className="flex justify-between">
                       <span className="text-gray-600">Taille totale:</span>
                       <span className="text-gray-900 font-medium">2.8 GB</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Niveau de log:</span>
                       <span className="text-gray-900">INFO</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Rétention:</span>
                       <span className="text-gray-900">90 jours</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Dernière collecte:</span>
                       <span className="text-gray-900">
                         {new Date().toLocaleString('fr-FR')}
                       </span>
                     </div>
                     
                     {/* Barre de progression pendant le téléchargement */}
                     {isDownloadingLogs && (
                       <div className="mt-3">
                         <div className="flex justify-between text-xs text-gray-600 mb-1">
                           <span>{downloadStatus}</span>
                           <span>{downloadProgress}%</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2">
                           <div 
                             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                             style={{ width: `${downloadProgress}%` }}
                           ></div>
                         </div>
                       </div>
                     )}
                     
                     {/* Actions de téléchargement */}
                     <div className="space-y-2 mt-3">
                       <button
                         onClick={downloadAllLogs}
                         disabled={isDownloadingLogs}
                         className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                           isDownloadingLogs
                             ? 'bg-gray-400 text-white cursor-not-allowed'
                             : 'bg-blue-600 text-white hover:bg-blue-700'
                         }`}
                       >
                         <Download size={16} />
                         <span>
                           {isDownloadingLogs ? 'Téléchargement...' : 'Télécharger Tous les Logs'}
                         </span>
                       </button>
                       
                       <div className="grid grid-cols-2 gap-2">
                         <button
                           disabled={isDownloadingLogs}
                           className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                             isDownloadingLogs
                               ? 'bg-gray-400 text-white cursor-not-allowed'
                               : 'bg-green-600 text-white hover:bg-green-700'
                           }`}
                         >
                           Logs App
                         </button>
                         <button
                           disabled={isDownloadingLogs}
                           className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                             isDownloadingLogs
                               ? 'bg-gray-400 text-white cursor-not-allowed'
                               : 'bg-purple-600 text-white hover:bg-purple-700'
                           }`}
                         >
                           Logs Réseau
                         </button>
                       </div>
                     </div>
                     


                   </div>
                 </div>
              </div>
            </div>
          )}

          {/* Onglet Intégrations */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Intégrations Système</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Intégration Base de Données */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Intégration BDD</h3>
                    <Database className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Connexions actives</span>
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Types supportés</span>
                      <span className="text-sm font-medium">MySQL, PostgreSQL, SQL Server, Oracle, MongoDB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Statut</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Opérationnel</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => setShowDatabaseIntegrationModal(true)}
                      className="w-full bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center justify-center space-x-2"
                    >
                      <Database className="w-4 h-4" />
                      <span>Gérer les Connexions</span>
                    </button>
                  </div>
                </div>

                {/* Intégration Réseau */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Intégration Réseau</h3>
                    <Wifi className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Équipements surveillés</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Types supportés</span>
                      <span className="text-sm font-medium">Routeurs, Switches, Firewalls, DWDM, RTN, PTN</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Statut</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Surveillance active</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => setShowNetworkIntegrationModal(true)}
                      className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 flex items-center justify-center space-x-2"
                    >
                      <Wifi className="w-4 h-4" />
                      <span>Gérer les Équipements</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de campagne d'email */}
      <EmailCampaignModal
        isOpen={showEmailCampaignModal}
        onClose={() => setShowEmailCampaignModal(false)}
        clients={mockClients}
      />

             {/* Modal des utilisateurs par rôle */}
       {showUsersModal && selectedRole && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                   <Users size={20} className="text-blue-600" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-gray-900">Utilisateurs - {selectedRole.name}</h2>
                   <p className="text-sm text-gray-600">
                     {getUsersForRole(selectedRole.name).length} utilisateur(s) dans ce rôle
                   </p>
                 </div>
               </div>
               <button
                 onClick={() => setShowUsersModal(false)}
                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <X size={20} />
               </button>
             </div>

             <div className="p-6">
               <div className="mb-6">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-semibold text-gray-900">Liste des utilisateurs</h3>
                   <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
                     <Plus size={16} />
                     <span>Ajouter un utilisateur</span>
                   </button>
                 </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                   <thead>
                     <tr className="bg-gray-50 border-b border-gray-200">
                       <th className="text-left p-3 font-medium text-gray-900">Nom</th>
                       <th className="text-left p-3 font-medium text-gray-900">Email</th>
                       <th className="text-left p-3 font-medium text-gray-900">Statut</th>
                       <th className="text-left p-3 font-medium text-gray-900">Dernière connexion</th>
                       <th className="text-left p-3 font-medium text-gray-900">Date de création</th>
                       <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {getUsersForRole(selectedRole.name).map((user) => (
                       <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                         <td className="p-3">
                           <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                               <span className="text-sm font-medium text-gray-700">
                                 {user.name.split(' ').map(n => n[0]).join('')}
                               </span>
                             </div>
                             <span className="font-medium text-gray-900">{user.name}</span>
                           </div>
                         </td>
                         <td className="p-3 text-gray-700">{user.email}</td>
                         <td className="p-3">
                           <span className={`px-2 py-1 rounded text-xs font-medium ${
                             user.status === 'active' 
                               ? 'bg-green-100 text-green-800' 
                               : 'bg-red-100 text-red-800'
                           }`}>
                             {user.status === 'active' ? 'Actif' : 'Inactif'}
                           </span>
                         </td>
                         <td className="p-3 text-gray-700">
                           {user.lastLogin 
                             ? new Date(user.lastLogin).toLocaleString('fr-FR')
                             : 'Jamais'
                           }
                         </td>
                         <td className="p-3 text-gray-700">
                           {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                         </td>
                         <td className="p-3">
                           <div className="flex items-center space-x-2">
                             <button
                               onClick={() => handleToggleUserStatus(user)}
                               className={`p-2 rounded-lg transition-colors ${
                                 user.status === 'active'
                                   ? 'text-red-600 hover:bg-red-50'
                                   : 'text-green-600 hover:bg-green-50'
                               }`}
                               title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                             >
                               {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                             </button>
                             <button
                               onClick={() => handleEditUser(user)}
                               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                               title="Modifier"
                             >
                               <Edit size={16} />
                             </button>
                             <button
                               onClick={() => handleDeleteUser(user)}
                               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                               title="Supprimer"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {getUsersForRole(selectedRole.name).length === 0 && (
                 <div className="text-center py-8 text-gray-500">
                   <Users size={48} className="mx-auto mb-4 text-gray-300" />
                   <p>Aucun utilisateur dans ce rôle</p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

               {/* Modal de création d'un nouveau rôle */}
        {showNewRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Shield size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Créer un Nouveau Rôle</h2>
                    <p className="text-sm text-gray-600">Définir les permissions et accès du rôle</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewRoleModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form className="space-y-6" onSubmit={handleSubmitNewRole}>
                  {/* Informations de base */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du rôle *
                      </label>
                      <input
                        type="text"
                        name="roleName"
                        placeholder="Ex: Superviseur, Analyste, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        name="description"
                        placeholder="Description du rôle et de ses responsabilités"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Permissions par module */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Permissions par Module
                    </h3>

                    {/* Incidents */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <AlertTriangle size={16} className="mr-2 text-orange-600" />
                        Gestion des Incidents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="incidents.view_all" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                          <span className="text-sm text-gray-700">Voir tous les incidents</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="incidents.view_own" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                          <span className="text-sm text-gray-700">Voir ses propres incidents</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="incidents.create" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                          <span className="text-sm text-gray-700">Créer des incidents</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="incidents.edit" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                          <span className="text-sm text-gray-700">Modifier des incidents</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="incidents.delete" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                          <span className="text-sm text-gray-700">Supprimer des incidents</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="incidents.assign" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                          <span className="text-sm text-gray-700">Assigner des incidents</span>
                        </label>
                      </div>
                    </div>

                    {/* Monitoring */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Activity size={16} className="mr-2 text-blue-600" />
                        Monitoring Global
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="monitoring.view" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-gray-700">Voir le monitoring</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="monitoring.edit" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-gray-700">Modifier les seuils</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="monitoring.alerts" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-gray-700">Configurer les alertes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="monitoring.export" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-gray-700">Exporter les données</span>
                        </label>
                      </div>
                    </div>

                    {/* Clients */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Users size={16} className="mr-2 text-green-600" />
                        Gestion des Clients
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="clients.view" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span className="text-sm text-gray-700">Voir les clients</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="clients.create" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span className="text-sm text-gray-700">Créer des clients</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="clients.edit" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span className="text-sm text-gray-700">Modifier des clients</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="clients.delete" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span className="text-sm text-gray-700">Supprimer des clients</span>
                        </label>
                      </div>
                    </div>

                    {/* Pièces détachées */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Package size={16} className="mr-2 text-purple-600" />
                        Gestion des Pièces Détachées
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="spare_parts.view" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm text-gray-700">Voir le stock</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="spare_parts.add" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm text-gray-700">Ajouter des pièces</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="spare_parts.remove" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm text-gray-700">Retirer des pièces</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="spare_parts.validate" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm text-gray-700">Valider les transactions</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="spare_parts.manage" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm text-gray-700">Gérer les demandes</span>
                        </label>
                      </div>
                    </div>

                    {/* Suivi FME */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin size={16} className="mr-2 text-red-600" />
                        Contrôle des Équipes Terrain
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="tracking.view" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">Voir la carte</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="tracking.follow" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">Suivre les équipes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="tracking.assign" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">Assigner des zones</span>
                        </label>
                      </div>
                    </div>

                    {/* Facturation */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FileText size={16} className="mr-2 text-indigo-600" />
                        Facturation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="billing.view_own" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Voir sa facturation</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="billing.view_all" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Voir toutes les factures</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="billing.download" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Télécharger les factures</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="billing.manage" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Gérer les paiements</span>
                        </label>
                      </div>
                    </div>

                    {/* Configuration */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Settings size={16} className="mr-2 text-gray-600" />
                        Configuration Système
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="config.apis" className="rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
                          <span className="text-sm text-gray-700">Gérer les APIs</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="config.emails" className="rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
                          <span className="text-sm text-gray-700">Configurer les emails</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="config.notifications" className="rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
                          <span className="text-sm text-gray-700">Gérer les notifications</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="config.roles" className="rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
                          <span className="text-sm text-gray-700">Gérer les rôles</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="config.users" className="rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
                          <span className="text-sm text-gray-700">Gérer les utilisateurs</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" value="config.system" className="rounded border-gray-300 text-gray-600 focus:ring-gray-500" />
                          <span className="text-sm text-gray-700">Accès système complet</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowNewRoleModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Créer le Rôle</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de test des notifications */}
        {showNotificationTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TestTube size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Test des Notifications</h2>
                  <p className="text-sm text-gray-600">Tester les templates de notifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotificationTestModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sélectionner un template à tester</h3>
                <div className="grid gap-3">
                  {notificationService.getTemplates().map((template) => (
                    <button
                      key={template.id}
                      onClick={async () => {
                        try {
                          const testRecipients = [
                            {
                              id: 'test-client',
                              name: 'Client Test',
                              email: 'test@client.com',
                              phone: '+243999999999',
                              role: 'client',
                              type: 'client' as const
                            },
                            {
                              id: 'test-sav',
                              name: 'SAV Test',
                              email: 'test@sav.orange.com',
                              phone: '+243888888888',
                              role: 'SAV',
                              type: 'sav' as const
                            }
                          ];
                          
                          await notificationService.testNotification(template.id, testRecipients);
                          dialogService.success('Test Notification', `Test de notification envoyé avec succès !\nTemplate: ${template.name}\nDestinataires: ${testRecipients.map(r => r.email).join(', ')}`);
                        } catch (error) {
                          dialogService.error('Erreur Test', `Erreur lors du test: ${error}`);
                        }
                      }}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.type.toUpperCase()}</div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {template.variables.length} variable(s)
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Informations de test</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Les notifications de test seront envoyées aux adresses de test</p>
                  <p>• Vous pouvez consulter les logs dans la console du navigateur</p>
                  <p>• Les notifications réelles ne seront pas envoyées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'intégration des bases de données */}
      <DatabaseIntegrationModal 
        isOpen={showDatabaseIntegrationModal}
        onClose={() => setShowDatabaseIntegrationModal(false)}
      />

      {/* Modal d'intégration réseau */}
      <NetworkIntegrationModal 
        isOpen={showNetworkIntegrationModal}
        onClose={() => setShowNetworkIntegrationModal(false)}
      />
    </div>
  );
};
