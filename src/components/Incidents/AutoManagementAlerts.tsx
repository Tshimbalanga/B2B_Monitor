import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock
} from 'lucide-react';
import {
  analyzeTicketsForAutoManagement,
  generateUnprocessedAlertMessage,
  generateAutoCloseMessage,
  TicketStatus,
  TicketAutoManagementConfig,
  DEFAULT_CONFIG
} from '../../utils/ticketAutoManagement';

interface AutoManagementAlertsProps {
  incidents: any[];
  currentUser: any;
  onUpdateIncident: (incidentId: string, updateData: any) => void;
  onRefresh: () => void;
}

export const AutoManagementAlerts: React.FC<AutoManagementAlertsProps> = ({
  incidents,
  currentUser,
  onUpdateIncident,
  onRefresh
}) => {
  const [config] = useState<TicketAutoManagementConfig>(DEFAULT_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);

  // Convertir les incidents en format TicketStatus
  const tickets: TicketStatus[] = incidents.map(incident => ({
    id: incident.id,
    status: incident.status,
    resolvedAt: incident.resolution?.resolvedAt || incident.processing?.processedAt,
    acknowledgedAt: incident.acknowledgedAt,
    assignedTo: incident.assignedTo,
    activatedTeam: incident.activatedTeam,
    clientName: incident.clientName,
    title: incident.title,
    slaDeadline: incident.slaDeadline
  }));

  // Analyser les tickets pour la gestion automatique
  const analysis = analyzeTicketsForAutoManagement(tickets, config);

  // Vérifier si l'utilisateur peut voir les alertes
  const canViewAlerts = () => {
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      return true;
    }
    
    if (currentUser.role === 'maintenance') {
      if (currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV') {
        return true; // NOC et SAV voient toutes les alertes
      } else if (currentUser.subDepartment === 'BO' || currentUser.subDepartment === 'FME') {
        // BO et FME voient seulement les alertes qui les concernent
        return analysis.ticketsToAlert.some(ticket => 
          ticket.assignedTo === currentUser.subDepartment || 
          ticket.activatedTeam === currentUser.subDepartment
        );
      }
    }
    
    return false;
  };

  // Clôturer automatiquement un ticket
  const handleAutoClose = async (ticket: TicketStatus) => {
    if (!confirm(`Êtes-vous sûr de vouloir clôturer automatiquement le ticket ${ticket.id} ?`)) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const now = new Date().toISOString();
      const updateData = {
        status: 'closed',
        closedAt: now,
        ticketLifecycle: [
          {
            step: 'auto_closed',
            timestamp: now,
            user: 'Système',
            comment: generateAutoCloseMessage(ticket)
          }
        ]
      };
      
      onUpdateIncident(ticket.id, updateData);
      
      // Rafraîchir après la mise à jour
      setTimeout(() => {
        onRefresh();
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de la clôture automatique:', error);
      setIsProcessing(false);
    }
  };

  // Clôturer automatiquement tous les tickets éligibles
  const handleAutoCloseAll = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir clôturer automatiquement ${analysis.ticketsToClose.length} tickets ?`)) {
      return;
    }

    setIsProcessing(true);
    
    try {
      for (const ticket of analysis.ticketsToClose) {
        await handleAutoClose(ticket);
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Erreur lors de la clôture automatique en lot:', error);
      setIsProcessing(false);
    }
  };

  if (!canViewAlerts()) {
    return null;
  }

  const hasAlerts = analysis.ticketsToClose.length > 0 || analysis.ticketsToAlert.length > 0;

  // Ne rien afficher s'il n'y a pas d'alertes
  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Tickets à clôturer automatiquement */}
      {analysis.ticketsToClose.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Clock size={20} className="text-orange-600" />
              <h4 className="font-semibold text-orange-900">
                Tickets à clôturer automatiquement ({analysis.ticketsToClose.length})
              </h4>
            </div>
            
            {(currentUser.role === 'admin' || currentUser.role === 'super_admin' || 
              currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV') && (
              <button
                onClick={handleAutoCloseAll}
                disabled={isProcessing}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Traitement...' : 'Clôturer tous'}
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {analysis.ticketsToClose.map(ticket => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">#{ticket.id}</span>
                    <span className="text-sm text-gray-600">-</span>
                    <span className="text-gray-700">{ticket.title}</span>
                    <span className="text-sm text-gray-500">({ticket.clientName})</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Résolu depuis plus de {config.autoCloseResolvedAfterHours}h
                  </p>
                </div>
                
                {(currentUser.role === 'admin' || currentUser.role === 'super_admin' || 
                  currentUser.subDepartment === 'NOC' || currentUser.subDepartment === 'SAV') && (
                  <button
                    onClick={() => handleAutoClose(ticket)}
                    disabled={isProcessing}
                    className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    Clôturer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertes pour tickets non traités */}
      {analysis.ticketsToAlert.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle size={20} className="text-red-600" />
            <h4 className="font-semibold text-red-900">
              Alertes - Tickets non traités ({analysis.ticketsToAlert.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {analysis.ticketsToAlert.map(ticket => (
              <div key={ticket.id} className="p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900">#{ticket.id}</span>
                  <span className="text-sm text-gray-600">-</span>
                  <span className="text-gray-700">{ticket.title}</span>
                  <span className="text-sm text-gray-500">({ticket.clientName})</span>
                </div>
                
                <div className="text-sm text-red-700 space-y-1">
                  <p>Équipe responsable: <span className="font-medium">{ticket.assignedTo || ticket.activatedTeam}</span></p>
                  <p>Non traité depuis plus de {config.alertUnprocessedAfterHours}h</p>
                  <p>Échéance SLA: {new Date(ticket.slaDeadline).toLocaleString('fr-FR')}</p>
                </div>
                
                <details className="mt-2">
                  <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                    Voir le message d'alerte complet
                  </summary>
                  <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800 whitespace-pre-line">
                    {generateUnprocessedAlertMessage(ticket)}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
