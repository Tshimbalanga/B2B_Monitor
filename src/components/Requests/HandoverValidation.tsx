import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Shield, 
  Users, 
  Wrench,
  FileText,
  Calendar,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  Handshake,
  Building,
  Network,
  Server,
  Settings,
  ArrowRight
} from 'lucide-react';

interface HandoverStep {
  id: string;
  title: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  validatedBy?: string;
  validatedAt?: string;
  icon: React.ReactNode;
  color: string;
  requiredRoles: string[];
}

interface HandoverValidationProps {
  request: any;
  currentUser: any;
  onHandoverUpdate: (requestId: string, handoverData: any) => void;
  onAddConnection?: (connectionData: any) => void;
  onClose: () => void;
}

export const HandoverValidation: React.FC<HandoverValidationProps> = ({ 
  request, 
  currentUser,
  onHandoverUpdate,
  onAddConnection,
  onClose 
}) => {
  console.log('=== HANDOVER VALIDATION COMPONENT INITIALIZED ===');
  console.log('Request:', request);
  console.log('Current User:', currentUser);
  console.log('onHandoverUpdate exists:', !!onHandoverUpdate);
  console.log('onAddConnection exists:', !!onAddConnection);
  console.log('onClose exists:', !!onClose);
  const [handoverSteps, setHandoverSteps] = useState<HandoverStep[]>([
    {
      id: 'partner',
      title: 'Validation Partenaire',
      role: 'Partenaire technique',
      status: 'pending',
      icon: <Handshake size={20} />,
      color: 'text-purple-600 bg-purple-50',
      requiredRoles: ['admin', 'project']
    },
    {
      id: 'project_manager',
      title: 'Validation Chef de Projet',
      role: 'Chef de Projet',
      status: 'pending',
      icon: <Users size={20} />,
      color: 'text-green-600 bg-green-50',
      requiredRoles: ['admin', 'project']
    },
    {
      id: 'maintenance_chief',
      title: 'Validation Chef Maintenance',
      role: 'Chef de la Maintenance',
      status: 'pending',
      icon: <Wrench size={20} />,
      color: 'text-orange-600 bg-orange-50',
      requiredRoles: ['admin', 'maintenance']
    }
  ]);

  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Charger les étapes de handover existantes si elles existent
  useEffect(() => {
    if (request.handoverSteps) {
      setHandoverSteps(request.handoverSteps);
    }
  }, [request.handoverSteps]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'En attente';
    }
  };

  // Vérifier si l'utilisateur peut valider une étape spécifique
  const canValidate = (stepId: string) => {
    const step = handoverSteps.find(s => s.id === stepId);
    if (!step) return false;

    // Vérifier les permissions de rôle
    const hasRolePermission = step.requiredRoles.includes(currentUser?.role);
    if (!hasRolePermission) return false;

    const stepIndex = handoverSteps.findIndex(s => s.id === stepId);
    if (stepIndex === 0) return step.status === 'pending'; // Premier niveau
    
    // Vérifier que les étapes précédentes sont approuvées
    for (let i = 0; i < stepIndex; i++) {
      if (handoverSteps[i].status !== 'approved') {
        return false;
      }
    }
    return step.status === 'pending';
  };

  // Vérifier si l'utilisateur peut voir les détails de validation
  const canViewValidation = (stepId: string) => {
    const step = handoverSteps.find(s => s.id === stepId);
    if (!step) return false;

    // Admin peut tout voir
    if (currentUser?.role === 'admin') return true;

    // Vérifier les permissions de rôle
    return step.requiredRoles.includes(currentUser?.role);
  };

  const handleValidation = async (stepId: string, action: 'approve' | 'reject') => {
    setIsSubmitting(true);
    
    try {
      const updatedSteps = handoverSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            status: (action === 'approve' ? 'approved' : 'rejected') as 'pending' | 'approved' | 'rejected',
            comment: comment.trim(),
            validatedBy: currentUser?.name || 'Utilisateur inconnu',
            validatedAt: new Date().toISOString()
          };
        }
        return step;
      });

      setHandoverSteps(updatedSteps);
      setComment('');

      // Mettre à jour la demande
      const finalStatus = action === 'reject' ? 'handover_rejected' : 
        updatedSteps.every(step => step.status === 'approved') ? 'completed' : 'in_handover';
      
      onHandoverUpdate(request.id, {
        handoverSteps: updatedSteps,
        status: finalStatus,
        lastHandoverValidation: {
          step: stepId,
          action,
          comment: comment.trim(),
          validatedBy: currentUser?.name || 'Utilisateur inconnu',
          validatedAt: new Date().toISOString()
        }
      });

      // Si le handover est complètement approuvé, créer automatiquement la liaison
      if (action === 'approve' && updatedSteps.every(step => step.status === 'approved')) {
        const connectionData = {
          id: `CONN-${Date.now()}`,
          clientId: `CLIENT-${Date.now()}`,
          clientName: request.clientName,
          type: request.typeService?.toLowerCase() || 'fiber',
          status: 'active',
          location: request.location,
          capacity: request.capacity,
          vlan: `VLAN-${request.vlanClient}`,
          ipAddress: request.ipClient,
          site: request.farendSite,
          gateway: request.gateway,
          utilization: 0,
          availability: 99.9,
          createdDate: new Date().toISOString().split('T')[0],
          commissioningDate: new Date().toISOString().split('T')[0],
          sla: '99.9%',
          assignedTo: currentUser?.name || 'Système',
          routerName: request.routerName,
          typeLiaison: request.typeLiaison
        };
        
        if (onAddConnection) {
          onAddConnection(connectionData);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 5000);
        }
      }

    } catch (error) {
      console.error('Erreur lors de la validation du handover:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFullyApproved = handoverSteps.every(step => step.status === 'approved');
  const isRejected = handoverSteps.some(step => step.status === 'rejected');

  return (
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
              <p className="text-sm text-gray-600">Workflow de validation post-lancement</p>
            </div>
          </div>
          <button
            onClick={onClose}
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
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-gray-400" />
                <span><strong>ID:</strong> {request.id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-400" />
                <span><strong>Client:</strong> {request.clientName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-400" />
                <span><strong>Localisation:</strong> {request.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Network size={16} className="text-gray-400" />
                <span><strong>Capacité:</strong> {request.capacity}</span>
              </div>
              {request.vlanClient && (
                <div className="flex items-center space-x-2">
                  <Server size={16} className="text-gray-400" />
                  <span><strong>VLAN:</strong> {request.vlanClient}</span>
                </div>
              )}
              {request.ipClient && (
                <div className="flex items-center space-x-2">
                  <Settings size={16} className="text-gray-400" />
                  <span><strong>IP Client:</strong> {request.ipClient}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations utilisateur */}
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-purple-600" />
              <span className="text-sm text-purple-800">
                <strong>Utilisateur connecté:</strong> {currentUser?.name} ({currentUser?.role})
              </span>
            </div>
          </div>

          {/* Message de succès pour la création de liaison */}
          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm text-green-800">
                  <strong>✅ Liaison créée avec succès !</strong> Les informations du client ont été automatiquement enregistrées dans la liste des liaisons principales.
                </span>
              </div>
            </div>
          )}

          {/* Workflow de validation du handover */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Étapes de validation du handover</h3>
            
            {handoverSteps.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.color}`}>
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.role}</p>
                      <p className="text-xs text-gray-500">
                        Rôles autorisés: {step.requiredRoles.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(step.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                      {getStatusLabel(step.status)}
                    </span>
                  </div>
                </div>

                {/* Message de permission */}
                {step.status === 'pending' && !canValidate(step.id) && canViewValidation(step.id) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={16} className="text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        En attente de validation par un {step.role}
                      </span>
                    </div>
                  </div>
                )}

                {/* Message d'accès refusé */}
                {step.status === 'pending' && !canViewValidation(step.id) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={16} className="text-red-600" />
                      <span className="text-sm text-red-800">
                        Accès restreint - Seuls les {step.requiredRoles.join(', ')} peuvent valider cette étape
                      </span>
                    </div>
                  </div>
                )}

                {/* Détails de validation */}
                {step.validatedBy && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span><strong>Validé par:</strong> {step.validatedBy}</span>
                      <span><strong>Date:</strong> {formatDate(step.validatedAt!)}</span>
                    </div>
                    {step.comment && (
                      <div className="mt-2">
                        <strong>Commentaire:</strong>
                        <p className="text-gray-700 mt-1">{step.comment}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions de validation */}
                {canValidate(step.id) && step.status === 'pending' && (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commentaire (optionnel)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Ajoutez un commentaire sur votre décision..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleValidation(step.id, 'approve')}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCircle size={16} className="inline mr-2" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleValidation(step.id, 'reject')}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle size={16} className="inline mr-2" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                )}

                {/* Indicateur de progression */}
                {index < handoverSteps.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="w-px h-8 bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Statut global */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Statut global du handover</h4>
                <p className="text-sm text-gray-600">
                  {isFullyApproved && "✅ Handover entièrement validé - Projet terminé"}
                  {isRejected && "❌ Handover rejeté"}
                  {!isFullyApproved && !isRejected && "⏳ En cours de validation du handover"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {handoverSteps.filter(step => step.status === 'approved').length} / {handoverSteps.length} étapes validées
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(handoverSteps.filter(step => step.status === 'approved').length / handoverSteps.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions finales */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
