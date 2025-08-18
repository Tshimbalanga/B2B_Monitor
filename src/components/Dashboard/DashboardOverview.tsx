import React, { useEffect, useState } from 'react';
import { 
  Network, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Activity
} from 'lucide-react';
import { Connection, Incident, Request, User } from '../../types';

interface DashboardOverviewProps {
  connections: Connection[];
  incidents: Incident[];
  requests: Request[];
  users: User[];
  currentUser: User | null;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  connections, 
  incidents,
  requests,
  users,
  currentUser
}) => {
  const [realTimeData, setRealTimeData] = useState({
    activeConnections: 0,
    avgAvailability: 0,
    openIncidents: 0,
    avgUtilization: 0,
    totalTickets: 0,
    closedTickets: 0,
    pendingRequests: 0,
    activeUsers: 0
  });

  // Calculer les données en temps réel
  useEffect(() => {
    const activeConnections = connections.filter(c => c.status === 'active').length;
    const avgAvailability = connections.reduce((sum, c) => sum + c.availability, 0) / connections.length || 0;
    const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length;
    const avgUtilization = connections.reduce((sum, c) => sum + c.utilization, 0) / connections.length || 0;
    
    // Statistiques des tickets
    const totalTickets = incidents.length;
    const closedTickets = incidents.filter(i => i.status === 'closed' || i.status === 'resolved').length;
    
    // Demandes en attente
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    
    // Utilisateurs actifs
    const activeUsers = users.filter(u => u.isActive).length;

    setRealTimeData({
      activeConnections,
      avgAvailability,
      openIncidents,
      avgUtilization,
      totalTickets,
      closedTickets,
      pendingRequests,
      activeUsers
    });
  }, [connections, incidents, requests, users]);

  const metrics = [
    {
      title: 'Liaisons Actives',
      value: realTimeData.activeConnections,
      total: connections.length,
      icon: Network,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+2',
      trendDirection: 'up' as const,
    },
    {
      title: 'Disponibilité Moyenne',
      value: `${realTimeData.avgAvailability.toFixed(2)}%`,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+0.1%',
      trendDirection: 'up' as const,
    },
    {
      title: 'Incidents Ouverts',
      value: realTimeData.openIncidents,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: '-3',
      trendDirection: 'down' as const,
    },
    {
      title: 'Utilisation Moyenne',
      value: `${realTimeData.avgUtilization.toFixed(0)}%`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+5%',
      trendDirection: 'up' as const,
    },
  ];

  // Nouvelles métriques pour les tickets et demandes
  const additionalMetrics = [
    {
      title: 'Tickets Créés',
      value: realTimeData.totalTickets,
      subtitle: `${realTimeData.closedTickets} fermés`,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      percentage: realTimeData.totalTickets > 0 ? (realTimeData.closedTickets / realTimeData.totalTickets * 100).toFixed(1) : '0',
    },
    {
      title: 'Demandes en Attente',
      value: realTimeData.pendingRequests,
      subtitle: 'En cours de traitement',
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Utilisateurs Actifs',
      value: realTimeData.activeUsers,
      subtitle: 'Connectés',
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h2>
        <p className="text-gray-600 mt-1">Synthèse de l'activité et des performances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trendDirection === 'up' ? TrendingUp : TrendingDown;
          const trendColor = metric.trendDirection === 'up' ? 'text-green-600' : 'text-red-600';
          
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon size={24} className={metric.color} />
                </div>
                <div className={`flex items-center space-x-1 ${trendColor}`}>
                  <TrendIcon size={16} />
                  <span className="text-sm font-medium">{metric.trend}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {metric.value}
                  {metric.total && (
                    <span className="text-lg text-gray-500 font-normal">/{metric.total}</span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{metric.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nouvelles métriques pour tickets et demandes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {additionalMetrics
          .filter(metric => {
            // Filtrer les métriques selon les permissions de l'utilisateur
            if (metric.title === 'Utilisateurs Actifs') {
              return currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
            }
            return true; // Afficher toutes les autres métriques
          })
          .map((metric, index) => {
            const Icon = metric.icon;
            
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon size={24} className={metric.color} />
                  </div>
                  {metric.percentage && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{metric.percentage}%</div>
                      <div className="text-xs text-gray-500">Taux de fermeture</div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                  <p className="text-gray-600 text-sm mt-1">{metric.title}</p>
                  {metric.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Liaisons par Statut</h3>
          <div className="space-y-3">
            {['active', 'in_progress', 'planned', 'suspended'].map((status) => {
              const count = connections.filter(c => c.status === status).length;
              const percentage = connections.length > 0 ? (count / connections.length) * 100 : 0;
              
              const statusColors = {
                active: 'bg-green-500',
                in_progress: 'bg-yellow-500',
                planned: 'bg-blue-500',
                suspended: 'bg-red-500',
              };

              const statusLabels = {
                active: 'Actives',
                in_progress: 'En cours',
                planned: 'Planifiées',
                suspended: 'Suspendues',
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`}></div>
                    <span className="text-sm text-gray-700">{statusLabels[status as keyof typeof statusLabels]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Incidents Récents</h3>
          <div className="space-y-3">
            {incidents.slice(0, 3).map((incident) => {
              const severityColors = {
                low: 'text-green-600 bg-green-50',
                medium: 'text-yellow-600 bg-yellow-50',
                high: 'text-orange-600 bg-orange-50',
                critical: 'text-red-600 bg-red-50',
              };

              const statusColors = {
                open: 'text-red-600 bg-red-50',
                acknowledged: 'text-yellow-600 bg-yellow-50',
                in_progress: 'text-blue-600 bg-blue-50',
                resolved: 'text-green-600 bg-green-50',
                closed: 'text-gray-600 bg-gray-50',
                reopened: 'text-orange-600 bg-orange-50',
              };
              
              return (
                <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityColors[incident.severity]}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[incident.status as keyof typeof statusColors]}`}>
                        {incident.status === 'open' && 'OUVERT'}
                        {incident.status === 'acknowledged' && 'PRIS EN CHARGE'}
                        {incident.status === 'in_progress' && 'EN COURS'}
                        {incident.status === 'resolved' && 'RÉSOLU'}
                        {incident.status === 'closed' && 'FERMÉ'}
                        {incident.status === 'reopened' && 'RÉOUVERT'}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{incident.clientName}</p>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <div>{new Date(incident.reportedDate).toLocaleDateString('fr-FR')}</div>
                    <div>{new Date(incident.reportedDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
            {incidents.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Aucun incident récent
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};