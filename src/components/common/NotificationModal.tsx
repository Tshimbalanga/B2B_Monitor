import React from 'react';
import { X, AlertCircle, CheckCircle, Clock, FileText, User, Wrench } from 'lucide-react';
import { User as UserType, Incident, Request } from '../../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  incidents: Incident[];
  requests: Request[];
  onNavigateToPage?: (page: string, itemId?: string) => void;
}

interface NotificationItem {
  id: string;
  type: 'incident' | 'request';
  title: string;
  description: string;
  status: string;
  date: string;
  priority?: string;
  severity?: string;
  icon: React.ReactNode;
  color: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  user,
  incidents,
  requests,
  onNavigateToPage
}) => {
  if (!isOpen || !user) return null;

  const getNotificationItems = (): NotificationItem[] => {
    const items: NotificationItem[] = [];

    // Notifications pour les tickets
    const userIncidents = incidents.filter(incident => {
      if ((user.role === 'maintenance' && user.subDepartment === 'FME') || 
          (user.role === 'maintenance' && user.subDepartment === 'BO')) {
        return incident.assignedTo === user.name;
      }
      
      if (user.role === 'client') {
        return incident.clientName === user.name;
      }
      
      if ((user.role === 'maintenance' && user.subDepartment === 'SAV') || 
          (user.role === 'maintenance' && user.subDepartment === 'NOC')) {
        return true;
      }
      
      return false;
    });

    // Ajouter les tickets selon le rôle et le statut
    userIncidents.forEach(incident => {
      let shouldShow = false;
      
      if (user.role === 'client') {
        // Pour les clients : montrer seulement si le ticket est résolu ou fermé (pour information)
        shouldShow = incident.status === 'resolved' || incident.status === 'closed';
      } else if (user.role === 'maintenance') {
        // Pour FME/BO : montrer si le ticket leur est assigné et nécessite une action
        if (incident.assignedTo === user.name) {
          shouldShow = incident.status === 'acknowledged' || incident.status === 'in_progress';
        }
        // Pour SAV/NOC : montrer tous les tickets qui nécessitent une action
        if ((user.subDepartment === 'SAV' || user.subDepartment === 'NOC')) {
          shouldShow = incident.status === 'open' || incident.status === 'acknowledged' || incident.status === 'in_progress';
        }
      }
      
      if (shouldShow) {
        
        let icon, color, statusText;
        
        switch (incident.status) {
          case 'open':
            icon = <AlertCircle size={16} />;
            color = 'text-red-600 bg-red-50';
            statusText = 'Ouvert';
            break;
          case 'acknowledged':
            icon = <Clock size={16} />;
            color = 'text-blue-600 bg-blue-50';
            statusText = 'Acquitté';
            break;
          case 'in_progress':
            icon = <Wrench size={16} />;
            color = 'text-orange-600 bg-orange-50';
            statusText = 'En cours';
            break;
          case 'resolved':
            icon = <CheckCircle size={16} />;
            color = 'text-green-600 bg-green-50';
            statusText = 'Résolu';
            break;
          case 'closed':
            icon = <CheckCircle size={16} />;
            color = 'text-gray-600 bg-gray-50';
            statusText = 'Fermé';
            break;
          default:
            icon = <AlertCircle size={16} />;
            color = 'text-orange-600 bg-orange-50';
            statusText = incident.status;
        }

        items.push({
          id: incident.id,
          type: 'incident',
          title: `Ticket ${incident.id} - ${incident.title}`,
          description: incident.description,
          status: statusText,
          date: incident.reportedDate,
          priority: incident.priority,
          severity: incident.severity,
          icon,
          color
        });
      }
    });

    // Notifications pour les demandes de validation
    const userRequests = requests.filter(request => {
      if (user.role === 'commercial') {
        return request.submittedBy === user.name;
      }
      
      if (user.role === 'project') {
        return request.status === 'in_validation' || 
               request.status === 'ready_to_start' ||
               request.status === 'in_handover' ||
               request.status === 'deactivation_requested';
      }
      
      if (user.role === 'admin' || user.role === 'super_admin') {
        return true;
      }
      
      return false;
    });

    // Ajouter les demandes selon le rôle et le statut
    userRequests.forEach(request => {
      let shouldShow = false;
      
      if (user.role === 'commercial') {
        // Pour les commerciaux : montrer leurs demandes en attente de validation
        shouldShow = request.status === 'pending' || request.status === 'in_validation';
      } else if (user.role === 'project') {
        // Pour les chefs de projet : montrer les demandes qui nécessitent leur validation
        shouldShow = request.status === 'in_validation' || 
                    request.status === 'ready_to_start' ||
                    request.status === 'in_handover' ||
                    request.status === 'deactivation_requested';
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        // Pour les administrateurs : montrer toutes les demandes en attente
        shouldShow = request.status === 'pending' || 
                    request.status === 'in_validation' ||
                    request.status === 'ready_to_start' ||
                    request.status === 'in_handover' ||
                    request.status === 'deactivation_requested';
      }
      
      if (shouldShow) {
        
        let icon, color, statusText;
        
        switch (request.status) {
          case 'pending':
            icon = <Clock size={16} />;
            color = 'text-orange-600 bg-orange-50';
            statusText = 'En attente';
            break;
          case 'in_validation':
            icon = <FileText size={16} />;
            color = 'text-blue-600 bg-blue-50';
            statusText = 'En validation';
            break;
          case 'ready_to_start':
            icon = <CheckCircle size={16} />;
            color = 'text-green-600 bg-green-50';
            statusText = 'Prêt à démarrer';
            break;
          case 'in_handover':
            icon = <User size={16} />;
            color = 'text-purple-600 bg-purple-50';
            statusText = 'En handover';
            break;
          case 'deactivation_requested':
            icon = <AlertCircle size={16} />;
            color = 'text-red-600 bg-red-50';
            statusText = 'Désactivation demandée';
            break;
          default:
            icon = <FileText size={16} />;
            color = 'text-gray-600 bg-gray-50';
            statusText = request.status;
        }

        items.push({
          id: request.id,
          type: 'request',
          title: `Demande ${request.id} - ${request.clientName}`,
          description: request.description,
          status: statusText,
          date: request.submittedDate,
          priority: request.priority,
          icon,
          color
        });
      }
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const notificationItems = getNotificationItems();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!onNavigateToPage) return;

    if (item.type === 'incident') {
      // Naviguer vers la page des incidents
      onNavigateToPage('incidents', item.id);
    } else if (item.type === 'request') {
      // Naviguer vers la page des demandes
      onNavigateToPage('requests', item.id);
    }
    
    // Fermer le modal après la navigation
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">
              {notificationItems.length} notification{notificationItems.length !== 1 ? 's' : ''} pour {user.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {notificationItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
              <p className="text-gray-500">Vous n'avez aucune notification en attente.</p>
            </div>
          ) : (
                         <div className="p-6 space-y-4">
               {notificationItems.map((item) => (
                 <div 
                   key={item.id} 
                   className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => handleNotificationClick(item)}
                   title="Cliquer pour aller à la page correspondante"
                 >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {item.priority && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.color}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                                             <div className="flex items-center justify-between text-xs text-gray-500">
                         <span>Type: {item.type === 'incident' ? 'Ticket' : 'Demande'}</span>
                         <div className="flex items-center space-x-2">
                           <span>{formatDate(item.date)}</span>
                           <span className="text-orange-600 font-medium">Cliquer pour agir →</span>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
