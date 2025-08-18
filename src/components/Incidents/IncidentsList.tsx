

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  User as UserIcon, 
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Plus,
  Ticket,
  X,
  Wrench,
  Upload,
  Save,
  Bell
} from 'lucide-react';
import { Incident, User } from '../../types';
import { IncidentForm } from './IncidentForm';
import { IncidentDetailsModal } from './IncidentDetailsModal';
import { TicketTimelineModal } from './TicketTimelineModal';
import { notificationService } from '../../services/NotificationService';
import { NotificationLogsModal } from '../Configuration/NotificationLogsModal';
import { dialogService } from '../../services/dialogService';


interface IncidentsListProps {
  incidents: Incident[];
  connections: any[];
  currentUser: User | null;
  onCreateIncident: (incidentData: any) => void;
  onUpdateIncident: (incidentId: string, updateData: any) => void;
  selectedIncidentId?: string | null;
  onIncidentSelected?: () => void;
}

export const IncidentsList: React.FC<IncidentsListProps> = ({ 
  incidents, 
  connections, 
  currentUser,
  onCreateIncident,
  onUpdateIncident,
  selectedIncidentId,
  onIncidentSelected
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState<{
    title: string;
    status: string;
    incidents: Incident[];
  } | null>(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingIncident, setProcessingIncident] = useState<any>(null);
  const [processingData, setProcessingData] = useState({
    rootCause: '',
    actionTaken: '',
    interventionImages: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineIncident, setTimelineIncident] = useState<any>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedIncidentForAssignment, setSelectedIncidentForAssignment] = useState<any>(null);
  const [assignmentData, setAssignmentData] = useState({
    assignedTo: '',
    comment: ''
  });
  const [showNotificationLogs, setShowNotificationLogs] = useState(false);
  const [selectedTicketForNotifications, setSelectedTicketForNotifications] = useState<string | undefined>();

  // Ouvrir automatiquement le modal de détails si un incident est sélectionné via notification
  useEffect(() => {
    if (selectedIncidentId) {
      const incident = incidents.find(inc => inc.id === selectedIncidentId);
      if (incident) {
        setSelectedIncident(incident);
        setShowDetailsModal(true);
        // Appeler le callback pour réinitialiser l'ID sélectionné
        onIncidentSelected?.();
      }
    }
  }, [selectedIncidentId, incidents, onIncidentSelected]);

  // Fonction pour déclencher les notifications automatiquement
  const triggerNotification = async (incident: Incident, step: string, additionalData?: Record<string, string>) => {
    try {
      await notificationService.notifyTicketStep(incident, step, additionalData);
      console.log(`✅ Notification déclenchée pour le ticket ${incident.id} - étape: ${step}`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de la notification pour le ticket ${incident.id}:`, error);
    }
  };

  // Fonction pour ouvrir les logs de notifications
  const handleViewNotificationLogs = (ticketId?: string) => {
    setSelectedTicketForNotifications(ticketId);
    setShowNotificationLogs(true);
  };

  const filteredIncidents = incidents.filter(incident => {
    // Filtrage basé sur le rôle de l'utilisateur
    let hasAccess = false;
    
    if (!currentUser) return false;
    
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      hasAccess = true; // Les admins voient tous les incidents
    } else if (currentUser.role === 'maintenance') {
      // Chaque utilisateur voit seulement les tickets qu'il a créés, traités, résolus ou fermés
      hasAccess = incident.reportedBy === currentUser.name || 
                 incident.assignedTo === currentUser.subDepartment ||
                 incident.activatedTeam === currentUser.subDepartment;
    } else if (currentUser.role === 'client') {
      // Les clients voient seulement leurs propres tickets
      const isOwnTicket = incident.reportedBy === currentUser.name || 
                         incident.clientName === currentUser.name;
      hasAccess = isOwnTicket;
    }
    
    if (!hasAccess) return false;
    
    // Filtrage par recherche et filtres
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'text-green-700 bg-green-50 border-green-200',
      medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      high: 'text-orange-700 bg-orange-50 border-orange-200',
      critical: 'text-red-700 bg-red-50 border-red-200',
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'text-red-700 bg-red-50 border-red-200',
      acknowledged: 'text-orange-700 bg-orange-50 border-orange-200',
      team_activated: 'text-blue-700 bg-blue-50 border-blue-200',
      in_progress: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      resolved: 'text-green-700 bg-green-50 border-green-200',
      closed: 'text-gray-700 bg-gray-50 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      open: 'Ouvert',
      acknowledged: 'Acquitté',
      team_activated: 'Équipe activée',
      in_progress: 'En cours',
      resolved: 'Résolu',
      closed: 'Fermé',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique',
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculer les statistiques des tickets selon les permissions
  const getVisibleIncidents = () => {
    if (!currentUser) return [];
    
    return incidents.filter(incident => {
      if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
        return true;
      } else if (currentUser.role === 'maintenance') {
        if (currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV') {
          return true;
        } else if (currentUser.subDepartment === 'BO' || currentUser.subDepartment === 'FME') {
          return incident.reportedBy === currentUser.name || 
                 incident.assignedTo === currentUser.subDepartment ||
                 incident.activatedTeam === currentUser.subDepartment;
        }
      } else if (currentUser.role === 'client') {
        const isOwnTicket = incident.reportedBy === currentUser.name || 
                           incident.clientName === currentUser.name;
        return isOwnTicket && incident.status === 'closed';
      }
      return false;
    });
  };

  const visibleIncidents = getVisibleIncidents();
  
  const ticketStats = {
    created: visibleIncidents.filter(incident => incident.status === 'open').length,
    assigned: visibleIncidents.filter(incident => incident.status === 'acknowledged').length,
    inProgress: visibleIncidents.filter(incident => incident.status === 'in_progress').length,
    resolved: visibleIncidents.filter(incident => incident.status === 'resolved').length,
    closed: visibleIncidents.filter(incident => incident.status === 'closed').length,
  };

  const isOverdue = (slaDeadline: string, status: string) => {
    if (status === 'resolved' || status === 'closed') return false;
    return new Date() > new Date(slaDeadline);
  };

  const handleStatusClick = (status: string, title: string) => {
    if (!currentUser) return;
    
    const filteredIncidents = incidents.filter(incident => {
      // Appliquer le même filtrage par rôle que dans la liste principale
      let hasAccess = false;
      
      if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
        hasAccess = true;
      } else if (currentUser.role === 'maintenance') {
        if (currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV') {
          hasAccess = true;
        } else if (currentUser.subDepartment === 'BO' || currentUser.subDepartment === 'FME') {
          hasAccess = incident.reportedBy === currentUser.name || 
                     incident.assignedTo === currentUser.subDepartment ||
                     incident.activatedTeam === currentUser.subDepartment;
        }
      } else if (currentUser.role === 'client') {
        const isOwnTicket = incident.reportedBy === currentUser.name || 
                           incident.clientName === currentUser.name;
        hasAccess = isOwnTicket && incident.status === 'closed';
      }
      
      return hasAccess && incident.status === status;
    });
    
    if (filteredIncidents.length > 0) {
      setStatusModalData({
        title,
        status,
        incidents: filteredIncidents
      });
      setShowStatusModal(true);
    }
  };

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowDetailsModal(true);
    setShowStatusModal(false);
  };

  const handleTimelineClick = (incident: Incident) => {
    setTimelineIncident(incident);
    setShowTimelineModal(true);
    setShowStatusModal(false);
  };

  const handleProcessTicket = (incident: Incident) => {
    setProcessingIncident(incident);
    setProcessingData({
      rootCause: '',
      actionTaken: '',
      interventionImages: []
    });
    setShowProcessingModal(true);
    setShowStatusModal(false);
  };

  const handleSubmitProcessing = async () => {
    if (!processingData.rootCause.trim() || !processingData.actionTaken.trim()) {
      dialogService.error('Validation Requise', 'Veuillez remplir la cause racine et l\'action effectuée');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const updateData = {
        ...processingIncident,
        status: 'resolved',
        processedAt: now,
        resolvedAt: now,
        processing: {
          rootCause: processingData.rootCause,
          actionTaken: processingData.actionTaken,
          interventionImages: processingData.interventionImages,
          processedBy: currentUser?.name || 'Utilisateur inconnu',
          processedAt: now
        },
        ticketLifecycle: [
          ...processingIncident.ticketLifecycle,
          {
            step: 'processed',
            timestamp: now,
            user: currentUser?.name || 'Utilisateur inconnu',
            comment: `Traité: ${processingData.actionTaken}`
          }
        ]
      };

      onUpdateIncident(processingIncident.id, updateData);
      
      // Déclencher la notification de résolution
      await triggerNotification(updateData, 'resolved', {
        resolvedBy: currentUser?.name || 'Technicien',
        resolution: processingData.actionTaken,
        resolutionTime: 'N/A' // À calculer selon la logique métier
      });
      
      // Reset form
      setProcessingData({
        rootCause: '',
        actionTaken: '',
        interventionImages: []
      });
      setIsSubmitting(false);
      setShowProcessingModal(false);
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      dialogService.error('Erreur Traitement', 'Erreur lors du traitement du ticket');
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setProcessingData(prev => ({
      ...prev,
      interventionImages: [...prev.interventionImages, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setProcessingData(prev => ({
      ...prev,
      interventionImages: prev.interventionImages.filter((_, i) => i !== index)
    }));
  };

  // Fonctions pour l'assignation de support
  const handleAssignSupport = (incident: Incident) => {
    setSelectedIncidentForAssignment(incident);
    setAssignmentData({
      assignedTo: '',
      comment: ''
    });
    setShowAssignmentModal(true);
  };

  const handleAssignmentSubmit = async () => {
    if (!assignmentData.assignedTo.trim()) {
      dialogService.error('Support Requis', 'Veuillez sélectionner un support');
      return;
    }

    if (!currentUser) return;

    try {
      const now = new Date().toISOString();
      const updateData = {
        ...selectedIncidentForAssignment,
        assignedTo: assignmentData.assignedTo,
        status: 'acknowledged',
        acknowledgedAt: now,
        ticketLifecycle: [
          ...selectedIncidentForAssignment.ticketLifecycle,
          {
            step: 'assigned',
            timestamp: now,
            user: currentUser.name,
            comment: `Assigné à ${assignmentData.assignedTo}${assignmentData.comment ? ` - ${assignmentData.comment}` : ''}`
          }
        ]
      };

      onUpdateIncident(selectedIncidentForAssignment.id, updateData);
      
      // Déclencher la notification d'acquittement
      await triggerNotification(updateData, 'acknowledged', {
        acknowledgedBy: currentUser.name,
        assignedTeam: assignmentData.assignedTo
      });
      
      setAssignmentData({
        assignedTo: '',
        comment: ''
      });
      setShowAssignmentModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      dialogService.error('Erreur Assignation', 'Erreur lors de l\'assignation du ticket');
    }
  };

  const canAssignSupport = (incident: Incident) => {
    if (!currentUser) return false;
    
    // Le NOC et le SAV peuvent assigner des tickets
    if (currentUser.subDepartment !== 'NOC' && currentUser.subDepartment !== 'SAV') return false;
    
    // Le ticket doit être ouvert ou acquitté
    return incident.status === 'open' || incident.status === 'acknowledged';
  };

  const getAvailableSupports = () => {
    if (!currentUser) return [];
    
    if (currentUser.subDepartment === 'NOC') {
      // Le NOC peut assigner aux BO ou SAV
      return [
        { value: 'BO', label: 'Back Office (BO)' },
        { value: 'SAV', label: 'Service Après-Vente (SAV)' }
      ];
    } else if (currentUser.subDepartment === 'SAV') {
      // Le SAV peut assigner à tout le monde
      return [
        { value: 'NOC', label: 'Network Operations Center (NOC)' },
        { value: 'BO', label: 'Back Office (BO)' },
        { value: 'FME', label: 'Field Maintenance Engineer (FME)' },
        { value: 'SAV', label: 'Service Après-Vente (SAV)' }
      ];
    }
    
    return [];
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des Incidents</h2>
            <p className="text-gray-600 mt-1">Suivi et résolution des incidents clients</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleViewNotificationLogs()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Bell size={18} />
              <span>Logs Notifications</span>
            </button>
            <button 
              onClick={() => setShowIncidentForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2 transition-colors"
            >
              <Plus size={18} />
              <span>Nouveau Ticket</span>
            </button>
          </div>
        </div>
      </div>



      {/* Section des Statistiques des Tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Statistiques des Tickets</h3>
            <p className="text-gray-600 text-sm">
              {currentUser ? `Tickets pour ${currentUser.name} (${currentUser.role})` : 'Tous les tickets'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Ticket size={20} className="text-orange-600" />
            <span className="text-sm text-gray-600">Total: {incidents.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tickets Créés */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket size={20} className="text-blue-600" />
              </div>
              <span className="text-xs text-blue-600 font-medium">Créés</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{ticketStats.created}</div>
            <p className="text-sm text-blue-700">Tickets ouverts</p>
          </div>

          {/* Tickets Assignés */}
          <div 
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => handleStatusClick('acknowledged', 'Tickets Assignés')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <span className="text-xs text-yellow-600 font-medium">Assignés</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">{ticketStats.assigned}</div>
            <p className="text-sm text-yellow-700">Tickets assignés</p>
          </div>

          {/* Tickets en Cours */}
          <div 
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => handleStatusClick('in_progress', 'Tickets en Cours')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock size={20} className="text-blue-600" />
              </div>
              <span className="text-xs text-blue-600 font-medium">En cours</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{ticketStats.inProgress}</div>
            <p className="text-sm text-blue-700">En traitement</p>
          </div>

          {/* Tickets Résolus */}
          <div 
            className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => handleStatusClick('resolved', 'Problèmes Résolus')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">Résolus</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{ticketStats.resolved}</div>
            <p className="text-sm text-green-700">Problèmes résolus</p>
          </div>

          {/* Tickets Fermés */}
          <div 
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => handleStatusClick('closed', 'Tickets Fermés')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle size={20} className="text-gray-600" />
              </div>
              <span className="text-xs text-gray-600 font-medium">Fermés</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{ticketStats.closed}</div>
            <p className="text-sm text-gray-700">Tickets fermés</p>
          </div>
        </div>


      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, client ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="open">Ouvert</option>
                <option value="acknowledged">Acquitté</option>
                <option value="team_activated">Équipe activée</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
              
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Toutes les priorités</option>
                <option value="low">Faible</option>
                <option value="medium">Moyen</option>
                <option value="high">Élevé</option>
                <option value="critical">Critique</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                      {getSeverityLabel(incident.severity)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                      {getStatusLabel(incident.status)}
                    </span>
                    {isOverdue(incident.slaDeadline, incident.status) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        <Clock size={12} className="mr-1" />
                        En retard
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.title}</h3>
                  <p className="text-gray-600 mb-3">{incident.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <UserIcon size={16} />
                      <div>
                        <div className="font-medium">Client:</div>
                        <div>{incident.clientName}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <div>
                        <div className="font-medium">Signalé le:</div>
                        <div>{formatDate(incident.reportedDate)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <div>
                        <div className="font-medium">Échéance SLA:</div>
                        <div className={isOverdue(incident.slaDeadline, incident.status) ? 'text-red-600 font-medium' : ''}>
                          {formatDate(incident.slaDeadline)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {incident.assignedTo && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Assigné à:</span> {incident.assignedTo}
                    </div>
                  )}
                  
                  {incident.resolution && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-800">
                        <CheckCircle size={16} />
                        <span className="font-medium">Résolution:</span>
                      </div>
                      <p className="text-green-700 mt-1">
                        {typeof incident.resolution === 'string' 
                          ? incident.resolution 
                          : incident.resolution.solution || 'Résolu'
                        }
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button 
                    onClick={() => {
                      setSelectedIncident(incident);
                      setShowDetailsModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                  >
                    Détails du ticket
                  </button>
                  
                  {/* Bouton d'assignation pour le NOC */}
                  {canAssignSupport(incident) && (
                    <button 
                      onClick={() => handleAssignSupport(incident)}
                      className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50"
                      title="Assigner le support"
                    >
                      Assigner
                    </button>
                  )}
                  {(currentUser?.role === 'maintenance' || currentUser?.role === 'admin') && incident.status !== 'closed' && (
                    <button 
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir fermer ce ticket ?')) {
                          const newLifecycleStep = {
                            step: 'closed',
                            status: 'completed',
                            timestamp: new Date().toISOString(),
                            user: currentUser?.name || 'Utilisateur inconnu',
                            comment: 'Ticket fermé depuis la liste'
                          };

                          const updatedLifecycle = [
                            ...(incident.ticketLifecycle || []),
                            newLifecycleStep
                          ];

                          onUpdateIncident(incident.id, {
                            status: 'closed',
                            ticketLifecycle: updatedLifecycle
                          });
                        }
                      }}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                      title="Fermer le ticket"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                  {incident.status !== 'closed' && (
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50">
                      Fermer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredIncidents.length === 0 && (
            <div className="p-12 text-center">
              <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun incident trouvé</p>
            </div>
          )}
        </div>
      </div>

      {showIncidentForm && (
        <IncidentForm
          connections={connections}
          currentUser={currentUser}
          onClose={() => setShowIncidentForm(false)}
          onSubmit={onCreateIncident}
        />
      )}

      {showDetailsModal && selectedIncident && (
        <IncidentDetailsModal
          incident={selectedIncident}
          currentUser={currentUser}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedIncident(null);
          }}
          onUpdate={onUpdateIncident}
        />
      )}

      {/* Modal pour afficher les tickets d'un statut spécifique */}
      {showStatusModal && statusModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-50 p-2 rounded-lg">
                  <Ticket size={24} className="text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{statusModalData.title}</h2>
                  <p className="text-gray-600 text-sm">
                    {statusModalData.incidents.length} ticket(s) trouvé(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Liste des tickets */}
            <div className="p-6">
              <div className="space-y-4">
                {statusModalData.incidents.map((incident) => (
                  <div 
                    key={incident.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleIncidentClick(incident)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                            {getSeverityLabel(incident.severity)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                            {getStatusLabel(incident.status)}
                          </span>
                          {isOverdue(incident.slaDeadline, incident.status) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <Clock size={12} className="mr-1" />
                              En retard
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.title}</h3>
                        <p className="text-gray-600 mb-3">{incident.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <UserIcon size={16} />
                            <div>
                              <div className="font-medium">Client:</div>
                              <div>{incident.clientName}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar size={16} />
                            <div>
                              <div className="font-medium">Signalé le:</div>
                              <div>{formatDate(incident.reportedDate)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock size={16} />
                            <div>
                              <div className="font-medium">Échéance SLA:</div>
                              <div className={isOverdue(incident.slaDeadline, incident.status) ? 'text-red-600' : ''}>
                                {formatDate(incident.slaDeadline)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {incident.assignedTo && (
                          <div className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">Assigné à:</span> {incident.assignedTo}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex space-x-2">
                        {/* Bouton Timeline pour tous */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTimelineClick(incident);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50 flex items-center space-x-1"
                          title="Voir la timeline"
                        >
                          <Clock size={16} />
                          <span>Timeline</span>
                        </button>

                        {/* Bouton Traiter pour les tickets en cours */}
                        {incident.status === 'in_progress' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProcessTicket(incident);
                            }}
                            className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 flex items-center space-x-1"
                            title="Traiter le ticket"
                          >
                            <Wrench size={16} />
                            <span>Traiter</span>
                          </button>
                        )}
                        
                        {/* Bouton Voir détails pour tous */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIncidentClick(incident);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                        >
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {statusModalData.incidents.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun ticket trouvé dans cette catégorie</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails des incidents */}
      {showDetailsModal && selectedIncident && (
        <IncidentDetailsModal
          incident={selectedIncident}
          currentUser={currentUser}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedIncident(null);
          }}
          onUpdate={onUpdateIncident}
        />
      )}

      {/* Modal de traitement des tickets en cours */}
      {showProcessingModal && processingIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <Wrench size={24} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Traiter le Ticket #{processingIncident.id}</h2>
                  <p className="text-gray-600 text-sm">Remplissez les informations de traitement</p>
                </div>
              </div>
              <button
                onClick={() => setShowProcessingModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Informations du ticket */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Ticket à traiter</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Titre:</span> {processingIncident.title}</p>
                  <p><span className="font-medium">Client:</span> {processingIncident.clientName}</p>
                  <p><span className="font-medium">Description:</span> {processingIncident.description}</p>
                </div>
              </div>

              {/* Formulaire de traitement */}
              <div className="space-y-6">
                {/* Cause racine */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cause racine du problème *
                  </label>
                  <textarea
                    value={processingData.rootCause}
                    onChange={(e) => setProcessingData(prev => ({ ...prev, rootCause: e.target.value }))}
                    rows={4}
                    placeholder="Décrivez la cause racine du problème identifiée..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Action effectuée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action effectuée lors de l'intervention *
                  </label>
                  <textarea
                    value={processingData.actionTaken}
                    onChange={(e) => setProcessingData(prev => ({ ...prev, actionTaken: e.target.value }))}
                    rows={4}
                    placeholder="Décrivez en détail l'action effectuée pour résoudre le problème..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Images d'intervention */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images de l'intervention
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />

                    {/* Aperçu des images */}
                    {processingData.interventionImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {processingData.interventionImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations de traitement */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wrench size={16} className="text-purple-600" />
                    <span className="font-medium text-purple-900">Informations de traitement</span>
                  </div>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p><span className="font-medium">Traité par:</span> {currentUser?.name || 'Utilisateur inconnu'}</p>
                    <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowProcessingModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitProcessing}
                disabled={!processingData.rootCause.trim() || !processingData.actionTaken.trim() || isSubmitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Traitement...' : 'Traiter le ticket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création d'incident */}
      {showIncidentForm && (
        <IncidentForm
          connections={connections}
          currentUser={currentUser}
          onClose={() => setShowIncidentForm(false)}
          onSubmit={onCreateIncident}
        />
      )}

      {/* Modal de timeline */}
      {showTimelineModal && timelineIncident && (
        <TicketTimelineModal
          incident={timelineIncident}
          isOpen={showTimelineModal}
          onClose={() => {
            setShowTimelineModal(false);
            setTimelineIncident(null);
          }}
        />
      )}

      {/* Modal d'assignation de support */}
      {showAssignmentModal && selectedIncidentForAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <UserIcon size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assigner le Support</h3>
                  <p className="text-sm text-gray-600">
                    Ticket #{selectedIncidentForAssignment.id} - {currentUser?.subDepartment === 'NOC' ? 'NOC' : currentUser?.subDepartment === 'SAV' ? 'SAV' : ''} assigne
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Informations du ticket */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedIncidentForAssignment.title}</h4>
                <p className="text-sm text-gray-600">{selectedIncidentForAssignment.clientName}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedIncidentForAssignment.severity)}`}>
                    {getSeverityLabel(selectedIncidentForAssignment.severity)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedIncidentForAssignment.status)}`}>
                    {getStatusLabel(selectedIncidentForAssignment.status)}
                  </span>
                </div>
              </div>

              {/* Sélection du support */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support à assigner *
                </label>
                <select
                  value={assignmentData.assignedTo}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Sélectionner un support</option>
                  {getAvailableSupports().map((support) => (
                    <option key={support.value} value={support.value}>
                      {support.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commentaire optionnel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={assignmentData.comment}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Raison de l'assignation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Informations d'assignation */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <UserIcon size={16} className="text-purple-600" />
                  <span className="font-medium text-purple-900">Informations d'assignation</span>
                </div>
                <div className="text-sm text-purple-700 space-y-1">
                  <p><span className="font-medium">Assigné par:</span> {currentUser?.name} ({currentUser?.subDepartment})</p>
                  <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString('fr-FR')}</p>
                  <p><span className="font-medium">Permissions:</span> {currentUser?.subDepartment === 'NOC' ? 'NOC → BO/SAV' : currentUser?.subDepartment === 'SAV' ? 'SAV → Tous services' : 'Aucune'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAssignmentSubmit}
                disabled={!assignmentData.assignedTo.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Assigner le Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des logs de notifications */}
      <NotificationLogsModal
        isOpen={showNotificationLogs}
        onClose={() => setShowNotificationLogs(false)}
        selectedTicketId={selectedTicketForNotifications}
      />
    </div>
  );
};