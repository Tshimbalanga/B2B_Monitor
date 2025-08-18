import React, { useState, useEffect } from 'react';
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
  Play,
  Handshake,
  AlertCircle,
  PowerOff
} from 'lucide-react';
import { Request } from '../../types';
import { RequestForm } from './RequestForm';
import { RequestValidation } from './RequestValidation';
import { RequestLaunchForm } from './RequestLaunchForm';
import { HandoverValidation } from './HandoverValidation';
import RequestDetailsModal from './RequestDetailsModal';
import { dialogService } from '../../services/dialogService';


interface RequestsListProps {
  requests: Request[];
  currentUser?: any;
  onAddRequest?: (requestData: any) => void;
  onValidationUpdate?: (requestId: string, validationData: any) => void;
  onAddConnection?: (connectionData: any) => void;
  connections?: any[];
  onConnectionDeactivation?: (connectionId: string, deactivationData: any) => void;
  selectedRequestId?: string | null;
  onRequestSelected?: () => void;
}

export const RequestsList: React.FC<RequestsListProps> = ({ 
  requests, 
  currentUser, 
  onAddRequest, 
  onValidationUpdate, 
  onAddConnection,
  connections = [],
  onConnectionDeactivation,
  selectedRequestId,
  onRequestSelected
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showLaunchForm, setShowLaunchForm] = useState(false);
  const [showHandoverValidation, setShowHandoverValidation] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Ouvrir automatiquement le modal de détails si une demande est sélectionnée via notification
  useEffect(() => {
    if (selectedRequestId) {
      const request = requests.find(req => req.id === selectedRequestId);
      if (request) {
        setSelectedRequest(request);
        setShowRequestDetails(true);
        // Appeler le callback pour réinitialiser l'ID sélectionné
        onRequestSelected?.();
      }
    }
  }, [selectedRequestId, requests, onRequestSelected]);

  // Filtrer seulement les demandes de création (pas les désactivations)
  const creationRequests = requests.filter(request => request.type === 'new_connection');

  const filteredRequests = creationRequests.filter(request => {
    const matchesSearch = request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });



  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-700 bg-gray-100 border-gray-300',
      medium: 'text-blue-700 bg-blue-100 border-blue-300',
      high: 'text-orange-700 bg-orange-100 border-orange-300',
      urgent: 'text-red-700 bg-red-100 border-red-300',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-gray-700 bg-gray-100 border-gray-300',
      approved: 'text-emerald-700 bg-emerald-100 border-emerald-300',
      rejected: 'text-red-700 bg-red-100 border-red-300',
      in_progress: 'text-blue-700 bg-blue-100 border-blue-300',
      completed: 'text-gray-700 bg-gray-100 border-gray-300',
      in_validation: 'text-purple-700 bg-purple-100 border-purple-300',
      ready_to_start: 'text-emerald-700 bg-emerald-100 border-emerald-300',
      launched: 'text-blue-700 bg-blue-100 border-blue-300',
      in_handover: 'text-purple-700 bg-purple-100 border-purple-300',
      handover_rejected: 'text-red-700 bg-red-100 border-red-300',
      // Statuts de désactivation
      deactivation_requested: 'text-red-700 bg-red-100 border-red-300',
      deactivation_approved: 'text-orange-700 bg-orange-100 border-orange-300',
      deactivation_rejected: 'text-red-700 bg-red-100 border-red-300',
      deactivation_in_progress: 'text-blue-700 bg-blue-100 border-blue-300',
      deactivation_completed: 'text-gray-700 bg-gray-100 border-gray-300',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      in_progress: 'En cours',
      completed: 'Terminé',
      in_validation: 'En validation',
      ready_to_start: 'Prêt à démarrer',
      launched: 'Lancé',
      in_handover: 'En handover',
      handover_rejected: 'Handover rejeté',
      // Labels de désactivation
      deactivation_requested: 'Désactivation demandée',
      deactivation_approved: 'Désactivation approuvée',
      deactivation_rejected: 'Désactivation rejetée',
      deactivation_in_progress: 'Désactivation en cours',
      deactivation_completed: 'Désactivation terminée',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      urgent: 'Urgent',
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
    // Si la demande est en validation initiale
    if (request.status === 'pending' || request.status === 'in_validation') {
      const pendingValidation = request.validationSteps?.find(step => step.status === 'pending');
      return pendingValidation ? pendingValidation.role : 'En attente de validation';
    }
    
    // Si la demande est prête à démarrer
    if (request.status === 'ready_to_start') {
      return 'Chef de Projet (Lancement)';
    }
    
    // Si la demande est lancée et en handover
    if (request.status === 'launched' || request.status === 'in_handover') {
      const pendingHandover = request.handoverSteps?.find(step => step.status === 'pending');
      return pendingHandover ? pendingHandover.role : 'En attente de handover';
    }
    
    // Si la demande est en désactivation
    if (request.status === 'deactivation_requested' || request.status === 'deactivation_approved') {
      const pendingDeactivation = request.deactivationSteps?.find(step => step.status === 'pending');
      return pendingDeactivation ? pendingDeactivation.role : 'En attente de validation désactivation';
    }
    
    // Si la demande est terminée
    if (request.status === 'completed' || request.status === 'deactivation_completed') {
      return 'Terminé';
    }
    
    // Si la demande est rejetée
    if (request.status === 'rejected' || request.status === 'handover_rejected' || request.status === 'deactivation_rejected') {
      return 'Rejeté';
    }
    
    return 'En cours';
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des Demandes</h2>
            <p className="text-gray-600 mt-1">Suivi des demandes de création de liaisons</p>
          </div>
          <button 
            onClick={() => setShowRequestForm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2 transition-colors"
          >
            <Plus size={18} />
            <span>Nouvelle liaison</span>
          </button>
        </div>
      </div>



      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client, type ou ID..."
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
                <option value="pending">En attente</option>
                <option value="in_validation">En validation</option>
                <option value="ready_to_start">Prêt à démarrer</option>
                <option value="launched">Lancé</option>
                <option value="in_handover">En handover</option>
                <option value="completed">Terminé</option>
                <option value="rejected">Rejeté</option>
                <option value="deactivation_requested">Désactivation demandée</option>
                <option value="deactivation_approved">Désactivation approuvée</option>
                <option value="deactivation_rejected">Désactivation rejetée</option>
                <option value="deactivation_in_progress">Désactivation en cours</option>
                <option value="deactivation_completed">Désactivation terminée</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

        <div className="space-y-4">
          {filteredRequests.map((request) => {
            return (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* En-tête avec gradient de couleur selon le statut */}
                <div className={`px-6 py-4 ${
                  request.status === 'completed' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200' :
                  request.status === 'rejected' ? 'bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200' :
                  request.status === 'in_progress' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200' :
                  request.status === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200' :
                  'bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        request.status === 'completed' ? 'bg-green-500' :
                        request.status === 'rejected' ? 'bg-red-500' :
                        request.status === 'in_progress' ? 'bg-blue-500' :
                        request.status === 'pending' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{request.clientName}</h3>
                        <p className="text-sm text-gray-600">ID: {request.id} • Créée le {formatDate(request.submittedDate)}</p>
                      </div>
                    </div>
                    
                    {/* Badges de statut et priorité */}
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getPriorityColor(request.priority)}`}>
                        {getPriorityLabel(request.priority)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Contenu principal */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informations de base */}
                    <div className="lg:col-span-2">
                      <div className="space-y-4">
                        {/* Description */}
                        {request.description && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <FileText size={16} className="mr-2" />
                              Description
                            </h4>
                            <p className="text-sm text-gray-700">{request.description}</p>
                          </div>
                        )}
                        
                        {/* Validation en cours */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                            <Clock size={16} className="mr-2" />
                            Validation en cours
                          </h4>
                          <p className="text-sm text-blue-700">{getCurrentValidator(request)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="space-y-4">
                      
                      {/* Actions */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Actions</h4>
                        <div className="space-y-2">
                          {/* Bouton détails */}
                          <button
                            onClick={() => {
                              console.log('Voir détails clicked for:', request.id);
                              const updatedRequest = requests.find(r => r.id === request.id) || request;
                              setSelectedRequest(updatedRequest);
                              setShowRequestDetails(true);
                            }}
                            className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 hover:border-blue-300"
                            title="Voir les détails"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="text-sm font-medium">Voir détails</span>
                          </button>
                          
                                                    {/* Actions conditionnelles */}
                          {request.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowValidation(true);
                              }}
                              className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 border border-purple-200 hover:border-purple-300"
                              title="Valider la demande"
                            >
                              <Shield size={16} />
                              <span className="text-sm font-medium">Valider</span>
                            </button>
                          )}
                          
                          {request.status === 'ready_to_start' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowLaunchForm(true);
                              }}
                              className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300"
                              title="Lancer la liaison"
                            >
                              <Play size={16} />
                              <span className="text-sm font-medium">Lancer</span>
                            </button>
                          )}
                          
                          {request.status === 'launched' && (
                            <button
                              onClick={() => {
                                console.log('=== HANDOVER BUTTON CLICKED ===');
                                console.log('Request ID:', request.id);
                                console.log('Request status:', request.status);
                                console.log('Request data:', request);
                                
                                setSelectedRequest(request);
                                setShowHandoverValidation(true);
                                
                                // Vérifier après un délai
                                setTimeout(() => {
                                  console.log('showHandoverValidation state:', showHandoverValidation);
                                  console.log('selectedRequest state:', selectedRequest);
                                }, 100);
                              }}
                              className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 border border-purple-200 hover:border-purple-300"
                              title="Validation Handover"
                            >
                              <Handshake size={16} />
                              <span className="text-sm font-medium">Handover</span>
                            </button>
                          )}
                          

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredRequests.length === 0 && (
            <div className="p-12 text-center">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune demande trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <RequestForm
          onClose={() => setShowRequestForm(false)}
          onSubmit={(requestData) => {
            if (onAddRequest) {
              onAddRequest(requestData);
            }
            setShowRequestForm(false);
          }}
        />
      )}

      {/* Request Validation Modal */}
      {showValidation && selectedRequest && onValidationUpdate && (
        <RequestValidation
          request={selectedRequest}
          currentUser={currentUser}
          onClose={() => setShowValidation(false)}
          onValidationUpdate={onValidationUpdate}
        />
      )}

      {/* Request Launch Form Modal */}
      {showLaunchForm && selectedRequest && (
        <RequestLaunchForm
          request={selectedRequest}
          onClose={() => setShowLaunchForm(false)}
          onSubmit={(launchData) => {
            if (onValidationUpdate) {
              onValidationUpdate(selectedRequest.id, launchData);
            }
            setShowLaunchForm(false);
          }}
        />
      )}

      {/* Handover Validation Modal - Version Complète */}
      {showHandoverValidation && selectedRequest && (
        <>
          {console.log('=== RENDERING HANDOVER MODAL ===')}
          {console.log('showHandoverValidation:', showHandoverValidation)}
          {console.log('selectedRequest:', selectedRequest)}
          {console.log('selectedRequest ID:', selectedRequest?.id)}
          
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Handshake size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Validation du Handover</h2>
                    <p className="text-sm text-gray-600">Client: {selectedRequest.clientName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHandoverValidation(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-6">
                {/* Informations de la demande */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Détails de la liaison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>ID:</strong> {selectedRequest.id}</div>
                    <div><strong>Client:</strong> {selectedRequest.clientName}</div>
                    <div><strong>Localisation:</strong> {selectedRequest.location}</div>
                    <div><strong>Capacité:</strong> {selectedRequest.capacity}</div>
                    {selectedRequest.vlanClient && <div><strong>VLAN:</strong> {selectedRequest.vlanClient}</div>}
                    {selectedRequest.ipClient && <div><strong>IP Client:</strong> {selectedRequest.ipClient}</div>}
                  </div>
                </div>

                {/* Bon de commande */}
                {selectedRequest.purchaseOrder && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <FileText size={20} className="text-yellow-600" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Bon de commande</h4>
                        <p className="text-lg font-bold text-yellow-800">{selectedRequest.purchaseOrder}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Étapes de validation */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Étapes de validation du handover</h3>
                  
                  {/* Étape 1: Validation Partenaire */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Handshake size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Validation Partenaire</h4>
                          <p className="text-sm text-gray-600">Partenaire technique</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    </div>
                    
                    {/* Actions pour cette étape */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commentaire (optionnel)
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Ajoutez un commentaire sur votre décision..."
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            if (onValidationUpdate) {
                              onValidationUpdate(selectedRequest.id, {
                                status: 'in_handover',
                                handoverSteps: [
                                  {
                                    id: 'partner',
                                    title: 'Validation Partenaire',
                                    role: 'Partenaire technique',
                                    status: 'approved',
                                    validatedBy: currentUser?.name || 'Utilisateur',
                                    validatedAt: new Date().toISOString(),
                                    comment: 'Validation approuvée'
                                  }
                                ]
                              });
                            }
                            dialogService.success('Validation Approuvée', 'Validation Partenaire approuvée !');
                            setShowHandoverValidation(false);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={16} className="inline mr-2" />
                          Approuver
                        </button>
                        <button
                          onClick={() => {
                            if (onValidationUpdate) {
                              onValidationUpdate(selectedRequest.id, {
                                status: 'handover_rejected',
                                handoverSteps: [
                                  {
                                    id: 'partner',
                                    title: 'Validation Partenaire',
                                    role: 'Partenaire technique',
                                    status: 'rejected',
                                    validatedBy: currentUser?.name || 'Utilisateur',
                                    validatedAt: new Date().toISOString(),
                                    comment: 'Validation rejetée'
                                  }
                                ]
                              });
                            }
                            dialogService.success('Validation Rejetée', 'Validation Partenaire rejetée !');
                            setShowHandoverValidation(false);
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={16} className="inline mr-2" />
                          Rejeter
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Étape 2: Validation Chef de Projet */}
                  <div className="border border-gray-200 rounded-lg p-4 opacity-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Validation Chef de Projet</h4>
                          <p className="text-sm text-gray-600">Chef de Projet</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Bloqué
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">En attente de validation de l'étape précédente</p>
                  </div>

                  {/* Étape 3: Validation Chef Maintenance */}
                  <div className="border border-gray-200 rounded-lg p-4 opacity-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Wrench size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Validation Chef Maintenance</h4>
                          <p className="text-sm text-gray-600">Chef de la Maintenance</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Bloqué
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">En attente de validation des étapes précédentes</p>
                  </div>
                </div>

                {/* Actions finales */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowHandoverValidation(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Request Details Modal */}
      {showRequestDetails && selectedRequest && (
        <RequestDetailsModal
          request={requests.find(r => r.id === selectedRequest.id) || selectedRequest}
          isOpen={showRequestDetails}
          onClose={() => setShowRequestDetails(false)}
          calculateSLA={() => ({ level: 'good', daysElapsed: 0, percentage: 100, isOverdue: false, isNearDeadline: false })}
          getSLAColor={() => 'text-emerald-600 bg-emerald-50 border-emerald-200'}
          getSLALabel={() => 'Bon'}
          getSLAProgressColor={() => 'bg-emerald-500'}
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