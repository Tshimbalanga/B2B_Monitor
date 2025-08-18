import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Eye,
  X
} from 'lucide-react';
import { NotificationLog, notificationService } from '../../services/NotificationService';

interface NotificationLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicketId?: string;
}

export const NotificationLogsModal: React.FC<NotificationLogsModalProps> = ({
  isOpen,
  onClose,
  selectedTicketId
}) => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<NotificationLog[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    channel: 'all',
    step: 'all',
    dateRange: 'all'
  });
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  useEffect(() => {
    if (isOpen) {
      const allLogs = selectedTicketId 
        ? notificationService.getNotificationLogsForTicket(selectedTicketId)
        : notificationService.getNotificationLogs();
      setLogs(allLogs);
      setFilteredLogs(allLogs);
    }
  }, [isOpen, selectedTicketId]);

  useEffect(() => {
    let filtered = logs;

    // Filtrer par statut
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    // Filtrer par canal
    if (filters.channel !== 'all') {
      filtered = filtered.filter(log => log.channel === filters.channel);
    }

    // Filtrer par étape
    if (filters.step !== 'all') {
      filtered = filtered.filter(log => log.step === filters.step);
    }

    // Filtrer par date
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(log => {
        const logDate = new Date(log.sentAt);
        switch (filters.dateRange) {
          case 'today':
            return logDate >= today;
          case 'yesterday':
            return logDate >= yesterday && logDate < today;
          case 'week':
            return logDate >= weekAgo;
          default:
            return true;
        }
      });
    }

    setFilteredLogs(filtered);
  }, [logs, filters]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail size={16} className="text-blue-500" />;
      case 'sms':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'both':
        return <Bell size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  const getStepLabel = (step: string) => {
    const labels: { [key: string]: string } = {
      'created': 'Créé',
      'acknowledged': 'Acquitté',
      'team_activated': 'Équipe Activée',
      'in_progress': 'En Cours',
      'resolved': 'Résolu',
      'closed': 'Fermé',
      'test': 'Test'
    };
    return labels[step] || step;
  };

  const exportLogs = () => {
    const csvContent = [
      ['ID', 'Ticket ID', 'Étape', 'Template', 'Canal', 'Statut', 'Date', 'Destinataires', 'Contenu'],
      ...filteredLogs.map(log => [
        log.id,
        log.ticketId,
        getStepLabel(log.step),
        log.template,
        log.channel,
        log.status,
        new Date(log.sentAt).toLocaleString('fr-FR'),
        log.recipients.map(r => r.email).join('; '),
        log.content.replace(/\n/g, ' ').substring(0, 100) + '...'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notifications_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Logs de Notifications</h2>
              <p className="text-sm text-gray-600">
                {selectedTicketId ? `Notifications pour le ticket ${selectedTicketId}` : 'Historique des notifications'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Filtres */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="sent">Envoyé</option>
                  <option value="failed">Échec</option>
                  <option value="pending">En attente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
                <select
                  value={filters.channel}
                  onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Email + SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Étape</label>
                <select
                  value={filters.step}
                  onChange={(e) => setFilters({ ...filters, step: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes</option>
                  <option value="created">Créé</option>
                  <option value="acknowledged">Acquitté</option>
                  <option value="team_activated">Équipe Activée</option>
                  <option value="in_progress">En Cours</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="yesterday">Hier</option>
                  <option value="week">Cette semaine</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {filteredLogs.length} notification(s) trouvée(s)
              </div>
              <button
                onClick={exportLogs}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Exporter CSV</span>
              </button>
            </div>
          </div>

          {/* Liste des logs */}
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Aucune notification trouvée</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      {getChannelIcon(log.channel)}
                      <div>
                        <h4 className="font-medium text-gray-900">{log.template}</h4>
                        <p className="text-sm text-gray-500">Ticket {log.ticketId} - {getStepLabel(log.step)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(log.sentAt).toLocaleString('fr-FR')}
                      </span>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Destinataires:</span>
                      <div className="mt-1">
                        {log.recipients.map((recipient, index) => (
                          <div key={recipient.id} className="text-gray-900">
                            {recipient.name} ({recipient.email})
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Contenu:</span>
                      <p className="mt-1 text-gray-900 line-clamp-2">
                        {log.content.substring(0, 100)}...
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut:</span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'sent' ? 'bg-green-100 text-green-800' :
                          log.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.status === 'sent' ? 'Envoyé' : 
                           log.status === 'failed' ? 'Échec' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Détails de la notification</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informations générales</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="text-gray-900">{selectedLog.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket:</span>
                      <span className="text-gray-900">{selectedLog.ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Étape:</span>
                      <span className="text-gray-900">{getStepLabel(selectedLog.step)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Template:</span>
                      <span className="text-gray-900">{selectedLog.template}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Canal:</span>
                      <span className="text-gray-900">{selectedLog.channel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <span className="text-gray-900">{selectedLog.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date d'envoi:</span>
                      <span className="text-gray-900">
                        {new Date(selectedLog.sentAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Destinataires</h4>
                  <div className="space-y-2">
                    {selectedLog.recipients.map((recipient) => (
                      <div key={recipient.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-gray-900">{recipient.name}</div>
                        <div className="text-sm text-gray-600">{recipient.email}</div>
                        {recipient.phone && (
                          <div className="text-sm text-gray-600">{recipient.phone}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {recipient.role} - {recipient.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contenu du message</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                    {selectedLog.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
