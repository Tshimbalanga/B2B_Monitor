import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  PowerOff,
  AlertCircle
} from 'lucide-react';
import { Request } from '../../types';
import DeactivationRequestForm from './DeactivationRequestForm';
import DeactivationValidationModal from './DeactivationValidationModal';
import RequestDetailsModal from './RequestDetailsModal';

interface DeactivationRequestsListProps {
  requests: Request[];
  currentUser?: any;
  onAddRequest?: (requestData: any) => void;
  onValidationUpdate?: (requestId: string, validationData: any) => void;
  connections?: any[];
  onConnectionDeactivation?: (connectionId: string, deactivationData: any) => void;
}

export const DeactivationRequestsList: React.FC<DeactivationRequestsListProps> = ({ 
  requests, 
  currentUser, 
  onAddRequest, 
  onValidationUpdate,
  connections = [],
  onConnectionDeactivation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showDeactivationForm, setShowDeactivationForm] = useState(false);
  const [showDeactivationValidation, setShowDeactivationValidation] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Filtrer seulement les demandes de désactivation
  const deactivationRequests = requests.filter(request => request.type === 'deactivation');

  const filteredRequests = deactivationRequests.filter(request => {
    const matchesSearch = request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calcul du SLA pour les demandes de désactivation
  const calculateSLA = (request: Request) => {
    const SLA_DAYS = 7; // SLA de 7 jours pour les désactivations
    const creationDate = new Date(request.submittedDate);
    const currentDate = new Date();
    
    // Si la demande est terminée, utiliser la date de fin
    let endDate = currentDate;
    if (request.status === 'deactivation_completed' && request.completionDate) {
      endDate = new Date(request.completionDate);
    }
    
    const timeElapsed = endDate.getTime() - creationDate.getTime();
    const daysElapsed = Math.ceil(timeElapsed / (1000 * 60 * 60 * 24));
    
    let level = 'critical';
    if (daysElapsed <= 3) level = 'good';
    else if (daysElapsed <= 7) level = 'warning';
    else level = 'critical';
    
    const slaPercentage = Math.max(0, ((SLA_DAYS - daysElapsed) / SLA_DAYS) * 100);
    
    return {
      percentage: Math.round(slaPercentage),
      daysElapsed: daysElapsed,
      level,
      isOverdue: daysElapsed > SLA_DAYS,
      isNearDeadline: daysElapsed >= 4 && daysElapsed <= 7
    };
  };

  const getSLAColor = (slaData: any) => {
    switch (slaData.level) {
      case 'good': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSLALabel = (slaData: any) => {
    if (slaData.isOverdue) return 'Hors SLA';
    if (slaData.level === 'good') return 'Bon (0-3 jours)';
    if (slaData.level === 'warning') return 'Avertissement (4-7 jours)';
    return 'Critique (&gt;7 jours)';
  };

  const getSLAProgressColor = (slaData: any) => {
    if (slaData.isOverdue) return '#dc2626';
    if (slaData.level === 'good') return '#059669';
    if (slaData.level === 'warning') return '#d97706';
    return '#dc2626';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      deactivation_requested: 'text-red-700 bg-red-100 border-red-300',
      deactivation_approved: 'text-orange-700 bg-orange-100 border-orange-300',
      deactivation_rejected: 'text-red-700 bg-red-100 border-red-300',
      deactivation_in_progress: 'text-blue-700 bg-blue-100 border-blue-300',
      deactivation_completed: 'text-gray-700 bg-gray-100 border-gray-300',
    };
    return colors[status as keyof typeof colors] || colors.deactivation_requested;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      deactivation_requested: 'Désactivation demandée',
      deactivation_approved: 'Désactivation approuvée',
      deactivation_rejected: 'Désactivation rejetée',
      deactivation_in_progress: 'Désactivation en cours',
      deactivation_completed: 'Désactivation terminée',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-700 bg-gray-100 border-gray-300',
      medium: 'text-yellow-700 bg-yellow-100 border-yellow-300',
      high: 'text-red-700 bg-red-100 border-red-300',
      urgent: 'text-red-800 bg-red-200 border-red-400',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Fonction pour déterminer qui a la main pour la validation
  const getCurrentValidator = (request: Request) => {
    if (request.status === 'deactivation_requested' || request.status === 'deactivation_approved') {
      const pendingDeactivation = request.deactivationSteps?.find(step => step.status === 'pending');
      return pendingDeactivation ? pendingDeactivation.role : 'En attente de validation désactivation';
    }
    
    if (request.status === 'deactivation_completed') {
      return 'Terminé';
    }
    
    if (request.status === 'deactivation_rejected') {
      return 'Rejeté';
    }
    
    return 'En cours';
  };

  // Statistiques SLA
  const slaStats = filteredRequests.reduce((acc, req) => {
    const slaData = calculateSLA(req);
    acc[slaData.level as keyof typeof acc]++;
    return acc;
  }, { good: 0, warning: 0, critical: 0 });

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Demandes de Résiliation</h2>
            <p className="text-gray-600 mt-1">Gestion des demandes de désactivation de liaisons</p>
          </div>
          <button 
            onClick={() => setShowDeactivationForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
          >
            <PowerOff size={18} />
            <span>Nouvelle résiliation</span>
          </button>
        </div>
      </div>

      {/* Tableau de bord SLA pour résiliations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tableau de bord SLA - Résiliations</h3>
          <p className="text-sm text-gray-500">SLA de 7 jours pour les désactivations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bon (0-3 jours)</p>
                <p className="text-2xl font-bold text-emerald-600">{slaStats.good}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avertissement (4-7 jours)</p>
                <p className="text-2xl font-bold text-amber-600">{slaStats.warning}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critique (&gt;7 jours)</p>
                <p className="text-2xl font-bold text-red-600">{slaStats.critical}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
              </div>
            </div>
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
                placeholder="Rechercher par client ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="deactivation_requested">Désactivation demandée</option>
                <option value="deactivation_approved">Désactivation approuvée</option>
                <option value="deactivation_rejected">Désactivation rejetée</option>
                <option value="deactivation_in_progress">Désactivation en cours</option>
                <option value="deactivation_completed">Désactivation terminée</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Toutes les priorités</option>
                <option value="urgent">Urgent</option>
                <option value="high">Élevé</option>
                <option value="medium">Moyen</option>
                <option value="low">Faible</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredRequests.map((request) => {
            const slaData = calculateSLA(request);
            return (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.clientName}</h3>
                        <p className="text-sm text-gray-600">Créée le {formatDate(request.submittedDate)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                          {getPriorityLabel(request.priority)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSLAColor(slaData)}`}>
                          {getSLALabel(slaData)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Validation en cours :</span> {getCurrentValidator(request)}
                      </p>
                      
                      {/* Description de la demande */}
                      {request.description && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Description :</span> {request.description}
                          </p>
                        </div>
                      )}

                      {/* Raison de désactivation */}
                      {request.deactivationReason && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Raison :</span> {
                              request.deactivationReason === 'client_request' && 'Demande du client'
                              || request.deactivationReason === 'payment_issues' && 'Problèmes de paiement'
                              || request.deactivationReason === 'contract_termination' && 'Fin de contrat'
                              || request.deactivationReason === 'technical_issues' && 'Problèmes techniques'
                              || request.deactivationReason === 'maintenance' && 'Maintenance préventive'
                              || request.deactivationReason === 'upgrade' && 'Mise à niveau'
                              || request.deactivationReason === 'other' && 'Autre'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const updatedRequest = requests.find(r => r.id === request.id) || request;
                        setSelectedRequest(updatedRequest);
                        
                        if (showRequestDetails && selectedRequest?.id === request.id) {
                          setShowRequestDetails(false);
                          setTimeout(() => {
                            setShowRequestDetails(true);
                          }, 100);
                        } else {
                          setShowRequestDetails(true);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        showRequestDetails && selectedRequest?.id === request.id
                          ? 'text-white bg-blue-600 hover:bg-blue-700'
                          : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                      }`}
                      title="Voir les détails"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    {/* Actions pour les demandes de désactivation */}
                    {(request.status === 'deactivation_requested' || request.status === 'deactivation_approved') && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDeactivationValidation(true);
                        }}
                        className="text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Valider la désactivation"
                      >
                        <PowerOff size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredRequests.length === 0 && (
            <div className="p-12 text-center">
              <PowerOff size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune demande de résiliation trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Deactivation Request Form Modal */}
      {showDeactivationForm && (
        <DeactivationRequestForm
          isOpen={showDeactivationForm}
          onClose={() => setShowDeactivationForm(false)}
          onSubmit={(requestData) => {
            if (onAddRequest) {
              onAddRequest(requestData);
            }
            setShowDeactivationForm(false);
          }}
          connections={connections}
          currentUser={currentUser}
        />
      )}

      {/* Deactivation Validation Modal */}
      {showDeactivationValidation && selectedRequest && onValidationUpdate && onConnectionDeactivation && (
        <DeactivationValidationModal
          isOpen={showDeactivationValidation}
          onClose={() => setShowDeactivationValidation(false)}
          request={selectedRequest}
          currentUser={currentUser}
          onValidationUpdate={onValidationUpdate}
          onConnectionDeactivation={onConnectionDeactivation}
        />
      )}

      {/* Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <RequestDetailsModal
          request={requests.find(r => r.id === selectedRequest.id) || selectedRequest}
          isOpen={showRequestDetails}
          onClose={() => {
            setShowRequestDetails(false);
          }}
          calculateSLA={calculateSLA}
          getSLAColor={getSLAColor}
          getSLALabel={getSLALabel}
          getSLAProgressColor={getSLAProgressColor}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          getPriorityColor={getPriorityColor}
          getPriorityLabel={getPriorityLabel}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};
