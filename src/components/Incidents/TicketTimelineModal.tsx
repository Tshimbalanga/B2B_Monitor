import React from 'react';
import { X, Clock, User, Calendar } from 'lucide-react';
import { 
  calculateTicketTimeline, 
  calculateTotalDuration, 
  getCurrentStatusDuration,
  formatDateTime,
  getStatusColor,
  getStatusIcon,
  getStatusLabel
} from '../../utils/ticketTimeline';

interface TicketTimelineModalProps {
  incident: any;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketTimelineModal: React.FC<TicketTimelineModalProps> = ({
  incident,
  isOpen,
  onClose
}) => {
  if (!isOpen || !incident) return null;

  const timeline = calculateTicketTimeline(incident);
  const totalDuration = calculateTotalDuration(incident);
  const currentStatusDuration = getCurrentStatusDuration(incident);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Timeline du Ticket #{incident.id}</h2>
              <p className="text-gray-600 text-sm">Historique complet des changements de statut</p>
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
            <h3 className="font-semibold text-gray-900 mb-3">Informations du Ticket</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Titre</p>
                <p className="font-medium">{incident.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-medium">{incident.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut actuel</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                  {getStatusLabel(incident.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques de durée */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Durée totale</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{totalDuration}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-900">Statut actuel</span>
              </div>
              <p className="text-lg font-bold text-green-900">{currentStatusDuration}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <User size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Étapes</span>
              </div>
              <p className="text-lg font-bold text-purple-900">{timeline.length}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Chronologie des Statuts</h3>
            
            {timeline.map((step, index) => (
              <div key={index} className="relative">
                {/* Ligne de connexion */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300"></div>
                )}
                
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  {/* Icône du statut */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xl">{getStatusIcon(step.status)}</span>
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{step.label}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                        {getStatusLabel(step.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <div>
                          <p className="text-gray-600">Date et heure</p>
                          <p className="font-medium">{formatDateTime(step.timestamp)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User size={14} className="text-gray-400" />
                        <div>
                          <p className="text-gray-600">Utilisateur</p>
                          <p className="font-medium">{step.user}</p>
                        </div>
                      </div>
                    </div>
                    
                    {step.comment && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{step.comment}</p>
                      </div>
                    )}
                    
                    {step.duration && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Clock size={14} className="text-blue-500" />
                        <span className="text-sm text-blue-600 font-medium">
                          Durée dans ce statut: {step.duration}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé des durées */}
          {timeline.length > 1 && (
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Résumé des Durées</h3>
              <div className="space-y-2">
                {timeline.slice(0, -1).map((step, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {step.label} → {timeline[index + 1].label}
                    </span>
                    <span className="font-medium text-gray-900">{step.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};



