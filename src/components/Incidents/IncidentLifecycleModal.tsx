import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  User, 
  AlertTriangle,
  Wrench,
  Server,
  Activity,
  MessageSquare,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface IncidentLifecycleModalProps {
  incident: any;
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (incidentId: string, updateData: any) => void;
}

export const IncidentLifecycleModal: React.FC<IncidentLifecycleModalProps> = ({ 
  incident, 
  currentUser,
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [comment, setComment] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !incident) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-yellow-600" />;
      case 'pending':
        return <AlertTriangle size={16} className="text-orange-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'created':
        return 'Ticket créé';
      case 'acknowledged':
        return 'Ticket acquitté';
      case 'team_activated':
        return 'Équipe activée';
      case 'investigation':
        return 'Investigation en cours';
      case 'resolution':
        return 'Résolution';
      case 'closed':
        return 'Ticket fermé';
      default:
        return step;
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'created':
        return <AlertTriangle size={16} />;
      case 'acknowledged':
        return <CheckCircle size={16} />;
      case 'team_activated':
        return <Wrench size={16} />;
      case 'investigation':
        return <Activity size={16} />;
      case 'resolution':
        return <Server size={16} />;
      case 'closed':
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const canAcknowledge = () => {
    return currentUser?.role === 'maintenance' && 
           incident.status === 'open' && 
           !incident.ticketLifecycle?.some((step: any) => step.step === 'acknowledged');
  };

  const canActivateTeam = () => {
    return currentUser?.role === 'maintenance' && 
           incident.ticketLifecycle?.some((step: any) => step.step === 'acknowledged') &&
           !incident.ticketLifecycle?.some((step: any) => step.step === 'team_activated');
  };

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    
    try {
      const newLifecycleStep = {
        step: 'acknowledged',
        status: 'completed',
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'Utilisateur inconnu',
        comment: comment.trim() || 'Ticket acquitté par l\'équipe maintenance'
      };

      const updatedLifecycle = [
        ...(incident.ticketLifecycle || []),
        newLifecycleStep
      ];

      onUpdate(incident.id, {
        status: 'acknowledged',
        ticketLifecycle: updatedLifecycle,
        acknowledgedBy: currentUser?.name,
        acknowledgedAt: new Date().toISOString()
      });

      setComment('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erreur lors de l\'acquittement:', error);
      setIsSubmitting(false);
    }
  };

  const handleActivateTeam = async () => {
    if (!selectedTeam) return;
    
    setIsSubmitting(true);
    
    try {
      const newLifecycleStep = {
        step: 'team_activated',
        status: 'completed',
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'Utilisateur inconnu',
        comment: `Équipe ${selectedTeam} activée: ${comment.trim() || 'Activation automatique'}`
      };

      const updatedLifecycle = [
        ...(incident.ticketLifecycle || []),
        newLifecycleStep
      ];

      onUpdate(incident.id, {
        status: 'team_activated',
        ticketLifecycle: updatedLifecycle,
        activatedTeam: selectedTeam,
        activatedAt: new Date().toISOString()
      });

      setComment('');
      setSelectedTeam('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erreur lors de l\'activation d\'équipe:', error);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-50 p-2 rounded-lg">
              <Activity size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cycle de Vie du Ticket</h2>
              <p className="text-gray-600 text-sm">Gestion et suivi du ticket #{incident.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Informations du ticket */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Détails du Ticket</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Titre:</span>
                <span className="font-medium ml-2">{incident.title}</span>
              </div>
              <div>
                <span className="text-gray-600">Client:</span>
                <span className="font-medium ml-2">{incident.clientName}</span>
              </div>
              <div>
                <span className="text-gray-600">Priorité:</span>
                <span className="font-medium ml-2">{incident.priority}</span>
              </div>
              <div>
                <span className="text-gray-600">Statut actuel:</span>
                <span className="font-medium ml-2">{incident.status}</span>
              </div>
            </div>
          </div>

          {/* Cycle de vie du ticket */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Progression du Ticket</h3>
            <div className="space-y-3">
              {incident.ticketLifecycle?.map((step: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                    {getStepIcon(step.step)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{getStepLabel(step.step)}</h4>
                        <p className="text-sm text-gray-600">
                          {step.user} - {formatDate(step.timestamp)}
                        </p>
                        {step.comment && (
                          <p className="text-sm text-gray-700 mt-1">{step.comment}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                        {getStatusIcon(step.status)}
                        <span className="ml-1">{getStatusLabel(step.status)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions disponibles */}
          {currentUser?.role === 'maintenance' && (
            <div className="space-y-4">
              {/* Acquittement du ticket */}
              {canAcknowledge() && (
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h4 className="font-medium text-orange-900 mb-3 flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span>Acquittement du Ticket</span>
                  </h4>
                  <div className="space-y-3">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Commentaire d'acquittement (optionnel)..."
                    />
                    <button
                      onClick={handleAcknowledge}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Acquittement...' : 'Acquitter le Ticket'}
                    </button>
                  </div>
                </div>
              )}

              {/* Activation d'équipe */}
              {canActivateTeam() && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                    <Wrench size={16} />
                    <span>Activation d'Équipe</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Sélectionner l'équipe à activer
                      </label>
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Choisir une équipe</option>
                        <option value="BO">BO (Back Office)</option>
                        <option value="NOC">NOC (Network Operations Center)</option>
                        <option value="FME">FME (Field Maintenance Engineer)</option>
                      </select>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Commentaire d'activation (optionnel)..."
                    />
                    <button
                      onClick={handleActivateTeam}
                      disabled={isSubmitting || !selectedTeam}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Activation...' : `Activer l'équipe ${selectedTeam}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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




